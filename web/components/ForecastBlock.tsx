import { Forecast } from "@/types";

export default function ForecastBlock({ forecast }: { forecast: Forecast | null }) {
  if (!forecast) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Прогноз</h3>
      <p className="text-sm">{forecast.summary}</p>
      {forecast.themes?.length ? (
        <div className="space-y-2">
          {forecast.themes.map((t,i)=>(
            <div key={i}>
              <div className="font-medium">{t.topic}</div>
              <div className="text-sm">{t.text}</div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="text-xs text-zinc-500">
        Период: {forecast.timing.from} — {forecast.timing.to} • Риск: {forecast.risk_level}/5 • Уверенность: {(forecast.confidence*100).toFixed(0)}%
      </div>
      {forecast.advice?.length ? (
        <ul className="list-disc list-inside text-sm">
          {forecast.advice.map((a,i)=><li key={i}>{a}</li>)}
        </ul>
      ) : null}
      {forecast.disclaimers?.length ? (
        <div className="text-xs text-zinc-500">
          {forecast.disclaimers.join(" ")}
        </div>
      ) : null}
    </div>
  );
}
