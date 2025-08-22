import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { place } = await req.json();
  if (!place) return NextResponse.json({ error: "place required" }, { status: 400 });
  const base = process.env.ASTRO_SERVICE_URL!;
  const r = await fetch(`${base}/resolve?place=${encodeURIComponent(place)}`);
  if (!r.ok) return NextResponse.json({ error: "geo failed" }, { status: 500 });
  const data = await r.json();
  if (data?.error) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}
