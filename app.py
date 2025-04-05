from flask import Flask, render_template, request, jsonify
from weather_model import WeatherService
import os

app = Flask(__name__)

# Initialize weather service with API keys
weather_service = WeatherService(
    geocoder_api_key="",
    weather_api_key=""
)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/view_city')
def view_city():
    return render_template('view_city.html')


@app.route('/api/search_city')
def search_city():
    query = request.args.get('query', '')
    results = weather_service.search_city(query)
    return jsonify(results)


@app.route('/api/get_weather', methods=['POST'])
def get_weather():
    data = request.json
    cities = data.get('cities', [])
    days = data.get('days', 7)

    result = []
    for city in cities:
        weather_data = weather_service.get_weather_forecast(city, days)
        clothing_recommendations = weather_service.get_clothing_recommendations(weather_data)
        result.append({
            'city': city,
            'weather': weather_data,
            'recommendations': clothing_recommendations
        })

    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
