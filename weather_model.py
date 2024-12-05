import requests
from datetime import datetime, timedelta


class WeatherService:
    def __init__(self, geocoder_api_key, weather_api_key):
        self.geocoder_api_key = geocoder_api_key
        self.weather_api_key = weather_api_key
        self.geocoder_url = "https://geocode-maps.yandex.ru/1.x/"
        self.weather_url = "https://api.weather.yandex.ru/v2/forecast"

    def search_city(self, query):
        params = {
            "apikey": self.geocoder_api_key,
            "format": "json",
            "geocode": query,
            "results": 5
        }

        response = requests.get(self.geocoder_url, params=params)
        response.raise_for_status()

        data = response.json()
        features = data['response']['GeoObjectCollection']['featureMember']

        results = []
        for feature in features:
            geo_object = feature['GeoObject']
            coordinates = geo_object['Point']['pos'].split()
            results.append({
                'name': geo_object['name'],
                'description': geo_object['description'],
                'coordinates': {
                    'lat': coordinates[1],
                    'lon': coordinates[0]
                }
            })

        return results

    def get_weather_forecast(self, city_data, days=7):
        headers = {
            "X-Yandex-API-Key": self.weather_api_key
        }

        params = {
            "lat": city_data['coordinates']['lat'],
            "lon": city_data['coordinates']['lon'],
            "lang": "ru_RU",
            "limit": days,
            "hours": "false"
        }

        response = requests.get(self.weather_url, headers=headers, params=params)
        response.raise_for_status()

        return response.json()

    def get_clothing_recommendations(self, weather_data):
        recommendations = []

        for forecast in weather_data['forecasts']:
            temp = forecast['parts']['day']['temp_avg']
            condition = forecast['parts']['day']['condition']

            clothes = []
            if temp < 0:
                clothes.extend(['Зимняя куртка', 'Теплые ботинки', 'Шарф', 'Перчатки'])
            elif temp < 10:
                clothes.extend(['Демисезонная куртка', 'Свитер', 'Ботинки'])
            elif temp < 20:
                clothes.extend(['Легкая куртка или кардиган', 'Джинсы', 'Кроссовки'])
            else:
                clothes.extend(['Футболка', 'Шорты/юбка', 'Легкая обувь'])

            if 'rain' in condition or 'drizzle' in condition:
                clothes.append('Зонт')

            recommendations.append({
                'date': forecast['date'],
                'clothes': clothes,
                'temp': temp,
                'condition': condition
            })

        return recommendations