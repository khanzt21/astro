export type PlanetName =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto"
  | "Chiron" | "N.Node";

export type PlanetPosition = {
  body: PlanetName;
  lon: number; // 0..360
  lat: number; // ecliptic latitude
  speed: number;
};

export type Houses = {
  system: "Placidus" | "WholeSign";
  cusps: number[]; // length 12, in degrees 0..360
  asc: number; // 0..360
  mc: number;  // 0..360
};

export type Chart = {
  planets: PlanetPosition[];
  houses?: Houses | null;
  meta: {
    datetimeUTC: string;
    lat: number;
    lon: number;
    tz: string;
    jd_ut?: number;
  };
};

export type AspectType = "conj" | "opp" | "tri" | "sqr" | "sex" | "qui";
export type Aspect = {
  a: PlanetName;
  b: PlanetName;
  type: AspectType;
  orb: number;
  exact: boolean;
};

export type TransitSet = {
  dateUTC: string;
  planets: PlanetPosition[];
};

export type Forecast = {
  language: "ru" | "en";
  summary: string;
  themes: { topic: string; text: string }[];
  timing: { from: string; to: string };
  advice: string[];
  risk_level: number;    // 1..5
  confidence: number;    // 0..1
  disclaimers?: string[];
};
