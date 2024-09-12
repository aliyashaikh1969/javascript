const input = document.querySelector("input");
const button = document.querySelector(".search-btn"),
  cityName = document.querySelector(".city-name"),
  temprature = document.querySelector(".temp"),
  weatherImage = document.querySelector(".image"),
  humidity = document.querySelector(".hum-temp"),
  wind = document.querySelector(".wind-temp"),
  container = document.querySelector(".container");

button.addEventListener("click", () => {
  let city = input.value;
  fetchingdata(city);
});
fetchingdata("mumbai");

async function fetchingdata(city) {
  try {
    const api_key = "7d5e74e7b112e34001dc87b79a2fc7c3";
    const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${api_key}`;

    const weather_data = await fetch(url);
    if (weather_data.status === 200) {
      let data = await weather_data.json();
      console.log(data);
      container.classList.add("active");
      let temp = Math.round(data.main.temp);
      cityName.innerText = data.name;
      temprature.innerHTML = `${temp}&#176;C`;
      let Image = data.weather[0].main;
      if (Image == "Mist") {
        weatherImage.innerHTML = "partly_cloudy_day";
      } else if (Image == "Clouds") {
        weatherImage.innerText = "cloud";
      } else if (Image == "Clear") {
        weatherImage.innerHTML = "sunny";
      } else if (Image == "Rain") {
        weatherImage.innerHTML = "rainy";
      } else if (Image == "Thunderstorm") {
        weatherImage.innerHTML = "thunderstorm";
      } else if (Image == "Haze") {
        weatherImage.innerHTML = "mist";
      }

      humidity.innerHTML = `${data.main.humidity}%`;
      wind.innerHTML = `${data.wind.speed}<span>km/h</span>`;
    } else {
      console.log("errorig");
    }
  } catch (error) {
    console.log("error", error);
  }
}
