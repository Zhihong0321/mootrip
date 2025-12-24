import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();
  
  if (data.date) data.date = new Date(data.date);

  const day = await prisma.day.update({
    where: { id },
    data,
  });
  return NextResponse.json(day);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.day.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}
