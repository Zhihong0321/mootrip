import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  const location = await prisma.location.update({
    where: { id },
    data,
  });
  return NextResponse.json(location);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.location.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}
