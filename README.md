# Weather Travel Planner

Веб-приложение для планирования путешествий с прогнозом погоды и рекомендациями по одежде.

## Особенности

- Поиск и выбор городов для путешествия
- Отображение маршрута на карте
- Прогноз погоды для каждого города
- Рекомендации по одежде
- Тёмная/светлая тема
- Использование API Яндекс.Карт и Яндекс.Погоды

## Установка и запуск

1. Клонируйте репозиторий
2. Установите зависимости из requirements.txt:
```bash
pip install -r requirements.txt
```
3. Запустите приложение:
```bash
python app.py
```

## API ключи

В проекте используются следующие API ключи:
- YANDEX_API_KEY_GEOCODER="..."
- YANDEX_API_KEY_WEATHER="..."

## Структура проекта

- `app.py` - основной файл Flask приложения
- `weather_model.py` - модель для работы с API погоды
- `static/` - статические файлы (CSS, JavaScript)
- `templates/` - HTML шаблоны
- `requirements.txt` - зависимости проекта

## Технологии

- Python/Flask
- JavaScript
- HTML/CSS
- Yandex Maps API
- Yandex Weather API
