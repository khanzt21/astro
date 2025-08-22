from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Optional, Literal
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import pytz
import datetime as dt
import swisseph as swe
import os

app = FastAPI(title="Astro Swiss Ephemeris Service")
EPHE_PATH = os.environ.get("EPHE_PATH", "./ephe")
swe.set_ephe_path(EPHE_PATH)

geolocator = Nominatim(user_agent="astro_service")
tzfinder = TimezoneFinder()

PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
    "Chiron": swe.CHIRON,
    "N.Node": swe.MEAN_NODE
}

class NatalReq(BaseModel):
    date: str  # YYYY-MM-DD
    time: Optional[str] = None  # HH:MM
    lat: float
    lon: float
    tz: str  # IANA
    houseSystem: Literal["Placidus","WholeSign"] = "Placidus"

class TransitReq(BaseModel):
    dateUTC: str  # YYYY-MM-DD
    timeUTC: Optional[str] = None  # HH:MM

def to_jd_ut(dt_utc: dt.datetime) -> float:
    hour = dt_utc.hour + dt_utc.minute/60 + dt_utc.second/3600
    return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour, swe.GREG_CAL)

def calc_planets(jd_ut: float):
    res = []
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    for name, pid in PLANETS.items():
        lon, lat, dist, lon_speed, lat_speed, dist_speed = swe.calc_ut(jd_ut, pid, flags)
        res.append({
            "body": name,
            "lon": float(lon % 360),
            "lat": float(lat),
            "speed": float(lon_speed)
        })
    return res

def calc_houses(jd_ut: float, lat: float, lon: float, system: str):
    if system == "WholeSign":
        cusps, ascmc = swe.houses(jd_ut, lat, lon, b'P')
        asc = float(ascmc[0] % 360)
        asc_sign = int(asc // 30)
        house_cusps = [((asc_sign + i) % 12) * 30.0 for i in range(12)]
        return {
            "system": "WholeSign",
            "cusps": house_cusps,
            "asc": asc,
            "mc": float(ascmc[1] % 360)
        }
    else:
        cusps, ascmc = swe.houses(jd_ut, lat, lon, b'P')
        return {
            "system": "Placidus",
            "cusps": [float(c % 360) for c in cusps[:12]],
            "asc": float(ascmc[0] % 360),
            "mc": float(ascmc[1] % 360)
        }

@app.get("/resolve")
def resolve(place: str = Query(..., min_length=2)):
    loc = geolocator.geocode(place, language="en")
    if not loc:
        return {"error": "not found"}
    lat = loc.latitude
    lon = loc.longitude
    tzname = tzfinder.timezone_at(lat=lat, lng=lon) or "UTC"
    return {"lat": lat, "lon": lon, "tz": tzname, "name": loc.address}

@app.post("/natal")
def natal(req: NatalReq):
    date_parts = [int(x) for x in req.date.split("-")]
    has_time = req.time is not None
    if req.time:
        hh, mm = [int(x) for x in req.time.split(":")]
    else:
        hh, mm = 12, 0
    tz = pytz.timezone(req.tz)
    local_dt = tz.localize(dt.datetime(date_parts[0], date_parts[1], date_parts[2], hh, mm, 0))
    utc_dt = local_dt.astimezone(pytz.utc)
    jd_ut = to_jd_ut(utc_dt)
    planets = calc_planets(jd_ut)
    houses = None
    if has_time:
        houses = calc_houses(jd_ut, req.lat, req.lon, req.houseSystem)
    return {
        "planets": planets,
        "houses": houses,
        "meta": {
          "datetimeUTC": utc_dt.isoformat(),
          "lat": req.lat,
          "lon": req.lon,
          "tz": req.tz,
          "jd_ut": jd_ut
        }
    }

@app.post("/transits")
def transits(req: TransitReq):
    y, m, d = [int(x) for x in req.dateUTC.split("-")]
    if req.timeUTC:
        hh, mm = [int(x) for x in req.timeUTC.split(":")]
    else:
        hh, mm = 12, 0
    dt_utc = dt.datetime(y, m, d, hh, mm, 0, tzinfo=pytz.utc)
    jd_ut = to_jd_ut(dt_utc)
    planets = calc_planets(jd_ut)
    return {
        "dateUTC": dt_utc.date().isoformat(),
        "planets": planets
    }
