import { Aspect } from "@/types";

export default function AspectsTable({ aspects, title }: { aspects: Aspect[]; title: string }) {
  if (!aspects.length) return null;
  const aspectName = (t: string) => ({conj:"Соединение", opp:"Оппозиция", tri:"Тригон", sqr:"Квадрат", sex:"Секстиль", qui:"Квинконс"} as any)[t] || t;
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <table className="w-full text-sm border">
        <thead><tr className="bg-zinc-100 dark:bg-zinc-800">
          <th className="p-2 text-left">A</th>
          <th className="p-2 text-left">Аспект</th>
          <th className="p-2 text-left">B</th>
          <th className="p-2 text-left">Орб</th>
        </tr></thead>
        <tbody>
          {aspects.map((a,i)=>(
            <tr key={i} className="border-t">
              <td className="p-2">{a.a}</td>
              <td className="p-2">{aspectName(a.type)}</td>
              <td className="p-2">{a.b}</td>
              <td className="p-2">{a.orb}°{a.exact ? " (точн.)" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
