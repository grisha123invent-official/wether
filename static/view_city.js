let map;
let routeData = [];

// Initialize map
function initMap() {
    map = new ymaps.Map('routeMap', {
        center: [55.76, 37.64],
        zoom: 7
    });
}

// Wait for both map and dom to be ready
Promise.all([
    new Promise(resolve => ymaps.ready(resolve)),
    new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve))
]).then(() => {
    initMap();
    loadRouteData();
});

// Load route data from localStorage
function loadRouteData() {
    const citiesData = JSON.parse(localStorage.getItem('selectedCities') || '[]');
    if (citiesData.length === 0) {
        showError('Нет выбранных городов. Вернитесь на главную страницу для выбора маршрута.');
        return;
    }

    routeData = citiesData;
    displayCities();
    updateMap();
    generateRecommendations();
}

// Display cities summary
function displayCities() {
    const citiesList = document.getElementById('citiesList');
    citiesList.innerHTML = routeData.map((city, index) => `
        <div class="city-card">
            <h3>${index + 1}. ${city.name}</h3>
            <p>${city.description}</p>
        </div>
    `).join('');
}

// Update map with route
function updateMap() {
    if (!map) return;
    map.geoObjects.removeAll();

    if (routeData.length === 0) return;

    // Add markers for each city
    routeData.forEach((city, index) => {
        const placemark = new ymaps.Placemark(
            [city.coordinates.lat, city.coordinates.lon],
            {
                balloonContent: `${index + 1}. ${city.name}`
            },
            {
                preset: 'islands#blueCircleIcon',
                iconContent: (index + 1).toString()
            }
        );
        map.geoObjects.add(placemark);
    });

    // Draw route line
    if (routeData.length > 1) {
        const points = routeData.map(city => [city.coordinates.lat, city.coordinates.lon]);
        const multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: points,
            params: {
                routingMode: 'auto'
            }
        }, {
            boundsAutoApply: true,
            wayPointVisible: false
        });

        map.geoObjects.add(multiRoute);
    } else {
        map.setCenter([routeData[0].coordinates.lat, routeData[0].coordinates.lon]);
        map.setZoom(10);
    }
}

// Generate recommendations
function generateRecommendations() {
    const recommendations = document.getElementById('routeRecommendations');
    const travelTips = document.getElementById('travelTips');
    const weatherSummary = document.getElementById('weatherSummary');
    const packingList = document.getElementById('packingList');

    // Route recommendations
    let recommendationsHtml = '<p>Рекомендуемый порядок посещения городов:</p><ol>';
    routeData.forEach((city, index) => {
        recommendationsHtml += `
            <li>
                <strong>${city.name}</strong> - 
                ${getRecommendedDuration(index)} дней
                <ul>
                    <li>Оптимальное время для посещения: ${getBestTimeToVisit()}</li>
                    <li>Основные достопримечательности: ${getMainAttractions(city.name)}</li>
                </ul>
            </li>
        `;
    });
    recommendationsHtml += '</ol>';
    recommendations.innerHTML = recommendationsHtml;

    // Travel tips
    travelTips.innerHTML = generateTravelTips();

    // Weather summary
    weatherSummary.innerHTML = generateWeatherSummary();

    // Packing list
    packingList.innerHTML = generatePackingList();
}

// Helper functions
function getRecommendedDuration(cityIndex) {
    return Math.floor(Math.random() * 2) + 2; // 2-3 дня
}

function getBestTimeToVisit() {
    const times = [
        'утро (9:00-12:00)',
        'день (12:00-17:00)',
        'вечер (17:00-21:00)'
    ];
    return times[Math.floor(Math.random() * times.length)];
}

function getMainAttractions(cityName) {
    const attractions = {
        'Москва': 'Красная площадь, Третьяковская галерея, ВДНХ',
        'Санкт-Петербург': 'Эрмитаж, Петергоф, Исаакиевский собор',
        'Казань': 'Кремль, мечеть Кул-Шариф, улица Баумана',
        'default': 'исторический центр, главная площадь, краеведческий музей'
    };
    return attractions[cityName] || attractions.default;
}

function generateTravelTips() {
    const tips = [
        'Заранее забронируйте жилье для оптимальных цен',
        'Проверьте расписание общественного транспорта между городами',
        'Составьте список достопримечательностей для каждого города',
        'Уточните время работы музеев и других мест для посещения',
        'Сохраните офлайн-карты для навигации без интернета',
        'Проверьте наличие специальных туристических карт или пропусков',
        'Узнайте о местных праздниках и событиях во время вашего визита'
    ];

    return tips.map(tip => `<li>${tip}</li>`).join('');
}

function generateWeatherSummary() {
    return `
        <p>Для комфортного путешествия рекомендуем следить за прогнозом погоды 
        в каждом городе. Используйте основную страницу для получения актуального 
        прогноза погоды на выбранные даты.</p>
        <p>Общие рекомендации по сезонам:</p>
        <ul>
            <li>Весна: возьмите зонт и ветровку</li>
            <li>Лето: легкая одежда и головной убор</li>
            <li>Осень: дождевик и теплая куртка</li>
            <li>Зима: теплая зимняя одежда обязательна</li>
        </ul>
    `;
}

function generatePackingList() {
    const items = [
        'Документы и их копии',
        'Универсальная одежда, подходящая для разной погоды',
        'Удобная обувь для долгих прогулок',
        'Зарядные устройства и повербанк',
        'Аптечка с необходимыми медикаментами',
        'Зонт или дождевик',
        'Фотоаппарат или камера телефона',
        'Туалетные принадлежности',
        'Карта и путеводитель',
        'Портативное зарядное устройство'
    ];

    return items.map(item => `<li>${item}</li>`).join('');
}

function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="error">
            ${message}
            <br><br>
            <button onclick="window.location.href='/'" class="btn-primary">
                Вернуться на главную
            </button>
        </div>
    `;
}

// Export to PDF
function exportToPDF() {
    const element = document.querySelector('.container');

    // Создаем копию элемента для PDF
    const clonedElement = element.cloneNode(true);

    // Удаляем ненужные для PDF элементы
    const excludeFromPDF = clonedElement.querySelectorAll('.theme-toggle, .navigation-buttons');
    excludeFromPDF.forEach(el => el.remove());

    // Конфигурация для html2pdf
    const opt = {
        margin: 1,
        filename: 'travel_recommendations.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Генерируем PDF
    html2pdf().set(opt).from(clonedElement).save();
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

// Add PDF export button listener
const pdfButton = document.getElementById('exportPDF');
if (pdfButton) {
    pdfButton.addEventListener('click', exportToPDF);
}