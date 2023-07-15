import './App.css';
import { useState, useRef } from 'react';
import { useEffect } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faClipboardList, faCloud, faWind, faLocationDot, faEye, faLocationArrow, faArrowUpWideShort } from '@fortawesome/free-solid-svg-icons';
import { faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { faSmog } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { faCloudBolt } from '@fortawesome/free-solid-svg-icons';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureLow } from '@fortawesome/free-solid-svg-icons';
import { faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons';
/* global google */


function App() {

  const SNOW_CODES = [1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264];
  const RAIN_CODES = [1063, 1072, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246];
  const THUNDER_CODES = [1087, 1273, 1276, 1279, 1282];
  
  // Current
  const [tempUnit, setTempUnit] = useState(null);
  const [temp, setTemp] = useState(null);
  const [lowTemp, setLowTemp] = useState(null);
  const [highTemp, setHighTemp] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationBtnDisabled, setLocationBtnDisabled] = useState(true);
  const [fahrenheitBtnDisabled, setFahrenheitBtnDisabled] = useState(true);
  const [celsiusBtnDisabled, setCelsiusBtnDisabled] = useState(true);
  const [description, setDescription] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [weatherIconAlt, setWeatherIconAlt] = useState(null);
  const [weatherIcon2, setWeatherIcon2] = useState(null);
  const [weatherType, setWeatherType] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [windDegree, setWindDegree] = useState(null);
  const [windDirection, setWindDirection] = useState(null);
  const [windGust, setWindGust] = useState(null);
  const [visibility, setVisibility] = useState(null);
  const [sunriseTime, setSunrise] = useState(null);
  const [sunsetTime, setSunset] = useState(null);
  const [uvIndex, setUVIndex] = useState(null);
  const [uvIndexDescription, setUVIndexDescription] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [airQualityDescription, setAirQualityDescription] = useState(null);
  const [pressure, setPressure] = useState(null);

  // Hourly Forecast
  const [hourlyForecastOne, setHourlyForecastOne] = useState(null);

  // Ref Variables
  const userTempUnitRef = useRef(null);
  const userLocationPermissionRef = useRef(null);
  const apiCallsCountRef = useRef(0);
  const locationRetrieved = useRef(false);
  const tempF = useRef(null);
  const tempC = useRef(null);
  const feelsLikeF = useRef(null);
  const feelsLikeC = useRef(null);
  const highTempF = useRef(null);
  const highTempC = useRef(null);
  const lowTempF = useRef(null);
  const lowTempC = useRef(null);
  const windSpeedMph = useRef(null);
  const windSpeedKph = useRef(null);
  const windGustMph = useRef(null);
  const windGustKph = useRef(null);
  const visibilityMi = useRef(null);
  const visibilityKm = useRef(null);
  const pressureIn = useRef(null);
  const pressureMb = useRef(null);
  
  const hourlyForecastArrRef = useRef([]);
  let hourlyForecastArr;
  const dailyForecastArrRef = useRef([]);
  let dailyForecastArr;

  const FORECAST_API = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&days=3&alerts=yes&aqi=yes&q=`;
  
  let latAndLong = [];
  let data;
  let autocomplete;
  let customLocation;
  let timezoneOffset;
  let timeoutId;
  
  useEffect(() => {

    if (apiLoaded === false) {
      (async function loadAuto() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.id = 'google-script';

        document.head.appendChild(script);

        const googleScript = document.getElementById('google-script');

        googleScript.addEventListener('load', () => {
          const google = window.google;

          if (fetched === false) {
            fetchData();
            setFetched(true);
          }
          setApiLoaded(true);
        })

        window.initAutocomplete = function() {
          autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('autocomplete'), {
              types: ['(cities)'],
              fields: ['geometry', 'utc_offset_minutes']
            });
          
          autocomplete.addListener('place_changed', onPlaceSelected);
        }

        function onPlaceSelected() {
          const place = autocomplete.getPlace();

          if (!place.geometry) {
            document.getElementById('invalid-location-feedback').innerText = 'Please select a valid location';
            document.getElementById('autocomplete').oninput = () => {
              document.getElementById('invalid-location-feedback').innerText = '';
            }
          }
          else {
            customLocation = place.geometry.location;
            timezoneOffset = place.utc_offset_minutes;
            fetchData(customLocation.lat(), customLocation.lng());
          }
        }
      })();
    } 
    else if (fetched === false) {
      fetchData();
      setFetched(true);
    }

    async function fetchData(latitude, longitude) {
      let coordinates;
      let timestamp;
      let timestampDateObj;
      let timeHours;

      if (latitude && longitude) {
        $('#weather-info-container').css('display', 'none');
        $('#location-container').css('display', 'none');
        $('#app').removeClass('go-up-2');
        $('#extra-info-container').removeClass('go-down');
        $('#location-container').removeClass('go-up');
        $('#invalid-location-feedback').text('Loading your new location');

        const timeNow = new Date();
        const timeUTCHours = timeNow.getUTCHours();
        const offsetHours = timezoneOffset / 60;

        console.log('timeUTCHours & offsetHours', timeUTCHours, offsetHours);

        timeHours = timeUTCHours + offsetHours;

        if (timeHours > 23) timeHours = timeHours - 24;
        else if (timeHours < 0) timeHours = 24 + timeHours;

        latAndLong = [];
        latAndLong.push(Number(latitude));
        latAndLong.push(Number(longitude));
        console.log('timeHours: ', timeHours);
        locationRetrieved.current = true;
        fetchAndDisplayWeather(timeHours);
      }
      else {
        const navigatorObj = window.navigator;
        const geolocationObj = navigatorObj.geolocation;

        navigatorObj.permissions.query({ name: 'geolocation' }).then((permissionStatus => {
          if (permissionStatus.state === 'granted') {
            displayLoadingText('Loading your local weather');
            setLocationBtnDisabled(true);
          }
        }));

        geolocationObj.getCurrentPosition(async (position) => {
          userLocationPermissionRef.current = 'granted';
          displayLoadingText('Loading your local weather');
          setLocationBtnDisabled(true);
          coordinates = position.coords;
          timestamp = position.timestamp;
          timestampDateObj = new Date(timestamp);
          timeHours = timestampDateObj.getHours();
          latAndLong = [];
          latAndLong.push(Number(coordinates.latitude));
          latAndLong.push(Number(coordinates.longitude));
          locationRetrieved.current = true;
          fetchAndDisplayWeather(timeHours);
        }, () => {
            setLocationBtnDisabled(false);
            $('#weather-loading').text('Please turn on your location, or feel free to choose your location above');
  
            navigatorObj.permissions.query({ name: 'geolocation' }).then((permissionStatus => {
              permissionStatus.onchange = () => {
                displayLoadingText('Loading your local weather');
                setLocationBtnDisabled(true);
                fetchData();
              }
            }));
        }, { enableHighAccuracy: true });
      }
    }
  }, [tempUnit, temp, feelsLike, fetched, weatherIcon, sunsetTime, sunriseTime, setSunrise, setSunset, setWeatherIcon]);


  async function fetchAndDisplayWeather(hours) {
    if (locationRetrieved.current === true) {
      const locationQuery = `${latAndLong[0]},${latAndLong[1]}`;
      const response = await fetch(FORECAST_API + locationQuery);
      data = await response.json();

      apiCallsCountRef.current = apiCallsCountRef.current + 1;

      console.log('data: ', data);

      // Current weather icon
      console.log('data.current.condition.text: ', data.current.condition.text);
      setHourlyForecastOne(data.forecast.forecastday);

      const description = data.current.condition.text;
      const descriptionSplit = description.split(' ');

      if (descriptionSplit.length > 2) $('#description-div').css('font-size', '0.85rem');
      else $('#description-div').css('font-size', '1rem');

      const FAHRENHEIT_COUNTRIES = ['United States of America', 'Belize', 'Liberia', 'Bahamas', 'Cyprus', 'Montserrat', 'Palau', 'Turks and Caicos Islands', 'Saint Kitts and Nevis', 'Cayman Islands', 'Antigua and Barbuda', 'Virgin Islands', 'Marshall Islands', 'Micronesia'];
      
      // Empty the hourly forecast to prepare for a new location's information
      hourlyForecastArr = [];
      dailyForecastArr = [];
      $('#hourly-forecast-container').html('');
      $('#daily-forecast-container').html('');

      let dayOfForecast;
      let newHours = hours;

      if (hours === 23) {
        dayOfForecast = 1;
        newHours = 0;
      }
      else {
        dayOfForecast = 0;
        newHours = hours + 1;
      }

      if ((userTempUnitRef.current === '°F' && userLocationPermissionRef.current === 'granted') || FAHRENHEIT_COUNTRIES.indexOf(data.location.country) !== -1) {
        if (apiCallsCountRef.current === 1) {
          userTempUnitRef.current = '°F';
        }

        // DAILY FORECAST LOOP
        for (let i = 0; i < data.forecast.forecastday.length; i++) {
          let dateFormatted = data.forecast.forecastday[i].date;
          let date = new Date(data.forecast.forecastday[i].date_epoch * 1000);
          let dayNum = date.getUTCDay();
          let dayOfTheWeek;
  
          if (dayNum === 0) dayOfTheWeek = 'Sunday';
          else if (dayNum === 1) dayOfTheWeek = 'Monday';
          else if (dayNum === 2) dayOfTheWeek = 'Tuesday';
          else if (dayNum === 3) dayOfTheWeek = 'Wednesday';
          else if (dayNum === 4) dayOfTheWeek = 'Thursday';
          else if (dayNum === 5) dayOfTheWeek = 'Friday';
          else if (dayNum === 6) dayOfTheWeek = 'Saturday';

          if (i === 0) dayOfTheWeek = 'Today';

          if (i === 0) console.log('dayNum: ', dayNum);

          console.log('dayOfTheWeek: ', dayOfTheWeek);

          let dateShortened = data.forecast.forecastday[i].date.slice(6, 11);
  
          dailyForecastArr.push({ 
            mintemp_c: data.forecast.forecastday[i].day.mintemp_c,
            mintemp_f: data.forecast.forecastday[i].day.mintemp_f,
            maxtemp_c: data.forecast.forecastday[i].day.maxtemp_c,
            maxtemp_f: data.forecast.forecastday[i].day.maxtemp_f,
            day: dayOfTheWeek,
            date: data.forecast.forecastday[i].date,
            condition_text: data.forecast.forecastday[i].day.condition.text,
            condition_code: data.forecast.forecastday[i].day.condition.code
          });

          let iconProps = selectWeatherIcon(data.forecast.forecastday[i].day.condition.text, data.forecast.forecastday[i].day.condition.code, 12);

          if (i === 2) $('#daily-forecast-container').append(`<div class='daily-forecast-span flex basis-full align-items-center'><span class='basis-30 text-left flex-wrap'><span class='daily-forecast-date gray-text basis-full mr-1'>${dateShortened}</span><span class='daily-forecast-day font-bold basis-full'>${dayOfTheWeek}</span></span><span class='basis-45 flex-wrap daily-forecast-info justify-content-center flex'><span><img src=${iconProps.source} alt='${iconProps.alt}' class='daily-forecast-icon' /></span><span class='daily-forecast-highlow-container'><span class='daily-forecast-high'>${Math.round(data.forecast.forecastday[i].day.maxtemp_f)}°</span><span class='pipe-separator'>|</span><span class='daily-forecast-low'>${Math.round(data.forecast.forecastday[i].day.mintemp_f)}°</span></span></span><span class='basis-25 flex-wrap daily-forecast-rain flex justify-content-center align-items-center'><img src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png' alt='A cloud with rain drops coming out of it' class='daily-forecast-icon' /><span>${Math.round(data.forecast.forecastday[i].day.daily_chance_of_rain)}%</span></span></div>`);
          else $('#daily-forecast-container').append(`<div class='daily-forecast-span flex gray-border basis-full align-items-center'><span class='basis-30 text-left flex-wrap'><span class='daily-forecast-date gray-text basis-full mr-1'>${dateShortened}</span><span class='daily-forecast-day font-bold basis-full'>${dayOfTheWeek}</span></span><span class='basis-45 flex-wrap daily-forecast-info justify-content-center flex'><span><img src=${iconProps.source}  alt='${iconProps.alt}' class='daily-forecast-icon' /></span><span class='daily-forecast-highlow-container'><span class='daily-forecast-high'>${Math.round(data.forecast.forecastday[i].day.maxtemp_f)}°</span><span class='pipe-separator'>|</span><span class='daily-forecast-low'>${Math.round(data.forecast.forecastday[i].day.mintemp_f)}°</span></span></span><span class='basis-25 flex-wrap daily-forecast-rain flex justify-content-center align-items-center'><img src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png' alt='A cloud with rain drops coming out of it' class='daily-forecast-icon' /><span>${Math.round(data.forecast.forecastday[i].day.daily_chance_of_rain)}%</span></span></div>`);
        }

        // HOURLY FORECAST LOOP 1
        for (let i = newHours; i < data.forecast.forecastday[dayOfForecast].hour.length; i++) {
          console.log('i: ', i);
          const element = data.forecast.forecastday[dayOfForecast].hour[i];

          let timeSplit, hour, hour24, iconProps, hourlyTemp, highHourConverted;

          timeSplit = element.time.split(' ');
          if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) < 10) {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 0) {
              hour = '12 am';
              hour24 = 0;
            }
            else {
              hour = `${timeSplit[1][1]} am`;
              hour24 = Number(timeSplit[1][1]);
            }
          }
          else {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 10) {
              hour = '10 am';
              hour24 = 10;
            }
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 11) {
              hour = '11 am';
              hour24 = 11;
            } 
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 12) {
              hour = '12 pm';
              hour24 = 12;
            } 
            else {
              highHourConverted = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) - 12;
              hour = `${highHourConverted} pm`;
              hour24 = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`);
            }
          }

          iconProps = selectWeatherIcon(element.condition.text, element.condition.code, hour24);
          hourlyTemp = Math.round(element.temp_f);
          hourlyForecastArr.push({ c: element.temp_c, f: element.temp_f });

          $('#hourly-forecast-container').append(`<span class='hourly-forecast-span'><div class='hourly-forecast-hour'>${hour}</div><img src=${iconProps.source} alt='${iconProps.alt}' class='hourly-forecast-icon' /><div class='hourly-forecast-temp'>${hourlyTemp}°</div></span>`);
        };

        let hoursLeft;
        
        if (hours === 23) hoursLeft = 1;
        else hoursLeft = 24 - (24 - hours - 2);

        // HOURLY FORECAST LOOP 2
        for (let i = 0; i < hoursLeft; i++) {

          const element = data.forecast.forecastday[dayOfForecast + 1].hour[i];

          let timeSplit, hour, hour24, iconProps, hourlyTemp, highHourConverted;

          timeSplit = element.time.split(' ');

          if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) < 10) {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 0) {
              hour = '12 am';
              hour24 = 0;
            }
            else {
              hour = `${timeSplit[1][1]} am`;
              hour24 = Number(timeSplit[1][1]);
            }
          }
          else {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 10) {
              hour = '10 am';
              hour24 = 10;
            }
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 11) {
              hour = '11 am';
              hour24 = 11;
            } 
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 12) {
              hour = '12 pm';
              hour24 = 12;
            } 
            else {
              highHourConverted = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) - 12;
              hour = `${highHourConverted} pm`;
              hour24 = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`);
            }
          }

          iconProps = selectWeatherIcon(element.condition.text, element.condition.code, hour24);
          hourlyTemp = Math.round(element.temp_f);
          hourlyForecastArr.push({ c: element.temp_c, f: element.temp_f });

          $('#hourly-forecast-container').append(`<span class='hourly-forecast-span'><div class='hourly-forecast-hour'>${hour}</div><img src=${iconProps.source} alt='${iconProps.alt}' class='hourly-forecast-icon' /><div class='hourly-forecast-temp'>${hourlyTemp}°</div></span>`);
        };

        selectWeatherIcon(data.current.condition.text, data.current.condition.code, hours);
        setTemp(Math.round(data.current.temp_f));
        setLowTemp(Math.round(data.forecast.forecastday[0].day.mintemp_f));
        setHighTemp(Math.round(data.forecast.forecastday[0].day.maxtemp_f));
        setFeelsLike(Math.round(data.current.feelslike_f));
        setWindSpeed(`${data.current.wind_mph} mph`);
        setVisibility(`${data.current.vis_miles} mi`);
        setPressure(`${data.current.pressure_in} in`);
        setTempUnit('°F');
        setFahrenheitBtnDisabled(true);
        setCelsiusBtnDisabled(false);

        // $('#fahrenheit-button').css('color', 'white');
        // $('#celsius-button').css('color', 'gray');

        tempF.current = Math.round(data.current.temp_f);
        tempC.current = Math.round(data.current.temp_c);
        feelsLikeF.current = Math.round(data.current.feelslike_f);
        feelsLikeC.current = Math.round(data.current.feelslike_c);
        highTempF.current = Math.round(data.forecast.forecastday[0].day.maxtemp_f);
        highTempC.current = Math.round(data.forecast.forecastday[0].day.maxtemp_c);
        lowTempF.current = Math.round(data.forecast.forecastday[0].day.mintemp_f);
        lowTempC.current = Math.round(data.forecast.forecastday[0].day.mintemp_c);
        windSpeedMph.current = `${data.current.wind_mph} mph`;
        windSpeedKph.current = `${data.current.wind_kph} kph`;
        visibilityMi.current = `${data.current.vis_miles} mi`;
        visibilityKm.current = `${data.current.vis_km} km`;
        pressureIn.current = `${data.current.pressure_in} in`;
        pressureMb.current = `${data.current.pressure_mb} mb`;

        if (!data.current.gust_mph) setWindGust('0 mph');
        else {
          windGustMph.current = `${data.current.gust_mph} mph`;
          windGustKph.current = `${data.current.gust_kph} kph`;
          setWindGust(`${data.current.gust_mph} mph`);
        }
      }
      else {
        if (apiCallsCountRef.current === 1) {
          userTempUnitRef.current = '°C';
        }

        // DAILY FORECAST LOOP
        for (let i = 0; i < data.forecast.forecastday.length; i++) {
          let date = new Date(data.forecast.forecastday[i].date_epoch * 1000);
          let dayNum = date.getUTCDay();
          let dayOfTheWeek;
  
          if (dayNum === 0) dayOfTheWeek = 'Sunday';
          else if (dayNum === 1) dayOfTheWeek = 'Monday';
          else if (dayNum === 2) dayOfTheWeek = 'Tuesday';
          else if (dayNum === 3) dayOfTheWeek = 'Wednesday';
          else if (dayNum === 4) dayOfTheWeek = 'Thursday';
          else if (dayNum === 5) dayOfTheWeek = 'Friday';
          else if (dayNum === 6) dayOfTheWeek = 'Saturday';

          if (i === 0) dayOfTheWeek = 'Today';

          if (i === 0) console.log('dayNum: ', dayNum);

          console.log('dayOfTheWeek: ', dayOfTheWeek);
  
          let dateShortened = data.forecast.forecastday[i].date.slice(6, 11);
  
          dailyForecastArr.push({ 
            mintemp_c: data.forecast.forecastday[i].day.mintemp_c,
            mintemp_f: data.forecast.forecastday[i].day.mintemp_f,
            maxtemp_c: data.forecast.forecastday[i].day.maxtemp_c,
            maxtemp_f: data.forecast.forecastday[i].day.maxtemp_f,
            day: dayOfTheWeek,
            date: data.forecast.forecastday[i].date,
            condition_text: data.forecast.forecastday[i].day.condition.text,
            condition_code: data.forecast.forecastday[i].day.condition.code
          });

          let iconProps = selectWeatherIcon(data.forecast.forecastday[i].day.condition.text, data.forecast.forecastday[i].day.condition.code, 12);
          
          if (i === 2) $('#daily-forecast-container').append(`<div class='daily-forecast-span flex basis-full align-items-center'><span class='basis-30 text-left flex-wrap'><span class='daily-forecast-date gray-text basis-full mr-1'>${dateShortened}</span><span class='daily-forecast-day font-bold basis-full'>${dayOfTheWeek}</span></span><span class='basis-45 flex-wrap daily-forecast-info justify-content-center flex'><span><img src=${iconProps.source} alt='${iconProps.alt}' class='daily-forecast-icon' /></span><span class='daily-forecast-highlow-container'><span class='daily-forecast-high'>${Math.round(data.forecast.forecastday[i].day.maxtemp_c)}°</span><span class='pipe-separator'>|</span><span class='daily-forecast-low'>${Math.round(data.forecast.forecastday[i].day.mintemp_c)}°</span></span></span><span class='basis-25 flex-wrap daily-forecast-rain flex justify-content-center align-items-center'><img src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png' alt='A cloud with rain drops coming out of it' class='daily-forecast-icon' /><span>${Math.round(data.forecast.forecastday[i].day.daily_chance_of_rain)}%</span></span></div>`);
          else $('#daily-forecast-container').append(`<div class='daily-forecast-span flex gray-border basis-full align-items-center'><span class='basis-30 text-left flex-wrap'><span class='daily-forecast-date gray-text basis-full mr-1'>${dateShortened}</span><span class='daily-forecast-day font-bold basis-full'>${dayOfTheWeek}</span></span><span class='basis-45 flex-wrap daily-forecast-info justify-content-center flex'><span><img src=${iconProps.source}  alt='${iconProps.alt}' class='daily-forecast-icon' /></span><span class='daily-forecast-highlow-container'><span class='daily-forecast-high'>${Math.round(data.forecast.forecastday[i].day.maxtemp_c)}°</span><span class='pipe-separator'>|</span><span class='daily-forecast-low'>${Math.round(data.forecast.forecastday[i].day.mintemp_c)}°</span></span></span><span class='basis-25 flex-wrap daily-forecast-rain flex justify-content-center align-items-center'><img src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png' alt='A cloud with rain drops coming out of it' class='daily-forecast-icon' /><span>${Math.round(data.forecast.forecastday[i].day.daily_chance_of_rain)}%</span></span></div>`);
        }

        for (let i = hours + 1; i < data.forecast.forecastday[dayOfForecast].hour.length; i++) {
          const element = data.forecast.forecastday[dayOfForecast].hour[i];

          let timeSplit, hour, hour24, iconProps, hourlyTemp, highHourConverted;

          timeSplit = element.time.split(' ');
          if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) < 10) {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 0) {
              hour = '12 am';
              hour24 = 0;
            }
            else {
              hour = `${timeSplit[1][1]} am`;
              hour24 = Number(timeSplit[1][1]);
            }
          }
          else {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 10) {
              hour = '10 am';
              hour24 = 10;
            }
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 11) {
              hour = '11 am';
              hour24 = 11;
            } 
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 12) {
              hour = '12 pm';
              hour24 = 12;
            } 
            else {
              highHourConverted = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) - 12;
              hour = `${highHourConverted} pm`;
              hour24 = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`);
            }
          }

          iconProps = selectWeatherIcon(element.condition.text, element.condition.code, hour24);
          hourlyTemp = Math.round(element.temp_f);
          hourlyForecastArr.push({ c: element.temp_c, f: element.temp_f });

          $('#hourly-forecast-container').append(`<span class='hourly-forecast-span'><div class='hourly-forecast-hour'>${hour}</div><img src=${iconProps.source} alt='${iconProps.alt}' class='hourly-forecast-icon' /><div class='hourly-forecast-temp'>${hourlyTemp}°</div></span>`);
        };

        let hoursLeft;
        
        if (hours === 23) hoursLeft = 1;
        else hoursLeft = 24 - (24 - hours - 2);

        for (let i = 0; i < hoursLeft; i++) {

          const element = data.forecast.forecastday[dayOfForecast + 1].hour[i];

          let timeSplit, hour, hour24, iconProps, hourlyTemp, highHourConverted;

          timeSplit = element.time.split(' ');
          if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) < 10) {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 0) {
              hour = '12 am';
              hour24 = 0;
            }
            else {
              hour = `${timeSplit[1][1]} am`;
              hour24 = Number(timeSplit[1][1]);
            }
          }
          else {
            if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 10) {
              hour = '10 am';
              hour24 = 10;
            }
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 11) {
              hour = '11 am';
              hour24 = 11;
            } 
            else if (Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) === 12) {
              hour = '12 pm';
              hour24 = 12;
            } 
            else {
              highHourConverted = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`) - 12;
              hour = `${highHourConverted} pm`;
              hour24 = Number(`${timeSplit[1][0]}${timeSplit[1][1]}`);
            }
          }
          iconProps = selectWeatherIcon(element.condition.text, element.condition.code, hour24);
          hourlyTemp = Math.round(element.temp_c);
          hourlyForecastArr.push({ c: element.temp_c, f: element.temp_f });

          $('#hourly-forecast-container').append(`<span class='hourly-forecast-span'><div class='hourly-forecast-hour'>${hour}</div><img src=${iconProps.source} alt='${iconProps.alt}' class='hourly-forecast-icon' /><div class='hourly-forecast-temp'>${hourlyTemp}°</div></span>`);
        };
        
        setTemp(Math.round(data.current.temp_c));
        setLowTemp(Math.round(data.forecast.forecastday[0].day.mintemp_c));
        setHighTemp(Math.round(data.forecast.forecastday[0].day.maxtemp_c));
        setFeelsLike(Math.round(data.current.feelslike_c));
        setWindSpeed(`${data.current.wind_kph} kph`);
        setVisibility(`${data.current.vis_km} km`);
        setPressure(`${data.current.pressure_mb} mb`);
        setTempUnit('°C');
        setFahrenheitBtnDisabled(false);
        setCelsiusBtnDisabled(true);

        // $('#fahrenheit-button').css('color', 'gray');
        // $('#celsius-button').css('color', 'white');

        tempF.current = Math.round(data.current.temp_f);
        tempC.current = Math.round(data.current.temp_c);
        feelsLikeF.current = Math.round(data.current.feelslike_f);
        feelsLikeC.current = Math.round(data.current.feelslike_c);
        highTempF.current = Math.round(data.forecast.forecastday[0].day.maxtemp_f);
        highTempC.current = Math.round(data.forecast.forecastday[0].day.maxtemp_c);
        lowTempF.current = Math.round(data.forecast.forecastday[0].day.mintemp_f);
        lowTempC.current = Math.round(data.forecast.forecastday[0].day.mintemp_c);
        windSpeedMph.current = `${data.current.wind_mph} mph`;
        windSpeedKph.current = `${data.current.wind_kph} kph`;
        visibilityMi.current = `${data.current.vis_miles} mi`;
        visibilityKm.current = `${data.current.vis_km} km`;
        pressureIn.current = `${data.current.pressure_in} in`;
        pressureMb.current = `${data.current.pressure_mb} mb`;

        if (!data.current.gust_mph) setWindGust('0 kph');
        else {
          windGustMph.current = `${data.current.gust_mph} mph`;
          windGustKph.current = `${data.current.gust_kph} kph`;
          setWindGust(`${data.current.gust_mph} kph`);
        }
      }

      dailyForecastArrRef.current = dailyForecastArr;
      hourlyForecastArrRef.current = hourlyForecastArr;

      setLocation(data.location.name);
      if (data.location.name.length >= 16 && data.location.name.length < 19) {
        $('#location, #location-icon').css('font-size', '1rem');
      }
      else if (data.location.name.length >= 19 && data.location.name.length < 22) {
        $('#location, #location-icon').css('font-size', '0.9rem');
      } 
      else if (data.location.name.length >= 22) {
        $('#location, #location-icon').css('font-size', '0.8rem');
      }

      setDescription(description);
      setHumidity(data.current.humidity);
      setWindDegree(data.current.wind_degree);
      setWindDirection(data.current.wind_dir);

      const windDirectionIconRotation = data.current.wind_degree - 45;

      $('#wind-direction-icon').css('transform', `rotate(${windDirectionIconRotation}deg)`);

      let sunriseFormatted, sunsetFormatted;

      if (data.forecast.forecastday[0].astro.sunrise[0] === '0') sunriseFormatted = data.forecast.forecastday[0].astro.sunrise.slice(1, 9);
      else sunriseFormatted = data.forecast.forecastday[0].astro.sunrise;

      setSunrise(sunriseFormatted);

      if (data.forecast.forecastday[0].astro.sunset[0] === '0') sunsetFormatted = data.forecast.forecastday[0].astro.sunset.slice(1, 9);
      else sunsetFormatted = data.forecast.forecastday[0].astro.sunset;

      setSunset(sunsetFormatted);
      
      setAirQuality(data.current.air_quality['us-epa-index']);

      // Air quality colors: (0, 228, 0), (255, 255, 0), (255, 126, 0), (255, 0, 0), (143, 63, 151), (126, 0, 35)
      if (data.current.air_quality['us-epa-index'] === 1) {
        setAirQualityDescription('Good');
        $('#air-quality-number-container').css('background', 'linear-gradient(0deg, rgb(0, 228, 0) 16%, gray 16%)');
      }
      else if (data.current.air_quality['us-epa-index'] === 2) {
        setAirQualityDescription('Moderate');
        $('#air-quality-number-container').css('background', 'linear-gradient(0deg, rgb(255, 255, 0) 33%, gray 33%)');
      }
      else if (data.current.air_quality['us-epa-index'] === 3) {
        setAirQualityDescription('Unhealthy for sensitive groups');
        $('#air-quality-number-container').css('background', 'linear-gradient(0deg, rgb(255, 126, 0) 50%, gray 50%)');
      } 
      else if (data.current.air_quality['us-epa-index'] === 4) {
        setAirQualityDescription('Unhealthy');
        $('#air-quality-number-container').css('background', 'linear-gradient(0deg, rgb(255, 0, 0) 66%, gray 66%)');
      } 
      else if (data.current.air_quality['us-epa-index'] === 5) {
        setAirQualityDescription('Very unhealthy');
        $('#air-quality-number-container').css('background', 'linear-gradient(0deg, rgb(143, 63, 151) 83%, gray 83%)');
      } 
      else if (data.current.air_quality['us-epa-index'] === 6) {
        setAirQualityDescription('Hazardous');
        $('#air-quality-number-container').css('background', 'linear-gradient(0deg, rgb(126, 0, 35) 100%)');
      }

      setUVIndex(data.current.uv);

      // UV Colors: #299501, #f7e401, #f95a01, #d90111, #6c49c9
      if (data.current.uv >= 0 && data.current.uv <= 2) {
        setUVIndexDescription('Low');
        $('#uv-number-container').css('background', 'linear-gradient(0deg, rgb(0, 228, 0) 9%, gray 9%)');
      } 
      else if (data.current.uv >= 3 && data.current.uv <= 5) {
        setUVIndexDescription('Moderate');
        $('#uv-number-container').css('background', 'linear-gradient(0deg, rgb(255, 126, 0) 36%, gray 36%)');
      } 
      else if (data.current.uv >= 6 && data.current.uv <= 7) {
        setUVIndexDescription('High');
        $('#uv-number-container').css('background', 'linear-gradient(0deg, rgb(255, 0, 0) 59%, gray 59%)');
      }
      else if (data.current.uv >= 8 && data.current.uv <= 10) {
        setUVIndexDescription('Very high');
        $('#uv-number-container').css('background', 'linear-gradient(0deg, rgb(143, 63, 151) 82%, gray 82%)');
      }
      else if (data.current.uv >= 11) {
        setUVIndexDescription('Extreme');
        $('#uv-number-container').css('background', 'linear-gradient(0deg, rgb(126, 0, 35)) 100%)');
      }

      console.log('hours: ', hours);

      if (hours >= 21 || (hours >= 0 && hours < 6)) {
        $('#app').css('color', 'white');
        $('#app').css('background-color', '#024d89');
        $('#app').addClass('shadow-2');
        
        $('#brand-text-container, #location-search-div, #navbar-container, .uv-air-number, .extra-info-sections').css('background-color', '#1F1F1F');
        
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);
        
        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-nightsky-1-landscape-2.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-nightsky-1.jpg")');
      }
      else if (hours >= 6 && hours < 10) {
        console.log('between 6 and 10');
        $('#app').css('background-color', 'transparent');
        $('#app').css('color', 'black');
        $('#app').removeClass('shadow-2');

        $('#brand-text-container, #location-search-div, #navbar-container, .uv-air-number, .extra-info-sections').css('background-color', 'black');
        
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);

        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-dusk-1-landscape-2.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-dusk-1.jpg")');
      }
      else if (hours >= 10 && hours < 18) {
        $('#app').css('color', 'black');
        $('#app').addClass('shadow-2');
        $('#app').css('background-color', '#45c7f3');

        $('#brand-text-container, #location-search-div, #navbar-container, .uv-air-number, .extra-info-sections').css('background-color', 'black');

        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);

        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-bluesky-1-landscape.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-bluesky-1.jpg")');
      }
      else if (hours >= 18 && hours < 21) {
        $('#app').css('background-color', 'transparent');
        $('#app').css('color', 'black');
        $('#app').removeClass('shadow-2');

        $('#brand-text-container, #location-search-div, #navbar-container, .uv-air-number, .extra-info-sections').css('background-color', 'black');

        $('#brand-text-container').css('background-color', 'black');
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);

        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunset-1-landscape.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunset-1.jpg")');
      }

      $('#weather-loading').css('display', 'none');
      $('#weather-loading').removeClass('height');
      
      $('#app').addClass('height');
      $('#app').css('margin-bottom', '1.5rem');
      $('#weather-info-container').css('display', 'grid');
      $('#location-container').css('display', 'flex');
      $('#sunrise-sunset-container').css('display', 'flex');
      $('.extra-info-sections').css('display', 'flex');
      
      setLocationBtnDisabled(false);
      closeLocationSearch();
      $('#autocomplete').val('');
    }
  }

  function selectWeatherIcon(conditionText, conditionCode, hours) {
    let iconProps, iconSource, iconAlt;

    // Partly cloudy
    if (conditionText === 'Partly cloudy') {
      $('#icon').removeClass('spin-once');

      if (hours >= 6 && hours < 21) {
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-sun-1b.png');
        iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-sun-1b.png';
        iconAlt = 'Two clouds with the sun peeking between them';
      } 
      else {
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-moon-1b.png');
        iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-moon-1b.png';
        iconAlt = 'Two clouds with the moon peeking between them';
      }
      setWeatherType('Clouds');
    }
    // Clear
    else if (conditionText === 'Clear' || conditionText === 'Sunny') {
      if (hours >= 6 && hours < 21) {
        $('#icon').addClass('spin-once');
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunny-2.png');
        iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunny-2.png';
        iconAlt = 'The sun';
      } 
      else {
        $('#icon').removeClass('spin-once');
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-moon-1.png');
        iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-moon-1.png';
        iconAlt = 'The moon';
      }
      setWeatherType('Clear');
    }
    // Cloudy / Overcast
    else if (conditionText === 'Cloudy' || conditionText === 'Overcast') {
      $('#icon').removeClass('spin-once');
      setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-gray.png');
      iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-gray.png';
      iconAlt = 'Three gray clouds of various sizes grouped together';
    }
    // Mist and Fog
    else if (conditionText === 'Mist' || conditionText === 'Fog' || conditionText === 'Freezing fog') {
      $('#icon').removeClass('spin-once');
      setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-mist-2.png');
      setWeatherType('Mist');
      iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-mist-2.png';
      iconAlt = 'An elongated group of mist or fog';
    }
    // Thunder
    else if (THUNDER_CODES.indexOf(conditionCode) !== -1) {
      $('#icon').removeClass('spin-once');
      setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-thunderstorm-2b.png');
      iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-thunderstorm-2b.png';
      iconAlt = 'A cloud with lightning and rain drops coming out of it';
      setWeatherType('Thunderstorm');
    }
    // Rain
    else if (RAIN_CODES.indexOf(conditionCode) !== -1) {
      $('#icon').removeClass('spin-once');
      setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png');
      iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png';
      iconAlt = 'A cloud with rain drops coming out of it';
      setWeatherType('Rain');
    }
    // Snow
    else if (SNOW_CODES.indexOf(conditionCode) !== -1) {
      $('#icon').removeClass('spin-once');
      setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-snow-2b.png');
      iconSource = 'https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-snow-2b.png';
      iconAlt = 'Two clouds with snow coming out of them';
      setWeatherType('Snow');
    }

    setWeatherIconAlt(iconAlt);
    iconProps = { source: iconSource, alt: iconAlt };

    return iconProps;
  }

  function displayLoadingText(text) {
    const tempLoadingDiv = document.getElementById('weather-loading');

    timeoutId = setTimeout(() => {
      tempLoadingDiv.innerText = `${text}`;
    }, 800);
    timeoutId = setTimeout(() => {
      tempLoadingDiv.innerText = `${text}.`;
    }, 1600);
    timeoutId = setTimeout(() => {
      tempLoadingDiv.innerText = `${text}..`;
    }, 2400);
    timeoutId = setTimeout(() => {
      tempLoadingDiv.innerText = `${text}...`;
    }, 3200);
  }

  function convertToCelsius() {
    let hourlyForecastElements, dailyForecastHighElements, dailyForecastLowElements;
    
    hourlyForecastElements = document.querySelectorAll('.hourly-forecast-temp');
    dailyForecastHighElements = document.querySelectorAll('.daily-forecast-high');
    dailyForecastLowElements = document.querySelectorAll('.daily-forecast-low');

    for (let i = 0; i < hourlyForecastElements.length; i++) {
      hourlyForecastElements[i].innerText = `${Math.round(hourlyForecastArrRef.current[i].c)}°`;
    }

    for (let i = 0; i < dailyForecastHighElements.length; i++) {
      dailyForecastHighElements[i].innerText = `${Math.round(dailyForecastArrRef.current[i].maxtemp_c)}°`;
      dailyForecastLowElements[i].innerText = `${Math.round(dailyForecastArrRef.current[i].mintemp_c)}°`;
    }

    // $('#fahrenheit-button').css('color', 'gray');
    // $('#celsius-button').css('color', 'white');

    setTemp(tempC.current);
    setFeelsLike(feelsLikeC.current);
    setHighTemp(highTempC.current);
    setLowTemp(lowTempC.current);
    setWindSpeed(windSpeedKph.current);
    setWindGust(windGustKph.current);
    setVisibility(visibilityKm.current);
    setPressure(pressureMb.current);
    setTempUnit('°C');
    setFahrenheitBtnDisabled(false);
    setCelsiusBtnDisabled(true);
  }

  function convertToFahrenheit() {
    let hourlyForecastElements, dailyForecastHighElements, dailyForecastLowElements;
    
    hourlyForecastElements = document.querySelectorAll('.hourly-forecast-temp');
    dailyForecastHighElements = document.querySelectorAll('.daily-forecast-high');
    dailyForecastLowElements = document.querySelectorAll('.daily-forecast-low');

    for (let i = 0; i < hourlyForecastElements.length; i++) {
      hourlyForecastElements[i].innerText = `${Math.round(hourlyForecastArrRef.current[i].f)}°`;
    }

    for (let i = 0; i < dailyForecastHighElements.length; i++) {
      dailyForecastHighElements[i].innerText = `${Math.round(dailyForecastArrRef.current[i].maxtemp_f)}°`;
      dailyForecastLowElements[i].innerText = `${Math.round(dailyForecastArrRef.current[i].mintemp_f)}°`;
    }

    // $('#fahrenheit-button').css('color', 'white');
    // $('#celsius-button').css('color', 'gray');

    setTemp(tempF.current);
    setFeelsLike(feelsLikeF.current);
    setHighTemp(highTempF.current);
    setLowTemp(lowTempF.current);
    setWindSpeed(windSpeedMph.current);
    setWindGust(windGustMph.current);
    setVisibility(visibilityMi.current);
    setPressure(pressureIn.current);
    setTempUnit('°F');
    setFahrenheitBtnDisabled(true);
    setCelsiusBtnDisabled(false);
}

  function openLocationSearch() {
    $('#invalid-location-feedback').text('');
    $('#autocomplete').animate({ width: '100%'}, 750);
    $('#location-search-div').css('display', 'flex');
    $('#location-search-div').css('flex-direction', 'column');
    $('html').css('overflow-y', 'hidden');
  }

  function closeLocationSearch() {
    $('#autocomplete').css('width', '0%');
    $('#location-search-div').css('display', 'none');
    $('html').css('overflow-y', 'visible');
  }

  return (
    <div id='outermost-container'>
      <div id='location-search-div'>
        <button onClick={closeLocationSearch} id='close-location-search' className='gray-text' aria-label='Close the location search'><FontAwesomeIcon icon={faXmark} /></button>
          {/* <label htmlFor='autocomplete'></label> */}
        <p id='invalid-location-feedback' className='text-base text-white'></p>
        <input id='autocomplete' name='autocomplete' className='expand text-base' placeholder='Enter a location' type='text'/>
      </div>
      <div className='flex shadow-2' id='navbar-container'>
        <div className='width flex justify-content-center align-items-center' id='navbar-container-2'>
          <div id='change-location-container' className='text-left basis-50'>
            <button id='change-location-button' className='text-base' aria-label='Choose a new location' onClick={openLocationSearch} disabled={locationBtnDisabled}>Choose location</button>
          </div>
          <span id="temp-unit-span" className='text-right basis-50 text-white'>
            <button id='fahrenheit-button' className="temp-unit-button text-base button-2" name="change-temperature-unit" aria-label='Change the temperature unit to Fahrenheit' onClick={convertToFahrenheit} disabled={fahrenheitBtnDisabled}>°F</button>
            <span id='temp-unit-pipe' className='pipe-separator gray-text'>|</span>
            <button id='celsius-button' className="temp-unit-button text-base button-2" name="change-temperature-unit" aria-label='Change the temperature unit to Celsius' onClick={convertToCelsius} disabled={celsiusBtnDisabled}>°C</button>
          </span>
        </div>
      </div>
      <div id="app-container" className='flex justify-content-center align-items-center'>
        <div className='flex-wrap width' id='app-container-child'>
          <div className="App width text-white justify-content-center align-items-center flex" id='app'>
            <div id="weather-loading" className="height flex text-base justify-content-center align-items-center"></div>
            <div id='location-container' className='align-items-center'>
              <div id="location" className="letter-spacing-4 shadow"><span id="location-text" className=''>{location}</span></div>
              <FontAwesomeIcon id="location-icon" icon={faLocationDot} />
            </div>
            <div id="weather-info-container">
              <div id="first-col" className="flex-wrap">
                <div id="temp-div" className="flex-nowrap flex">
                  <div className='temp-child'>
                    <span id="temp-span" className="line-height" name="temperature">{temp}</span>
                    <span id="temp-unit" className="line-height">{tempUnit}</span>
                  </div>
                  <div id='feels-like' className='text-base basis-full'><span className=''>Feels like</span> {feelsLike}°</div>
                </div>
                <div id='high-low' className='flex text-base basis-full justify-content-center align-items-center'>
                  <span><span id='high-text' className='font-bold' hidden>High</span> {highTemp}°<span className='pipe-separator'>|</span><span id='low-text' className='font-bold' hidden>Low </span>{lowTemp}°</span>
                </div>
              </div>
              <div id="second-col" className='flex-wrap'>
                <div id="icon-div" className='basis-full'><img id="icon" alt={weatherIconAlt} src={weatherIcon} /></div>
                <div id="description-div" className='text-base basis-full'>
                  <p id="description-text" className='letter-spacing-2'>{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='width extra-info-sections text-white shadow-2' id='hourly-forecast-container'>
          </div>
          <div className='width extra-info-sections text-white shadow-2' id='daily-forecast-container'>
          </div>
          <div className='width extra-info-sections text-white shadow-2 text-white' id='wind-container'>
            <div className='basis-full' id='wind-header-container'>
              <p id='wind-header' className='extra-info-header letter-spacing-2 gray-border'>Wind</p>
            </div>
            <div className='extra-info wind-info basis-33' id='wind-speed-container'>
            <p className='wind-info-header letter-spacing-2'>Speed</p>
              <FontAwesomeIcon className='extra-info-icons' id="wind-icon" icon={faWind} />
              <p className='extra-info-number' id="wind-speed">{windSpeed}</p>
            </div>
            <div className='extra-info wind-info basis-33' id='wind-direction-container'>
              <p className='wind-info-header letter-spacing-2'>Direction</p>
              <FontAwesomeIcon className='extra-info-icons' id="wind-direction-icon" icon={faLocationArrow} />
              <p className='extra-info-number' id="wind-direction">{windDirection}</p>
            </div>
            <div className='extra-info wind-info basis-33' id='wind-gust-container'>
              <p className='wind-info-header letter-spacing-2'>Gust</p>
              <FontAwesomeIcon className='extra-info-icons' id="wind-gust-icon" icon={faArrowUpWideShort} />
              <p className='extra-info-number' id="wind-gust">{windGust}</p>
            </div>
          </div>
          <div className='width extra-info-sections text-white shadow-2' id='sunrise-sunset-container'>
            <div className='' id='sunrise-sunset-icon-container'>
            </div>
            <div id='sunrise-sunset-info' className='flex basis-full'>
              <div className='basis-50' id='sunrise-container'>
                <p className='letter-spacing-2 font-bold'>Sunrise</p>
                <div className='mask'>
                  <img id='sunrise-icon' className='basis-full sunrise-sunset-icon' src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/sunrise-2b.png' alt='The sun with an up-arrow above it' />
                </div>
                <p className='letter-spacing-2' id='sunrise-time'>{sunriseTime}</p>
              </div>
              <div className='basis-50' id='sunset-container'>
                <p className='letter-spacing-2 font-bold'>Sunset</p>
                <div className='mask'>
                  <img id='sunset-icon' className='basis-full sunrise-sunset-icon' src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/sunset-2b.png' alt='The sun with a down-arrow above it' />
                </div>
                <p className='letter-spacing-2'>{sunsetTime}</p>
              </div>
            </div>
          </div>
          <div className='extra-info-sections text-white width shadow-2 text-white' id='extra-info-section' hidden>
            <div className='flex basis-full align-items-center' id='extra-info-container'>
              <div id="humidity-container" className='shadow basis-33'>
                <p id='humidity-header' className='extra-info-header letter-spacing-2'>Humidity</p>
                <FontAwesomeIcon className='extra-info-icons' id='droplet' icon={faDroplet} />
                <p className='extra-info-number' id="humidity-number">{humidity}%</p>
              </div>
              <div id="visibility-container" className='shadow basis-33'>
                <p id='visibility-header' className='extra-info-header letter-spacing-2'>Visibility</p>
                <img className='extra-info-icons' id="visibility-icon" src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/eye-solid-edited-1b.png' alt='An eye with a brown iris' />
                <p className='extra-info-number' id="visibility-number">{visibility}</p>
              </div>
              <div id="pressure-container" className='shadow basis-33'>
                <p id='pressure-header' className='extra-info-header letter-spacing-2'>Pressure</p>
                <FontAwesomeIcon className='extra-info-icons' icon={faDownLeftAndUpRightToCenter} />
                <p className='extra-info-number' id="pressure-number">{pressure}</p>
              </div>
            </div>
          </div>
          <div className='width extra-info-sections text-white shadow-2' id='uv-air-container'>
            <div className='basis-50' id='uv-container'>
              <p className='letter-spacing-2 font-bold'>UV Index</p>
              <div className='' >
                <div id='uv-number-container'>
                  <p className='uv-air-number' id="uv-number">{uvIndex}</p>
                </div>
              </div>
              <p className='extra-info-number'>{uvIndexDescription}</p>
            </div>
            <div className='basis-50' id='air-quality-container'>
              <p className='letter-spacing-2 font-bold'>Air Quality</p>
              <div>
                <div id='air-quality-number-container'>
                  <p className='uv-air-number' id="air-quality-number">{airQuality}</p>
                </div>
              </div>
              <p className='extra-info-number'>{airQualityDescription}</p>
            </div>
          </div>
        </div>
        <div id='brand-text-container' className='flex gray-text'>
          <div id='brand-with-copyright' className='flex align-items-center'>
            <span>Copyright © 2023</span>
            <img id='brand-text' alt='The "weather here" text logo' src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/weatherapp-brand-text-white-2.png' />
          </div>
          <div className='basis-full' id='weather-api-credit'>
            Powered by <a href="https://www.weatherapi.com/" title="Free Weather API">WeatherAPI.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;