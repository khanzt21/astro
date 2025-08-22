import { PlanetPosition } from "@/types";
import { signOf, degInSign } from "@/lib/astro";

export default function PlanetsTable({ planets, title }: { planets: PlanetPosition[]; title: string }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <table className="w-full text-sm border">
        <thead><tr className="bg-zinc-100 dark:bg-zinc-800">
          <th className="p-2 text-left">Планета</th>
          <th className="p-2 text-left">Знак</th>
          <th className="p-2 text-left">Градус</th>
        </tr></thead>
        <tbody>
          {planets.map(p => {
            const sign = signOf(p.lon);
            const deg = degInSign(p.lon).toFixed(2);
            return (
              <tr key={p.body} className="border-t">
                <td className="p-2">{p.body}</td>
                <td className="p-2">{sign}</td>
                <td className="p-2">{deg}°</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
