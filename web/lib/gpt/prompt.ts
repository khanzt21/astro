import { Chart, TransitSet } from "@/types";

export function buildSystemPrompt() {
  return "Вы — астролог-консультант. На вход получаете JSON с натальной картой и транзитами. Верните прогноз строго в JSON по схеме: {language, summary, themes:[{topic,text}], timing:{from,to}, advice:[], risk_level(1..5), confidence(0..1), disclaimers?}. Пишите на языке locale. Будьте прикладны, без фатализма, избегайте медицины/юридических советов.";
}

export function buildUserPayload(params: {
  locale: "ru" | "en";
  question: string;
  natal: Chart & { aspects?: any };
  transits: TransitSet & { aspectsToNatal?: any };
}) {
  const { locale, question, natal, transits } = params;
  return JSON.stringify({
    locale,
    question,
    natal,
    transits,
    style_prefs: { tone: "supportive", length: "medium", avoid: "medical/legal" }
  });
}
