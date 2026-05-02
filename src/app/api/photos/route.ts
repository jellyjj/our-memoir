import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  const { url, description } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "缺少图片地址" }, { status: 400 });
  }

  const photo = await prisma.photo.create({
    data: { url, description: description || null },
  });

  return NextResponse.json(photo);
}

export async function PUT(request: NextRequest) {
  const { id, pinned, description } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }

  const photo = await prisma.photo.update({
    where: { id },
    data: {
      ...(pinned !== undefined ? { pinned } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  return NextResponse.json(photo);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }

  await prisma.photo.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
