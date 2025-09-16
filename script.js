const apiKey = "8022577be8153386445f4e290059bdf9";

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (city) {
    getWeather(city);
  } else {
    document.getElementById("weatherResult").innerHTML = `<p>⚠️ Please enter a city</p>`;
  }
});


async function getWeather(city) {
  try {
    // Add ,IN if you want only Indian cities
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      document.getElementById("weatherResult").innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>🌡️ ${data.main.temp} °C</p>
        <p>☁️ ${data.weather[0].description}</p>
      `;
    } else {
      document.getElementById("weatherResult").innerHTML = `<p>❌ ${data.message}</p>`;
    }
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<p>⚠️ Error fetching data</p>`;
    console.error(error);
  }
}
