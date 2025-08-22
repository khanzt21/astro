import { PlanetName } from "@/types";

export const PLANETS: PlanetName[] = [
  "Sun","Moon","Mercury","Venus","Mars",
  "Jupiter","Saturn","Uranus","Neptune","Pluto",
  "Chiron","N.Node"
];

export function signOf(lon: number): string {
  const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  return signs[Math.floor((lon % 360) / 30)];
}
export function degInSign(lon: number): number {
  const d = lon % 360;
  return d - Math.floor(d / 30) * 30;
}

export function normalizeAngle(a: number): number {
  let x = a % 360;
  if (x < 0) x += 360;
  return x;
}
