import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const memories = await prisma.memory.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(memories);
}

export async function POST(request: NextRequest) {
  const { title, content, date, photos } = await request.json();

  if (!title || !date) {
    return NextResponse.json({ error: "标题和日期为必填项" }, { status: 400 });
  }

  const memory = await prisma.memory.create({
    data: {
      title,
      content: content || "",
      date: new Date(date),
      photos: JSON.stringify(photos || []),
    },
  });

  return NextResponse.json(memory);
}

export async function PUT(request: NextRequest) {
  const { id, title, content, date, photos } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }

  const memory = await prisma.memory.update({
    where: { id },
    data: {
      title,
      content: content || "",
      date: new Date(date),
      photos: JSON.stringify(photos || []),
    },
  });

  return NextResponse.json(memory);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }

  await prisma.memory.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
