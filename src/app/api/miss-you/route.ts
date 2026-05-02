import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [records, counts] = await Promise.all([
    prisma.missYou.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    }),
    prisma.missYou.groupBy({
      by: ["fromWho"],
      _count: true,
    }),
  ]);

  const fromA = counts.find((c) => c.fromWho === "A")?._count ?? 0;
  const fromB = counts.find((c) => c.fromWho === "B")?._count ?? 0;

  return NextResponse.json({
    records,
    stats: { total: fromA + fromB, fromA, fromB },
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
