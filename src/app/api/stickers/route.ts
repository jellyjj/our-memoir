import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";

const STICKERS_DIR = path.join(process.cwd(), "public", "stickers");

export async function GET() {
  try {
    await mkdir(STICKERS_DIR, { recursive: true });
    const files = await readdir(STICKERS_DIR);
    const imageFiles = files.filter((f) =>
      /\.(gif|png|jpg|jpeg|webp|svg)$/i.test(f)
    );
    const stickers = imageFiles.map((f) => `/stickers/${f}`);
    return NextResponse.json(stickers);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "没有文件" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(STICKERS_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(STICKERS_DIR, fileName);

  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/stickers/${fileName}` });
}
