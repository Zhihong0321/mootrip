import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { accessCode } = await req.json();

    // AUTO-INIT: If no profiles exist, create default Superadmin
    const profileCount = await prisma.profile.count();
    if (profileCount === 0) {
      await prisma.profile.create({
        data: {
          name: "Superadmin",
          accessCode: "admin888",
          role: "admin",
        },
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { accessCode },
    });

    if (!profile) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    // Set cookie
    (await cookies()).set("profile_session", profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
