import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const base = process.env.ASTRO_SERVICE_URL!;
  const r = await fetch(`${base}/transits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
