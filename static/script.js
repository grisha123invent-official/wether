let map;
let selectedCities = [];
let searchTimeout;

// Initialize Yandex Map
function initMap() {
    map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 7
    });
}

ymaps.ready(initMap);

// Load saved cities from localStorage
function loadSavedCities() {
    const savedCities = localStorage.getItem('selectedCities');
    if (savedCities) {
        selectedCities = JSON.parse(savedCities);
        updateCityList();
        updateMap();
    }
}

// City search functionality with error handling
const citySearchInput = document.getElementById('citySearch');
const searchResults = document.getElementById('searchResults');
const getForecastBtn = document.getElementById('getForecast');

function normalizeQuery(query) {
    return query.toLowerCase().replace(/ё/g, 'е').trim();
}

citySearchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(() => {
        fetch(`/api/search_city?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) throw new Error('Ошибка поиска');
                return response.json();
            })
            .then(data => {
                searchResults.innerHTML = '';
                if (data.length === 0) {
                    const div = document.createElement('div');
                    div.className = 'search-result-item no-results';
                    div.textContent = 'Городов не найдено';
                    searchResults.appendChild(div);
                    return;
                }
                data.forEach(city => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.textContent = `${city.name}, ${city.description}`;
                    div.addEventListener('click', () => addCity(city));
                    searchResults.appendChild(div);
                });
            })
            .catch(error => {
                searchResults.innerHTML = `
                    <div class="search-result-item error">
                        Произошла ошибка при поиске: ${error.message}
                    </div>
                `;
            });
    }, 300);
});

// Add city to selected list
function addCity(city) {
    if (!selectedCities.find(c => c.name === city.name)) {
        selectedCities.push(city);
        updateCityList();
        updateMap();
        saveCitiesToStorage();
    }
    citySearchInput.value = '';
    searchResults.innerHTML = '';
}

// Remove city from selected list
function removeCity(index) {
    selectedCities.splice(index, 1);
    updateCityList();
    updateMap();
    saveCitiesToStorage();
}

// Save cities to localStorage
function saveCitiesToStorage() {
    localStorage.setItem('selectedCities', JSON.stringify(selectedCities));
}

// Update city list UI
function updateCityList() {
    const cityList = document.getElementById('cityList');
    cityList.innerHTML = '';

    selectedCities.forEach((city, index) => {
        const li = document.createElement('li');
        li.className = 'city-item';
        li.innerHTML = `
            ${city.name}
            <button class="remove-city" onclick="removeCity(${index})">✕</button>
        `;
        cityList.appendChild(li);
    });
}

// Update map with markers
function updateMap() {
    map.geoObjects.removeAll();

    selectedCities.forEach((city, index) => {
        const placemark = new ymaps.Placemark(
            [city.coordinates.lat, city.coordinates.lon],
            {
                balloonContent: city.name
            }
        );
        map.geoObjects.add(placemark);
    });

    if (selectedCities.length > 0) {
        map.setBounds(map.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 30
        });
    }
}

// Get weather forecast
getForecastBtn.addEventListener('click', () => {
    if (selectedCities.length === 0) {
        alert('Выберите хотя бы один город');
        return;
    }

    const days = document.getElementById('daysCount').value;
    const weatherResults = document.getElementById('weatherResults');
    weatherResults.innerHTML = '<div class="loading">Загрузка прогноза...</div>';

    fetch('/api/get_weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cities: selectedCities,
            days: parseInt(days)
        })
    })
    .then(response => response.json())
    .then(data => {
        displayWeatherResults(data);
    })
    .catch(error => {
        weatherResults.innerHTML = `
            <div class="error">
                Произошла ошибка при получении прогноза: ${error.message}
            </div>
        `;
    });
});

// Display weather results
function displayWeatherResults(results) {
    const weatherResults = document.getElementById('weatherResults');
    weatherResults.innerHTML = '';

    results.forEach(result => {
        const cityDiv = document.createElement('div');
        cityDiv.className = 'city-forecast';

        cityDiv.innerHTML = `
            <h3>${result.city.name}</h3>
            <div class="daily-forecast">
                ${result.weather.forecasts.map(forecast => `
                    <div class="forecast-card">
                        <div class="date">${formatDate(forecast.date)}</div>
                        <div class="temp">
                            ${forecast.parts.day.temp_avg}°C
                        </div>
                        <div class="condition">
                            ${translateCondition(forecast.parts.day.condition)}
                        </div>
                        <div class="recommendations">
                            <h4>Рекомендуемая одежда:</h4>
                            <ul>
                                ${result.recommendations
                                    .find(r => r.date === forecast.date)
                                    .clothes
                                    .map(item => `<li>${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        weatherResults.appendChild(cityDiv);
    });
}

// Theme switcher
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme',
            document.body.classList.contains('dark-theme') ? 'dark' : 'light'
        );
    });
}

// Initialize theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Helper functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}

function translateCondition(condition) {
    const translations = {
        'clear': 'Ясно',
        'partly-cloudy': 'Малооблачно',
        'cloudy': 'Облачно',
        'overcast': 'Пасмурно',
        'drizzle': 'Морось',
        'light-rain': 'Небольшой дождь',
        'rain': 'Дождь',
        'moderate-rain': 'Умеренный дождь',
        'heavy-rain': 'Сильный дождь',
        'continuous-heavy-rain': 'Длительный сильный дождь',
        'showers': 'Ливень',
        'wet-snow': 'Мокрый снег',
        'light-snow': 'Небольшой снег',
        'snow': 'Снег',
        'snow-showers': 'Снегопад',
        'hail': 'Град',
        'thunderstorm': 'Гроза',
        'thunderstorm-with-rain': 'Дождь с грозой',
        'thunderstorm-with-hail': 'Гроза с градом'
    };
    return translations[condition] || condition;
}

// Load saved cities when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadSavedCities();
});