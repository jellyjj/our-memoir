import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "couple-auth";
const PASSWORD_HASH = bcrypt.hashSync(process.env.SITE_PASSWORD || "loveyou", 10);

export async function verifyPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, PASSWORD_HASH);
}

export async function createSession() {
  const token = bcrypt.hashSync(Date.now().toString(), 8);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookie = (await cookies()).get(COOKIE_NAME);
  return !!cookie?.value;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}
