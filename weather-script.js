// Weather Icons Map
const weatherIcons = {
    'sunny': '☀️',
    'clear': '🌙',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'snow': '❄️',
    'storm': '⛈️',
    'windy': '💨',
    'fog': '🌫️',
    'partly_cloudy': '⛅'
};

// Get weather icon based on weather code
function getWeatherIcon(weatherCode, isDay) {
    const iconMap = {
        0: isDay ? '☀️' : '🌙', // Clear
        1: '🌤️', // Mainly clear
        2: '⛅', // Partly cloudy
        3: '☁️', // Overcast
        45: '🌫️', // Foggy
        48: '🌫️', // Depositing rime fog
        51: '🌦️', // Light drizzle
        53: '🌦️', // Moderate drizzle
        55: '🌧️', // Dense drizzle
        61: '🌧️', // Slight rain
        63: '🌧️', // Moderate rain
        65: '⛈️', // Heavy rain
        71: '❄️', // Slight snow
        73: '❄️', // Moderate snow
        75: '❄️', // Heavy snow
        77: '❄️', // Snow grains
        80: '🌧️', // Slight rain showers
        81: '⛈️', // Moderate rain showers
        82: '⛈️', // Violent rain showers
        85: '❄️', // Slight snow showers
        86: '❄️', // Heavy snow showers
        95: '⛈️', // Thunderstorm
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️'  // Thunderstorm with heavy hail
    };
    return iconMap[weatherCode] || '🌤️';
}

// Get weather description
function getWeatherDescription(weatherCode) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        80: 'Rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with heavy hail'
    };
    return descriptions[weatherCode] || 'Unknown';
}

// Load settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('weatherSettings')) || {
        tempUnit: 'C',
        windUnit: 'kmh',
        defaultCity: 'London'
    };
    return settings;
}

// Save settings
function saveSettings(settings) {
    localStorage.setItem('weatherSettings', JSON.stringify(settings));
}

// Convert temperature
function convertTemp(celsius, unit) {
    return unit === 'F' ? Math.round((celsius * 9/5) + 32) : Math.round(celsius);
}

// Convert wind speed
function convertWind(kmh, unit) {
    if (unit === 'mph') return (kmh * 0.621371).toFixed(1);
    if (unit === 'ms') return (kmh / 3.6).toFixed(1);
    return kmh.toFixed(1);
}

// Get wind unit label
function getWindUnitLabel(unit) {
    const labels = {
        'kmh': 'km/h',
        'mph': 'mph',
        'ms': 'm/s'
    };
    return labels[unit];
}

// Geocode city name to coordinates
async function geocodeCity(cityName) {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                lat: result.latitude,
                lon: result.longitude,
                name: result.name,
                country: result.country || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Fetch weather data
async function fetchWeather(lat, lon, settings) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,visibility,uv_index,is_day,feels_like_temperature_2m,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code,is_day&timezone=auto`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Weather API error:', error);
        return null;
    }
}

// Display current weather
function displayCurrentWeather(data, location, settings) {
    const current = data.current;
    const tempUnit = settings.tempUnit === 'F' ? '°F' : '°C';
    const windUnit = getWindUnitLabel(settings.windUnit);
    
    const temp = convertTemp(current.temperature_2m, settings.tempUnit);
    const feelsLike = convertTemp(current.feels_like_temperature_2m, settings.tempUnit);
    const wind = convertWind(current.wind_speed_10m, settings.windUnit);
    const dewPoint = convertTemp(current.dew_point_2m, settings.tempUnit);
    
    const icon = getWeatherIcon(current.weather_code, current.is_day);
    const description = getWeatherDescription(current.weather_code);
    
    const html = `
        <div class="weather-header-info">
            <div class="weather-location">${location.name}${location.country ? ', ' + location.country : ''}</div>
            <div class="weather-description">${description}</div>
            <div class="temperature-display">${icon} ${temp}${tempUnit}</div>
            <div class="temp-feels-like">Feels like ${feelsLike}${tempUnit}</div>
        </div>
        
        <div class="weather-details">
            <div class="detail-item">
                <div class="detail-label">Humidity</div>
                <div class="detail-value">${current.relative_humidity_2m}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Wind Speed</div>
                <div class="detail-value">${wind} ${windUnit}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Pressure</div>
                <div class="detail-value">${current.pressure_msl} hPa</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Visibility</div>
                <div class="detail-value">${(current.visibility / 1000).toFixed(1)} km</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">UV Index</div>
                <div class="detail-value">${current.uv_index}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Dew Point</div>
                <div class="detail-value">${dewPoint}${tempUnit}</div>
            </div>
        </div>
    `;
    
    document.getElementById('currentWeather').innerHTML = html;
}

// Display hourly forecast
function displayHourlyForecast(data, settings) {
    const hourly = data.hourly;
    const currentHour = new Date().getHours();
    const tempUnit = settings.tempUnit === 'F' ? '°F' : '°C';
    
    let html = '';
    for (let i = 0; i < 24; i++) {
        const temp = convertTemp(hourly.temperature_2m[i], settings.tempUnit);
        const icon = getWeatherIcon(hourly.weather_code[i], hourly.is_day[i]);
        const hour = (currentHour + i) % 24;
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        
        html += `
            <div class="hourly-card">
                <div class="hourly-time">${timeStr}</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-temp">${temp}${tempUnit}</div>
            </div>
        `;
    }
    
    document.getElementById('hourlyForecast').innerHTML = html;
}

// Display daily forecast
function displayDailyForecast(data, settings) {
    const daily = data.daily;
    const tempUnit = settings.tempUnit === 'F' ? '°F' : '°C';
    
    let html = '';
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const maxTemp = convertTemp(daily.temperature_2m_max[i], settings.tempUnit);
        const minTemp = convertTemp(daily.temperature_2m_min[i], settings.tempUnit);
        const icon = getWeatherIcon(daily.weather_code[i], true);
        const description = getWeatherDescription(daily.weather_code[i]);
        
        html += `
            <div class="daily-card">
                <div class="daily-date">${dateStr}</div>
                <div class="daily-icon">${icon}</div>
                <div class="daily-desc">${description}</div>
                <div class="daily-temps">
                    <div class="daily-high">${maxTemp}${tempUnit}</div>
                    <div class="daily-low">${minTemp}${tempUnit}</div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('dailyForecast').innerHTML = html;
}

// Main weather display function
async function displayWeather(cityName) {
    const settings = loadSettings();
    
    // Geocode city name
    const location = await geocodeCity(cityName);
    if (!location) {
        alert('City not found. Please try another search.');
        return;
    }
    
    // Fetch weather data
    const weatherData = await fetchWeather(location.lat, location.lon, settings);
    if (!weatherData) {
        alert('Failed to fetch weather data.');
        return;
    }
    
    // Display all sections
    displayCurrentWeather(weatherData, location, settings);
    displayHourlyForecast(weatherData, settings);
    displayDailyForecast(weatherData, settings);
}

// Get current location
async function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const settings = loadSettings();
        
        // Reverse geocode to get city name
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en`
            );
            const data = await response.json();
            const cityName = data.results[0].name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            
            // Fetch weather
            const weatherData = await fetchWeather(latitude, longitude, settings);
            if (weatherData) {
                displayCurrentWeather(weatherData, { name: cityName, country: data.results[0].country }, settings);
                displayHourlyForecast(weatherData, settings);
                displayDailyForecast(weatherData, settings);
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    }, () => {
        alert('Unable to access your location.');
    });
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        displayWeather(city);
        document.getElementById('cityInput').value = '';
    }
});

document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            displayWeather(city);
            document.getElementById('cityInput').value = '';
        }
    }
});

document.getElementById('locationBtn').addEventListener('click', getCurrentLocationWeather);

// Settings
document.getElementById('settingsToggle').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.toggle('hidden');
});

document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.add('hidden');
});

document.getElementById('tempUnit').addEventListener('change', (e) => {
    const settings = loadSettings();
    settings.tempUnit = e.target.value;
    saveSettings(settings);
});

document.getElementById('windUnit').addEventListener('change', (e) => {
    const settings = loadSettings();
    settings.windUnit = e.target.value;
    saveSettings(settings);
});

document.getElementById('saveDefaultBtn').addEventListener('click', () => {
    const city = document.getElementById('defaultCity').value.trim();
    if (city) {
        const settings = loadSettings();
        settings.defaultCity = city;
        saveSettings(settings);
        alert('Default city saved!');
    }
});

// Load settings on page load
window.addEventListener('DOMContentLoaded', () => {
    const settings = loadSettings();
    document.getElementById('tempUnit').value = settings.tempUnit;
    document.getElementById('windUnit').value = settings.windUnit;
    document.getElementById('defaultCity').value = settings.defaultCity;
    
    // Display default city weather
    displayWeather(settings.defaultCity);
});
