const API_KEY = "0a102c5256bafe28d5b102a4b1a2ea78";
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const dt = new Date();

// Selectors
const searchBtn = document.getElementById("search-button");
const locationBtn = document.getElementById("location");
const cityInput = document.getElementById("searchbar");
const currentTemperature = document.getElementById("current-temperature");
const weatherDescription = document.getElementById("weather-type");
const weatherIcon = document.getElementById("weather-icon");
const currentDate = document.querySelector(".current-time");
const currentLocation = document.querySelector(".current-location");
const forecastItems = document.querySelectorAll(".forecast-item");
const aqiType = document.querySelector(".aqi-type");
const airIndices = document.querySelectorAll(".air-indices .item h2");
const sunriseItem = document.getElementById("sunrise-time");
const sunsetItem = document.getElementById("sunset-time");
const humidityItem = document.getElementById("humidity-value");
const pressureItem = document.getElementById("pressure-value");
const visibilityItem = document.getElementById("visibility-value");
const windSpeedItem = document.getElementById("wind-speed-value");
const feelsLikeItem = document.getElementById("feels-like-value");
const hourlyForecastItems = document.querySelectorAll(".hourly-forecast .card");

const toggleCheckbox = document.getElementById("mode-toggle-checkbox");
toggleCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
});

function kelvinToCelsius(temp) {
  return (temp - 273.15).toFixed(2);
}

function formatTime(hours, minutes) {
  const amPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${amPm}`;
}

function fetchCoordinates(cityName) {
  const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  fetch(geocodingUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const { lat, lon, name, country, state } = data[0];
        fetchWeatherDetails(lat, lon, name, country, state);
      } else {
        alert(`Unable to fetch coordinates for ${cityName}`);
      }
    })
    .catch(() => {
      alert(`Unable to fetch coordinates for ${cityName}`);
    });
}

function fetchCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude: lat, longitude: lon } = position.coords;
      const reverseGeocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${API_KEY}`;
      fetch(reverseGeocodingUrl)
        .then((response) => response.json())
        .then((data) => {
          const { name, country, state } = data[0];
          fetchWeatherDetails(lat, lon, name, country, state);
        })
        .catch(() => {
          alert("Unable to fetch your location");
        });
    });
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

searchBtn.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (cityName) {
    fetchCoordinates(cityName);
  } else {
    alert("Please enter a city name");
  }
});

locationBtn.addEventListener("click", fetchCurrentLocation);

function fetchWeatherDetails(lat, lon, name, country, state) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  // Fetch current weather
  fetch(weatherUrl)
    .then((response) => response.json())
    .then((data) => {
      currentTemperature.textContent = `${kelvinToCelsius(data.main.temp)}°C`;
      weatherDescription.textContent = data.weather[0].description;
      weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">`;

      currentDate.innerHTML = `<p><i class="fa-light fa-calendar"></i> ${
        weekDays[dt.getDay()]
      }, ${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}</p>`;
      currentLocation.innerHTML = `<p><i class="fa-light fa-map-marker-alt"></i> ${name}, ${state}, ${country}</p>`;

      const sunriseTime = new Date(data.sys.sunrise * 1000);
      const sunsetTime = new Date(data.sys.sunset * 1000);

      sunriseItem.textContent = formatTime(
        sunriseTime.getHours(),
        sunriseTime.getMinutes()
      );
      sunsetItem.textContent = formatTime(
        sunsetTime.getHours(),
        sunsetTime.getMinutes()
      );

      humidityItem.textContent = `${data.main.humidity}%`;
      pressureItem.textContent = `${data.main.pressure} hPa`;
      visibilityItem.textContent = `${(data.visibility / 1000).toFixed(2)} km`;
      windSpeedItem.textContent = `${data.wind.speed} m/s`;
      feelsLikeItem.textContent = `${kelvinToCelsius(data.main.feels_like)}°C`;
    })
    .catch(() => {
      alert(`Unable to fetch weather details for ${name}`);
    });

  // Fetch weather forecast
  fetch(forecastUrl)
    .then((response) => response.json())
    .then((data) => {
      const uniqueDates = new Set();
      const forecastDays = data.list
        .filter((forecast) => {
          const forecastDate = new Date(forecast.dt_txt).getDate();
          if (!uniqueDates.has(forecastDate)) {
            uniqueDates.add(forecastDate);
            return true;
          }
          return false;
        })
        .slice(1);

      forecastItems.forEach((item, index) => {
        const forecast = forecastDays[index];
        if (forecast) {
          const forecastDate = new Date(forecast.dt_txt);
          item.innerHTML = `
          <div class="icon-wrapper">
            <img src="https://openweathermap.org/img/wn/${
              forecast.weather[0].icon
            }@2x.png" alt="Weather Icon">
            <span>${kelvinToCelsius(forecast.main.temp)}°C</span>
          </div>
          <p class="forecast-date">${forecastDate.getDate()} ${
            months[forecastDate.getMonth()]
          }</p>
          <p class="forecast-day">${weekDays[forecastDate.getDay()]}</p>
          `;
        }
      });

      hourlyForecastItems.forEach((item, index) => {
        const forecast = data.list[index];
        if (forecast) {
          const forecastTime = new Date(forecast.dt_txt);
          item.innerHTML = `
          <p>${formatTime(
            forecastTime.getHours(),
            forecastTime.getMinutes()
          )}</p>
          <img src="https://openweathermap.org/img/wn/${
            forecast.weather[0].icon
          }.png" alt="Weather Icon">
          <p>${kelvinToCelsius(forecast.main.temp)}°C</p>
          `;
        }
      });
    })
    .catch(() => {
      alert(`Unable to fetch weather forecast for ${name}`);
    });

  // Fetch air quality
  fetch(airPollutionUrl)
    .then((response) => response.json())
    .then((data) => {
      const aqi = data.list[0].main.aqi;
      const aqiColors = ["#d4e157", "#ffee58", "#ffca28", "#ff7043", "#ef5350"];
      const aqiLabels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

      aqiType.textContent = aqiLabels[aqi - 1];
      aqiType.style.backgroundColor = aqiColors[aqi - 1];

      const airComponents = data.list[0].components;
      airIndices[0].textContent = airComponents.pm2_5.toFixed(2);
      airIndices[1].textContent = airComponents.pm10.toFixed(2);
      airIndices[2].textContent = airComponents.so2.toFixed(2);
      airIndices[3].textContent = airComponents.co.toFixed(2);
      airIndices[4].textContent = airComponents.no.toFixed(2);
      airIndices[5].textContent = airComponents.no2.toFixed(2);
      airIndices[6].textContent = airComponents.nh3.toFixed(2);
      airIndices[7].textContent = airComponents.o3.toFixed(2);
    })
    .catch(() => {
      alert(`Unable to fetch air pollution details for ${name}`);
    });
}
