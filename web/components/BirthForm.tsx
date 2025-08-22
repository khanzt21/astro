"use client";
import { useState } from "react";

type Props = {
  onSubmit: (payload: {
    date: string; time?: string; place: string; question: string; locale: "ru"|"en"; unknownTime?: boolean;
  }) => void;
  initial?: { date?: string; time?: string; place?: string; question?: string; locale?: "ru"|"en"; unknownTime?: boolean };
};

export default function BirthForm({ onSubmit, initial }: Props) {
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.time || "");
  const [place, setPlace] = useState(initial?.place || "");
  const [question, setQuestion] = useState(initial?.question || "");
  const [locale, setLocale] = useState<"ru"|"en">(initial?.locale || "ru");
  const [unknownTime, setUnknownTime] = useState<boolean>(!!initial?.unknownTime);

  return (
    <form className="space-y-3" onSubmit={(e)=>{e.preventDefault(); onSubmit({ date, time: unknownTime ? undefined : (time || undefined), place, question, locale, unknownTime });}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Дата рождения</label>
          <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm mb-1">Время</label>
          <div className="flex gap-2 items-center">
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="flex-1 border rounded px-3 py-2" disabled={unknownTime}/>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={unknownTime} onChange={e=>setUnknownTime(e.target.checked)} />
              Не знаю время
            </label>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Место рождения (город)</label>
        <input required value={place} onChange={e=>setPlace(e.target.value)} placeholder="Москва" className="w-full border rounded px-3 py-2"/>
      </div>
      <div>
        <label className="block text-sm mb-1">Ваш вопрос</label>
        <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="финансы сегодня" className="w-full border rounded px-3 py-2"/>
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm">Язык</label>
        <select value={locale} onChange={e=>setLocale(e.target.value as any)} className="border rounded px-2 py-1">
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>
      <button className="bg-blue-600 text-white rounded px-4 py-2">Рассчитать</button>
    </form>
  );
}
