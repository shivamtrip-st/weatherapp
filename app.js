document.addEventListener('DOMContentLoaded', function () {
    const cityInput = document.getElementById('cityInput');
    const searchButton = document.getElementById('searchButton');
    const tempElement = document.querySelector('.temp');
    const cityElement = document.querySelector('.city');
    const humidityElement = document.querySelector('.humidity');
    const windSpeedElement = document.querySelector('.wind-speed');
    const weatherIconElement = document.querySelector('.weather-icon');
    const weatherDescriptionElement = document.querySelector('.weather-description');
    const unitToggle = document.getElementById('unitToggle');
    const selectedUnitElement = document.querySelector('.selected-unit');
    const forecastCards = document.querySelector('.forecast-cards');
    const geoLocationButton = document.getElementById('geoLocationButton');
    const Apikey = '15bfd4b5bc8e7959621e1effcd4bd9db';

   
    let temperatureUnit = 'metric'; 
    const defaultLocation = 'New Delhi';
    fetchWeatherData(defaultLocation,'metric');

    searchButton.addEventListener('click', function () {
        const city = cityInput.value;

        if (city) {
            fetchWeatherData(city, temperatureUnit);
        }
        
    });

    const toggleTemperatureUnit = () => {
        temperatureUnit = temperatureUnit === 'metric' ? 'imperial' : 'metric';

        const city = cityElement.textContent;
        fetchWeatherData(city, temperatureUnit);

        selectedUnitElement.textContent = temperatureUnit === 'metric' ? '°C' : '°F';
    };

   
    unitToggle.addEventListener('change', toggleTemperatureUnit);

    geoLocationButton.addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                fetchWeatherDataByCoordinates(latitude, longitude);
            }, function (error) {
                console.error('Error getting geolocation:', error);
                alert('Unable to retrieve your location. Please enter a city name.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    function fetchWeatherData(city, unit) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Apikey}&units=${unit}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data);
                fetchForecastData(city, unit);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Unable to fetch weather data. Please try again.');
            });
    }

    function fetchForecastData(city, unit) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${Apikey}&units=${unit}`;
    
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                
                const next6daysData = data.list.reduce((acc, item) => {
                    const date = new Date(item.dt * 1000);
                    const dayOfWeek = date.getDay();    
                    if (acc[dayOfWeek] === undefined) {
                        acc[dayOfWeek] = item;
                    }
    
                    return acc;
                }, {});
    
                const forecastData = Object.values(next6daysData);
    
                displayForecastData(forecastData);
            })
            .catch(error => {
                console.error('Error fetching forecast data:', error);
                alert('Unable to fetch forecast data. Please try again.');
            });
    }

    function displayWeatherData(data) {
        const temperatureCelsius = data.main.temp;
        const temperatureFahrenheit = temperatureUnit === 'imperial' ? (temperatureCelsius * 9/5) + 32 : temperatureCelsius;
        const temperature = temperatureUnit === 'metric' ? `${temperatureCelsius.toFixed(2)}°C` : `${temperatureFahrenheit.toFixed(2)}°F`;
        const weatherDescription = data.weather[0].description;
        const windSpeed = temperatureUnit === 'metric' ? `${data.wind.speed.toFixed(2)} m/s` : `${(data.wind.speed * 2.237).toFixed(2)} mph`;
        const humidity = `${data.main.humidity}%`;
    
        tempElement.textContent = temperature;
        cityElement.textContent = data.name;
        humidityElement.textContent = humidity;
        windSpeedElement.textContent = windSpeed;
        weatherIconElement.src = getWeatherIconUrl(data.weather[0].icon);
    
        weatherDescriptionElement.textContent = weatherDescription;
    }

    function getWeatherIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    function displayForecastData(data) {
        const forecastCards = document.querySelector('.forecast-cards');
        forecastCards.innerHTML = ''; 
        data.sort((a, b) => a.dt - b.dt);

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
        
        let cardsDisplayed = 1;
    
        data.forEach(item => {
            if (cardsDisplayed < 8) { 
                const date = new Date(item.dt * 1000);
                const dayOfWeek = weekdays[date.getDay()]; 
    
                const temperatureCelsius = item.main.temp;
                const temperatureFahrenheit = temperatureUnit === 'imperial' ? (temperatureCelsius * 9/5) + 32 : temperatureCelsius;
                const temperature = temperatureUnit === 'metric' ? `${temperatureCelsius.toFixed(2)}°C` : `${temperatureFahrenheit.toFixed(2)}°F`;
    
                const description = item.weather[0].description;
    
                // Create a forecast card HTML
                const forecastCard = document.createElement('div');
                forecastCard.classList.add('forecast-card');
                forecastCard.innerHTML = `
                    <h3 class="forecast-day">${dayOfWeek}</h3>
                    <p class="forecast-date">${date.toLocaleDateString()}</p>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Forecast Icon">
                    <p class="forecast-temperature">${temperature}</p>
                    <p class="forecast-description">${description}</p>
                `;
    
                forecastCards.appendChild(forecastCard);
    
                cardsDisplayed++;
            }
        });
    }
    
    function fetchWeatherDataByCoordinates(latitude, longitude) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${Apikey}&units=${temperatureUnit}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data);
                fetchForecastData(data.name, temperatureUnit);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Unable to fetch weather data for your location. Please try again.');
            });
    }
});
