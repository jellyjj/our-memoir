import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const memoryId = searchParams.get("memoryId");

  if (!memoryId) {
    return NextResponse.json({ error: "缺少 memoryId" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { memoryId: parseInt(memoryId) },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const { memoryId, author, content, sticker, image } = await request.json();

  if (!memoryId || !author) {
    return NextResponse.json({ error: "缺少 memoryId 或 author" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      memoryId,
      author,
      content: content || "",
      sticker: sticker || null,
      image: image || null,
    },
  });

  return NextResponse.json(comment);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }

  await prisma.comment.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
