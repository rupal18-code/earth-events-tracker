import { NextResponse } from "next/server";

const EONET = "https://eonet.gsfc.nasa.gov/api/v3/events";

// EONET geometry can be a Point or a Polygon; dig down to the first [lon, lat] pair
function firstPoint(coords) {
  let c = coords;
  while (Array.isArray(c[0])) c = c[0];
  return c;
}

function normalize(e) {
  const geo = e.geometry?.at(-1); // most recent position
  const cat = e.categories?.[0];
  if (!geo || !cat) return null;
  const [lon, lat] = firstPoint(geo.coordinates);
  return {
    id: e.id,
    title: e.title,
    categoryId: cat.id,
    category: cat.title,
    date: geo.date,
    lat,
    lon,
    link: e.sources?.[0]?.url || e.link,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(parseInt(searchParams.get("days")) || 30, 1), 365);

  try {
    const res = await fetch(`${EONET}?status=open&days=${days}&limit=500`, {
      next: { revalidate: 600 }, // cache for 10 minutes
    });
    if (!res.ok) throw new Error(`EONET responded with ${res.status}`);
    const data = await res.json();
    const events = data.events.map(normalize).filter(Boolean);
    return NextResponse.json({ events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load events from NASA." }, { status: 502 });
  }
}
