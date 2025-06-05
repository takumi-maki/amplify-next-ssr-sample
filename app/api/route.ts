import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return NextResponse.json({ message: "test api", randChar: Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") });
}
