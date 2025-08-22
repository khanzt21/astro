import { Aspect, AspectType, PlanetPosition } from "@/types";

const ASPECTS: Record<AspectType, { angle: number; orb: number }> = {
  conj: { angle: 0,  orb: 8 },
  opp:  { angle: 180,orb: 8 },
  tri:  { angle: 120,orb: 7 },
  sqr:  { angle: 90, orb: 6 },
  sex:  { angle: 60, orb: 5 },
  qui:  { angle: 150,orb: 3 }
};

function angleDelta(a: number, b: number) {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function buildAspects(planetsA: PlanetPosition[], planetsB?: PlanetPosition[]): Aspect[] {
  const res: Aspect[] = [];
  const arrB = planetsB ?? planetsA;
  for (let i = 0; i < planetsA.length; i++) {
    for (let j = planetsB ? 0 : i + 1; j < arrB.length; j++) {
      const pa = planetsA[i];
      const pb = arrB[j];
      if (pa.body === pb.body && !planetsB) continue;
      const delta = angleDelta(pa.lon, pb.lon);
      for (const [type, { angle, orb }] of Object.entries(ASPECTS) as [AspectType, {angle:number;orb:number}][]) {
        const diff = Math.abs(delta - angle);
        if (diff <= orb) {
          res.push({
            a: pa.body,
            b: pb.body,
            type,
            orb: +diff.toFixed(2),
            exact: diff < 0.2
          });
        }
      }
    }
  }
  return res;
}
