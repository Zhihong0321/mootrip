import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: "default", autoDateMode: false },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { autoDateMode, magicEffectFrequency } = body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: { 
        autoDateMode: autoDateMode !== undefined ? autoDateMode : undefined,
        magicEffectFrequency: magicEffectFrequency !== undefined ? magicEffectFrequency : undefined
      },
      create: { 
        id: "default", 
        autoDateMode: autoDateMode ?? false, 
        magicEffectFrequency: magicEffectFrequency ?? "mild" 
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
