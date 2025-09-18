const apiKey = "8022577be8153386445f4e290059bdf9";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const weeklyForecast = document.getElementById("weeklyForecast");
const modeToggle = document.getElementById("modeToggle");

let hourlyChart;

// 🔍 Search button event
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    weatherResult.innerHTML = `<p>⚠️ Please enter a city</p>`;
  }
});

// 🌍 Get current weather + forecast
async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      weatherResult.innerHTML = `<p>❌ ${data.message}</p>`;
      return;
    }

    // Display current weather
    weatherResult.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p>🌡️ ${data.main.temp} °C</p>
      <p>☁️ ${data.weather[0].description}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬 Wind: ${data.wind.speed} m/s</p>
    `;

    // Update light-mode background based on weather
    updateWeatherBackground(data.weather[0].main.toLowerCase());

    // 📍 Get lat/lon for forecast
    const { lat, lon } = data.coord;
    getForecast(lat, lon);
  } catch (error) {
    weatherResult.innerHTML = `<p>⚠️ Error fetching data</p>`;
    console.error(error);
  }
}

// 📊 Get forecast (5-day / 3-hour)
async function getForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    // Hourly chart (next 12 entries ≈ 36 hrs)
    renderHourlyChart(data.list.slice(0, 12));

    // 5-day forecast (one entry per day)
    const dailyMap = {};
    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = entry; // first entry of the day
      }
    });

    const forecastDays = Object.values(dailyMap).slice(0, 5);
    renderWeeklyForecast(forecastDays);
  } catch (error) {
    console.error(error);
  }
}

// 📊 Render hourly forecast chart
function renderHourlyChart(hourlyData) {
  const ctx = document.getElementById("hourlyChart").getContext("2d");

  const labels = hourlyData.map(h => new Date(h.dt * 1000).getHours() + ":00");
  const temps = hourlyData.map(h => h.main.temp);
  const humidity = hourlyData.map(h => h.main.humidity);
  const wind = hourlyData.map(h => h.wind.speed);

  if (hourlyChart) hourlyChart.destroy();

  hourlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Temp (°C)", data: temps, borderColor: "orange", fill: false },
        { label: "Humidity (%)", data: humidity, borderColor: "blue", fill: false },
        { label: "Wind (m/s)", data: wind, borderColor: "green", fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      }
    }
  });
}

// 📅 Render 5-day forecast cards
function renderWeeklyForecast(dailyData) {
  weeklyForecast.innerHTML = "";
  dailyData.forEach(day => {
    const date = new Date(day.dt * 1000);
    weeklyForecast.innerHTML += `
      <div class="forecast-card">
        <h4>${date.toLocaleDateString("en-US", { weekday: "short" })}</h4>
        <p>🌡️ ${Math.round(day.main.temp)}°C</p>
        <p>☁️ ${day.weather[0].main}</p>
      </div>
    `;
  });
}

// 🌗 Dark/Light mode toggle
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  modeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// 🌦 Update light-mode background based on weather
function updateWeatherBackground(weather) {
  const body = document.body;

  // Remove previous light-mode classes
  body.classList.remove("light-sunny", "light-rainy", "light-cloudy", "light-snow");

  // Only update in light mode
  if (!body.classList.contains("dark")) {
    if (weather.includes("rain")) {
      body.classList.add("light-rainy");
    } else if (weather.includes("sun") || weather.includes("clear")) {
      body.classList.add("light-sunny");
    } else if (weather.includes("cloud")) {
      body.classList.add("light-cloudy");
    } else if (weather.includes("snow")) {
      body.classList.add("light-snow");
    } else {
      body.classList.add("light-cloudy"); // default mild
    }
  }
}

// 🌐 Default city
getWeather("Hyderabad");
