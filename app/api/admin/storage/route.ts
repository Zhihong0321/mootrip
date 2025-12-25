import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { promisify } from "util";

export const dynamic = "force-dynamic";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Helper to recursively get all files
async function getFiles(dir: string): Promise<string[]> {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
}

// Determine storage root
function getStorageRoot() {
  return process.env.NODE_ENV === "production"
    ? "/storage"
    : path.join(process.cwd(), "public", "uploads");
}

export async function GET() {
  try {
    const storageRoot = getStorageRoot();
    
    // 1. Check if storage exists
    if (!fs.existsSync(storageRoot)) {
        return NextResponse.json({
            totalSize: 0,
            fileCount: 0,
            orphans: [],
            message: "Storage directory not found"
        });
    }

    // 2. Get all files on disk
    const allFiles = await getFiles(storageRoot);

    // 3. Get all known files from DB
    const photos = await prisma.photo.findMany({
        select: { thumbnail: true, medium: true, full: true }
    });

    const validPaths = new Set<string>();
    
    // Add DB files to valid set
    photos.forEach(p => {
        // DB paths are like "/uploads/full/abc.jpg"
        // We need to match them to the storage root structure
        // In Prod: /storage/uploads/full/abc.jpg
        // In Dev: public/uploads/full/abc.jpg
        
        // Normalize DB path to filename/suffix
        // The DB stores paths relative to web root, typically starting with /uploads/
        if (p.thumbnail) validPaths.add(path.normalize(p.thumbnail).replace(/^\\uploads\\|^\/uploads\//, ""));
        if (p.medium) validPaths.add(path.normalize(p.medium).replace(/^\\uploads\\|^\/uploads\//, ""));
        if (p.full) validPaths.add(path.normalize(p.full).replace(/^\\uploads\\|^\/uploads\//, ""));
    });

    // Add System files to valid set
    validPaths.add("dev.db");
    validPaths.add("dev.db-journal");
    validPaths.add("dev.db-shm");
    validPaths.add("dev.db-wal"); // SQLite WAL files

    const orphans: { path: string, size: number, name: string }[] = [];
    let totalSize = 0;

    for (const filePath of allFiles) {
        const stats = await stat(filePath);
        totalSize += stats.size;

        // Get relative path from storage root to compare
        // Prod: /storage/uploads/full/abc.jpg -> uploads/full/abc.jpg (Wait, DB has just full/abc.jpg logic?)
        // Let's look at how DB stores it: "/uploads/thumbnails/uuid-name.webp"
        
        const relativeToRoot = path.relative(storageRoot, filePath);
        const filename = path.basename(filePath);
        
        // Logic check:
        // If we are in PROD, storageRoot is /storage.
        // Files are at /storage/uploads/...
        // DB says /uploads/...
        
        // If we are in DEV, storageRoot is public/uploads
        // Files are at public/uploads/...
        // DB says /uploads/...
        
        // So we need to match the END of the path.
        // A simple robust way: check if the filename exists in our valid set? 
        // No, filename collisions possible.
        
        // Better: check if the 'relativeToRoot' is roughly contained in our valid paths?
        // Or reconstruct the valid absolute path.
        
        let isKnown = false;
        
        // Check exact system matches (db files are at root of /storage usually)
        if (validPaths.has(filename) && path.dirname(relativeToRoot) === ".") {
             isKnown = true;
        }

        // Check photo matches
        // For photos, the DB path is "/uploads/"
        // On Disk (Prod), it's "/storage/uploads/"
        // On Disk (Dev), it's "public/uploads/"
        
        // So if filePath ends with the DB path, it's valid.
        // But DB path starts with /uploads.
        
        if (!isKnown) {
             // We iterate validPaths which are stripped of /uploads/ prefix in the Set logic above?
             // No, let's fix the Set logic to be simpler.
        }
    }
    
    // RESTART LOGIC for matching:
    // Let's store strict suffixes in the Set.
    const validSuffixes = new Set<string>();
    photos.forEach(p => {
        if(p.thumbnail) validSuffixes.add(p.thumbnail); // "/uploads/thumbnails/..."
        if(p.medium) validSuffixes.add(p.medium);
        if(p.full) validSuffixes.add(p.full);
    });
    
    // System files
    const systemFiles = ["dev.db", "dev.db-journal", "dev.db-shm", "dev.db-wal"];

    // Re-iterate
    const orphansList = [];
    
    for (const filePath of allFiles) {
        const stats = await stat(filePath);
        const relativeToRoot = path.relative(storageRoot, filePath); // e.g. "uploads/full/abc.jpg" or "dev.db"
        const normalizedRel = "/" + relativeToRoot.replace(/\\/g, "/"); // "/uploads/full/abc.jpg" or "/dev.db" (Note: DB paths start with /)

        let isValid = false;

        // Check system files (at root)
        if (systemFiles.includes(path.basename(filePath)) && path.dirname(relativeToRoot) === ".") {
            isValid = true;
        }
        
        // Check photos
        // If normalizedRel is exactly in validSuffixes?
        // DB: "/uploads/thumbnails/x.jpg"
        // Disk (Prod): /storage/uploads/thumbnails/x.jpg -> relative: uploads/thumbnails/x.jpg -> norm: /uploads/thumbnails/x.jpg. MATCH.
        
        // Disk (Dev): public/uploads/thumbnails/x.jpg -> relative: thumbnails/x.jpg (because root is public/uploads)
        // Wait, logic specific to environment.
        
        if (process.env.NODE_ENV === "production") {
             if (validSuffixes.has(normalizedRel)) isValid = true;
        } else {
             // In dev, root is public/uploads.
             // normalizedRel is "/thumbnails/x.jpg"
             // DB is "/uploads/thumbnails/x.jpg"
             // So we check if DB path ends with normalizedRel
             // Actually, just check if normalizedRel (without leading slash) is part of DB path
             const suffix = normalizedRel.substring(1); // "thumbnails/x.jpg"
             if (validSuffixes.has("/uploads/" + suffix)) isValid = true;
        }

        if (!isValid) {
            orphansList.push({
                path: filePath, // Absolute path for deletion
                displayPath: relativeToRoot,
                size: stats.size,
                name: path.basename(filePath)
            });
        }
    }

    return NextResponse.json({
        totalSize,
        fileCount: allFiles.length,
        orphans: orphansList
    });

  } catch (error) {
    console.error("Storage scan error:", error);
    return NextResponse.json({ error: "Failed to scan storage" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const { files } = await req.json(); // Array of absolute paths
        
        if (!Array.isArray(files)) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        let deletedCount = 0;
        let freedSpace = 0;

        for (const file of files) {
            try {
                // Security check: ensure file is within allowed directories
                const storageRoot = getStorageRoot();
                if (!file.startsWith(storageRoot)) {
                    console.warn(`Attempt to delete file outside storage: ${file}`);
                    continue;
                }

                const stats = await stat(file);
                freedSpace += stats.size;
                await unlink(file);
                deletedCount++;
            } catch (e) {
                console.error(`Failed to delete ${file}`, e);
            }
        }

        return NextResponse.json({ success: true, deletedCount, freedSpace });

    } catch (error) {
         return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
