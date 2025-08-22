Astro Swiss Ephemeris Service

Требования:
- Python 3.10+
- Файлы эфемерид Swiss Ephemeris (se*.se1, se*.se2 и др.) в папке ./ephe или путь в переменной EPHE_PATH

Запуск локально:
1) python -m venv .venv && source .venv/bin/activate
2) pip install -r requirements.txt
3) Скопируйте файлы эфемерид в astro-service/ephe или задайте EPHE_PATH
4) uvicorn main:app --host 0.0.0.0 --port 8000

Эндпоинты:
- GET /resolve?place=Москва -> {lat, lon, tz, name}
- POST /natal -> { planets, houses|null, meta }
  тело: { date:"YYYY-MM-DD", time?:"HH:MM", lat:number, lon:number, tz:"IANA", houseSystem:"Placidus"|"WholeSign" }
- POST /transits -> { dateUTC, planets }
  тело: { dateUTC:"YYYY-MM-DD", timeUTC?:"HH:MM" }

Docker:
- docker build -t astro-service .
- docker run -p 8000:8000 -e EPHE_PATH=/app/ephe -v $(pwd)/ephe:/app/ephe astro-service

Замечание:
- Соблюдайте лицензию Swiss Ephemeris (SEPL). Эфемериды в репозиторий не добавляйте.
