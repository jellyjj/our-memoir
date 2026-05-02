import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const diaries = await prisma.diary.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(diaries);
}

export async function POST(request: NextRequest) {
  const { title, content, mood, date, author } = await request.json();

  if (!title || !content || !date || !author) {
    return NextResponse.json({ error: "请填写所有必填项" }, { status: 400 });
  }

  const diary = await prisma.diary.create({
    data: {
      title,
      content,
      mood: mood || "happy",
      date: new Date(date),
      author,
    },
  });

  return NextResponse.json(diary);
}

export async function PUT(request: NextRequest) {
  const { id, title, content, mood, date, author } = await request.json();

  const diary = await prisma.diary.update({
    where: { id },
    data: { title, content, mood, date: new Date(date), author },
  });

  return NextResponse.json(diary);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }

  await prisma.diary.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
