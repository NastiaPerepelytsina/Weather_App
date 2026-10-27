const API_KEY = '55a209d7cd1d4225a65153428261310';
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const cityButtons = document.querySelectorAll('.city-btn');
const historyBtn = document.getElementById('historyBTN');
const weatherResult = document.getElementById('weatherResult');
const hourlyForecastResult = document.getElementById('hourlyForecastResult');
const historyList = document.getElementById('historyList');
const historyPanel = document.getElementById('historyPanel');
const clearHistoryBtn = document.getElementById('cleanHistory');
const message = document.getElementById('message');

let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
const maxHistory = 10;

function savetoHistory(city, country) {
    const newCity = {
        country: country,
        city: city
    }
    searchHistory = searchHistory.filter(function (item) {
        return !(item.city.toLowerCase() === city.toLowerCase() && item.country.toLowerCase() === country.toLowerCase());
    });
    searchHistory.unshift(newCity);
    searchHistory = searchHistory.slice(0, maxHistory);
    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    if (searchHistory.length == 0) {
        historyList.innerHTML = "<p>No searches yet</p>"
        return;
    }
    searchHistory.forEach(function (item) {
        const button = document.createElement('button');
        button.textContent = `${item.city}, ${item.country}`;
        button.addEventListener('click', () => {
            cityInput.value = item.city;
            getWeather(item.city);
        });
        historyList.append(button);
    });
}

async function getWeather(city) {
    if (city.trim() === "") {
        message.textContent = "Please enter a valid city.";
        return;
    }
    weatherResult.innerHTML = "";
    message.textContent = "Loading...";
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            message.textContent = "City not found!";
            return;
        }
        message.textContent = "";
        savetoHistory(city, data.location.country);
        renderWeather(data);
        getForecast(city);
    } catch (error) {
        message.textContent = "No connection. Please try again.";
    }
}
function renderWeather(data) {
    const {location, current} = data;
    const city = location.name;
    const country = location.country;
    const region = location.region;
    const temp = current.temp_c;
    const condition = current.condition;
    const wind = current.wind_kph;
    const cloud = current.cloud;
    const feelslike = current.feelslike_c;

    weatherResult.innerHTML = `
    <div class="card">
    <h2>${city}</h2>
    <p>${country}, ${region}</p>
    <p>${temp}°C</p>
    <p class="description">${condition.text}</p>
    <div class="details">
    <div class="detail-item">
    <p>Feeling like</p>
    <p>${feelslike}°C</p>
    </div>
    <div class="detail-item">
    <p>Wind</p>
    <p>${wind} km/h</p>
    </div>
    <div class="detail-item">
    <p>Cloud</p>
    <p>${cloud}%</p>
    </div>
    </div>
    </div>
    `;
}
weatherForm.addEventListener('submit', e => {
    e.preventDefault();
    const city = cityInput.value.trim();
    getWeather(city);
})

cityButtons.forEach((button) => {
    button.addEventListener('click', e => {
        const city = button.dataset.city;
        cityInput.value = city;
        getWeather(city);
    })
})

historyBtn.addEventListener('click', e => {
    historyPanel.classList.toggle('hidden');
})

clearHistoryBtn.addEventListener('click', e => {
    searchHistory = [];
    localStorage.removeItem('weatherHistory');
    renderHistory();
})

renderHistory()




async function getWeatherByCoords(lat, lon) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            message.textContent = "Allow your location or search for a city.";
            return;
        }
        renderWeather(data);
        getForecast(`${lat},${lon}`);
    } catch (error) {
        message.textContent = "No connection. Please try again.";
    }
}

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            () => {
                message.textContent = "Allow your location or search for a city.";
            }
        );
    } else {
        message.textContent = "Allow your location or search for a city.";
    }
});

async function getForecast(city) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=no`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            return;
        }
        renderHourlyForecast(data);
    } catch (error) {
        return;
    }
}

function renderHourlyForecast(data) {
    const today = data.forecast.forecastday[0];
    if (!today || !today.hour) {
        return;
    }
    const hours = today.hour;
    let html = '<div class="hourly-container"><h2>Hourly</h2><div class="hourly-list">';

    hours.forEach((hour) => {
        const time = new Date(hour.time).getHours();
        const timeStr = `${time}:00`;
        const temp = Math.round(hour.temp_c);

        html += `
            <div class="hourly-item">
                <p class="hour-time">${timeStr}</p>
                <p class="hour-temp">${temp}°</p>
            </div>
        `;
    });

    html += '</div></div>';
    hourlyForecastResult.innerHTML = html;
}





