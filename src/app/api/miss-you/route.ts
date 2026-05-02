import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.missYou.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const total = await prisma.missYou.count();
  const fromA = await prisma.missYou.count({ where: { fromWho: "A" } });
  const fromB = total - fromA;

  return NextResponse.json({
    records,
    stats: { total, fromA, fromB },
  });
}

export async function POST(request: NextRequest) {
  const { fromWho, message } = await request.json();

  if (!fromWho) {
    return NextResponse.json({ error: "请指定谁在想对方" }, { status: 400 });
  }

  const record = await prisma.missYou.create({
    data: {
      fromWho,
      message: message || null,
    },
  });

  return NextResponse.json(record);
}
