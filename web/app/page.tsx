"use client";
import { useState } from "react";
import BirthForm from "@/components/BirthForm";
import PlanetsTable from "@/components/PlanetsTable";
import AspectsTable from "@/components/AspectsTable";
import ForecastBlock from "@/components/ForecastBlock";
import AstroChart from "@/components/AstroChart";
import { Chart, TransitSet, Forecast, Aspect } from "@/types";
import { buildAspects } from "@/lib/aspects";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Profile = { date: string; time?: string; place: string; locale: "ru"|"en"; unknownTime?: boolean };

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [natal, setNatal] = useState<Chart | null>(null);
  const [transits, setTransits] = useState<TransitSet | null>(null);
  const [aspectsNatal, setAspectsNatal] = useState<Aspect[]>([]);
  const [aspectsTransitToNatal, setAspectsTransitToNatal] = useState<Aspect[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [savedProfile, setSavedProfile] = useLocalStorage<Profile | null>("astro.profile", null);

  async function handleSubmit(p: { date: string; time?: string; place: string; question: string; locale: "ru"|"en"; unknownTime?: boolean }) {
    setLoading(true); setError(null); setForecast(null);
    try {
      setSavedProfile({ date: p.date, time: p.time, place: p.place, locale: p.locale, unknownTime: p.unknownTime });

      const geo = await fetch("/api/geo", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ place: p.place })}).then(r=>r.json());
      if (!geo?.lat) throw new Error("Не удалось определить координаты/часовой пояс");

      const natalRes = await fetch("/api/astro/natal", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
        date: p.date, time: p.time, lat: geo.lat, lon: geo.lon, tz: geo.tz, houseSystem: "Placidus"
      })});
      if (!natalRes.ok) throw new Error("Ошибка расчёта натала");
      const natal = await natalRes.json() as Chart;

      const today = new Date().toISOString().slice(0,10);
      const transitsRes = await fetch("/api/astro/transits", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ dateUTC: today })});
      if (!transitsRes.ok) throw new Error("Ошибка расчёта транзитов");
      const transits = await transitsRes.json() as TransitSet;

      setNatal(natal);
      setTransits(transits);

      const an = buildAspects(natal.planets);
      const atn = buildAspects(transits.planets, natal.planets);
      setAspectsNatal(an);
      setAspectsTransitToNatal(atn);

      const forecastRes = await fetch("/api/forecast", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          locale: p.locale,
          question: p.question || "general",
          natal: { ...natal, aspects: an },
          transits: { ...transits, aspectsToNatal: atn }
        })
      });
      if (!forecastRes.ok) {
        const err = await forecastRes.json().catch(()=>({error:""}));
        throw new Error(err.error || "Ошибка генерации прогноза");
      }
      const forecast = await forecastRes.json() as Forecast;
      setForecast(forecast);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_APP_NAME || "Astro Forecast"}</h1>
        <div className="text-sm text-zinc-500">
          {savedProfile ? `Профиль: ${savedProfile.place}, ${savedProfile.date}${savedProfile.time ? " "+savedProfile.time : ""}` : "Профиль не сохранён"}
        </div>
      </header>

      <BirthForm onSubmit={handleSubmit} initial={savedProfile ? {
        date: savedProfile.date, time: savedProfile.time, place: savedProfile.place, locale: savedProfile.locale, unknownTime: savedProfile.unknownTime
      } : undefined} />

      {loading && <div>Загрузка…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {natal && (
        <div className="grid gap-6">
          <AstroChart
            natal={natal}
            transits={transits}
            aspectsNatal={aspectsNatal}
            aspectsTransitToNatal={aspectsTransitToNatal}
          />
        </div>
      )}

      {natal && (
        <div className="grid md:grid-cols-2 gap-6">
          <PlanetsTable planets={natal.planets} title="Натальные позиции" />
          {transits ? <PlanetsTable planets={transits.planets} title={`Текущие транзиты (${transits.dateUTC})`} /> : null}
        </div>
      )}

      {natal && (
        <>
          <AspectsTable title="Аспекты в натале" aspects={aspectsNatal} />
          {transits ? <AspectsTable title="Транзиты к наталу" aspects={aspectsTransitToNatal} /> : null}
        </>
      )}

      <ForecastBlock forecast={forecast} />

      <footer className="pt-8 text-xs text-zinc-500">
        Данные эфемерид: Swiss Ephemeris. Прогноз генерируется ИИ и не является абсолютной истиной.
      </footer>
    </div>
  );
}
