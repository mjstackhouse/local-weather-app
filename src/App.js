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
  
  const [tempUnit, setTempUnit] = useState(null);
  const [temp, setTemp] = useState(null);
  const [lowTemp, setLowTemp] = useState(null);
  const [highTemp, setHighTemp] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [weatherIcon2, setWeatherIcon2] = useState(null);
  const [weatherType, setWeatherType] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [windDegree, setWindDegree] = useState(null);
  const [windDirection, setWindDirection] = useState(null);
  const [windGust, setWindGust] = useState(null);
  const [visibility, setVisibility] = useState(null);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [displayMode, setDisplayMode] = useState('dark');

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

  const weatherLoadingDiv = document.getElementById('weather-loading');
  const newWeatherLoadingInput = document.getElementById('autocomplete');
  const locationDiv = document.getElementById('location-container');
  const weatherInfoContainer = document.getElementById('weather-info-container');
  // const api = 'https://weather-proxy.freecodecamp.rocks/api/current?';
  // const CURRENT_API = `http://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=`;
  const FORECAST_API = `http://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&days=3&alerts=yes&aqi=yes&q=`;
  
  // let locationRetrieved = false;
  let latAndLong = [];
  let data;
  // let currentData;
  // let forecastData;
  let fccWeatherIcon;
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
        timeHours = timeUTCHours + offsetHours;
        latAndLong = [];
        latAndLong.push(Number(latitude));
        latAndLong.push(Number(longitude));
        locationRetrieved.current = true;
        fetchAndDisplayWeather(timeHours);
      }
      else {
        const navigatorObj = window.navigator;
        const geolocationObj = navigatorObj.geolocation;

        navigatorObj.permissions.query({ name: 'geolocation' }).then((permissionStatus => {
          if (permissionStatus.state === 'granted') {
            displayLoadingText('Loading your local weather');
          }
        }));

        geolocationObj.getCurrentPosition(async (position) => {
          // setUserLocationPermission('granted');
          userLocationPermissionRef.current = 'granted';
          displayLoadingText('Loading your local weather');
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
            $('#weather-loading').text('Please turn on your location, or feel free to choose your location above');
  
            navigatorObj.permissions.query({ name: 'geolocation' }).then((permissionStatus => {
              permissionStatus.onchange = () => {
                displayLoadingText('Loading your local weather');
                fetchData();
              }
            }));
        });
      }
    }
  }, [tempUnit, temp, feelsLike, fetched, weatherIcon, sunset, sunrise, setSunrise, setSunset, setWeatherIcon]);


  async function fetchAndDisplayWeather(hours) {
    if (locationRetrieved.current === true) {
      if (hours >= 21 || (hours >= 0 && hours < 6)) {
        $('#app').css('color', 'white');
        $('#app').addClass('shadow-2');
        
        $('#brand-text-container').css('background-color', '#1F1F1F');
        $('#location-search-div').css('background-color', '#1F1F1F');
        $('#brand-container').css('background-color', '#1F1F1F');
        $('#extra-info-section').css('background-color', '#1F1F1F');
        $('#wind-outer-container').css('background-color', '#1F1F1F');

        // $('#icon').css('filter', 'brightness(1)');

        $('#app').css('background-color', '#024d89');
        
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);
        $('#weather-loading').css('display', 'none');
        $('#weather-loading').removeClass('height');
        
        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-nightsky-1-landscape-2.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-nightsky-1.jpg")');
      }
      else if (hours >= 6 && hours < 10) {
        $('#app').css('background-color', 'transparent');
        // $('#wind-outer-container').css('background-color', 'transparent');
        $('#app').css('color', 'black');
        $('#app').removeClass('shadow-2');

        $('#brand-text-container').css('background-color', 'black');
        $('#location-search-div').css('background-color', 'black');
        $('#brand-container').css('background-color', 'black');
        $('#extra-info-section').css('background-color', 'black');
        $('#wind-outer-container').css('background-color', 'black');

        // $('#icon').css('filter', 'brightness(0)');
        
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);
        $('#weather-loading').css('display', 'none');
        $('#weather-loading').removeClass('height');

        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-dusk-1-landscape-2.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-dusk-1.jpg")');
      }
      else if (hours >= 10 && hours < 18) {
        $('#app').css('color', 'black');
        $('#app').addClass('shadow-2');

        $('#brand-text-container').css('background-color', 'black');
        $('#location-search-div').css('background-color', 'black');
        $('#brand-container').css('background-color', 'black');
        $('#extra-info-section').css('background-color', 'black');
        $('#wind-outer-container').css('background-color', 'black');

        // $('#icon').css('filter', 'brightness(0)');

        $('#app').css('background-color', '#45c7f3');
        // $('#wind-outer-container').css('background-color', '#024d89');
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);
        $('#weather-loading').css('display', 'none');
        $('#weather-loading').removeClass('height');

        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-bluesky-1-landscape.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-bluesky-1.jpg")');
      }
      else if (hours >= 18 && hours < 21) {
        $('#app').css('background-color', 'transparent');
        // $('#wind-outer-container').css('background-color', 'transparent');
        $('#app').css('color', 'black');
        $('#app').removeClass('shadow-2');

        $('#brand-text-container').css('background-color', 'black');
        $('#location-search-div').css('background-color', 'black');
        $('#brand-container').css('background-color', 'black');
        $('#extra-info-section').css('background-color', 'black');
        $('#wind-outer-container').css('background-color', 'black');

        // $('#icon').css('filter', 'brightness(0)');

        $('#brand-text-container').css('background-color', 'black');
        $('#root').css('background-color', 'transparent');
        clearTimeout(timeoutId);
        $('#weather-loading').css('display', 'none');
        $('#weather-loading').removeClass('height');

        if (window.visualViewport.width >= 640) $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunset-1-landscape.jpg")');
        else $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunset-1.jpg")');
      }

      // const locationQuery = `lon=${latAndLong[1]}&lat=${latAndLong[0]}`;
      const locationQuery = `${latAndLong[0]},${latAndLong[1]}`;
      // const currentResponse = await fetch(CURRENT_API + locationQuery);
      // const forecastResponse = await fetch(FORECAST_API + locationQuery);
      const response = await fetch(FORECAST_API + locationQuery);
      data = await response.json();

      apiCallsCountRef.current = apiCallsCountRef.current + 1;

      // currentData = await currentResponse.json();
      // forecastData = await forecastResponse.json();

      // console.log('currentData: ', currentData);
      // console.log('forecastData: ', forecastData);
      console.log('data: ', data);

      const SNOW_CODES = [1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264];
      const RAIN_CODES = [1063, 1072, 1150, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246];
      const THUNDER_CODES = [1087, 1273, 1276, 1279, 1282];

      // Clear
      if (data.current.condition.text === 'Clear') {
        if (hours >= 6 && hours < 21) {
          $('#icon').addClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunny-2.png');
        } 
        else setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-moon-1.png');
        setWeatherType('Clear');
      }
      // Mist
      else if (data.current.condition.text === 'Mist') {
        $('#icon').removeClass('spin-once');
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-mist-2.png');
        setWeatherType('Mist');
      }
      // Partly cloudy
      else if (data.current.condition.text === 'Partly cloudy') {
        $('#icon').removeClass('spin-once');

        if (hours >= 6 && hours < 21) {
          // $('#icon').addClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-sun-1b.png');
        } 
        else setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-moon-1b.png');
        setWeatherType('Clouds');
      }
      // Cloudy / Overcast
      else if (data.current.condition.text === 'Cloudy' || data.current.condition.text === 'Overcast') {
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-gray.png');
      }
      // Thunder
      else if (THUNDER_CODES.indexOf(data.current.condition.code) !== -1) {
        $('#icon').removeClass('spin-once');
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-thunderstorm-2b.png');
        setWeatherType('Thunderstorm');
      }
      // Rain
      else if (RAIN_CODES.indexOf(data.current.condition.code) !== -1) {
        $('#icon').removeClass('spin-once');
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-3b.png');
        setWeatherType('Rain');
      }
      // Snow
      else if (SNOW_CODES.indexOf(data.current.condition.code) !== -1) {
        $('#icon').removeClass('spin-once');
        setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-snow-2b.png');
        setWeatherType('Snow');
      }
      
      $('#weather-info-container').css('display', 'grid');
      $('#location-container').css('display', 'flex');
      $('#extra-info-section').css('display', 'flex');
      $('#wind-outer-container').css('display', 'flex');

      const description = data.current.condition.text;
      const descriptionSplit = description.split(' ');

      if (descriptionSplit.length > 2) $('#description-div').css('font-size', '0.85rem');
      else $('#description-div').css('font-size', '1rem');

      const FAHRENHEIT_COUNTRIES = ['United States of America', 'Belize', 'Liberia', 'Bahamas', 'Cyprus', 'Montserrat', 'Palau', 'Turks and Caicos Islands', 'Saint Kitts and Nevis', 'Cayman Islands', 'Antigua and Barbuda', 'Virgin Islands', 'Marshall Islands', 'Micronesia'];

      if ((userTempUnitRef.current === '°F' && userLocationPermissionRef.current === 'granted') || FAHRENHEIT_COUNTRIES.indexOf(data.location.country) !== -1) {
        if (apiCallsCountRef.current === 1) {
          userTempUnitRef.current = '°F';
        }

        setTemp(Math.round(data.current.temp_f));
        setLowTemp(Math.round(data.forecast.forecastday[0].day.mintemp_f));
        setHighTemp(Math.round(data.forecast.forecastday[0].day.maxtemp_f));
        setFeelsLike(Math.round(data.current.feelslike_f));
        setWindSpeed(`${data.current.wind_mph} mph`);
        setVisibility(`${data.current.vis_miles} mi`);
        setPressure(`${data.current.pressure_in} in`);
        setTempUnit('°F');

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

        setTemp(Math.round(data.current.temp_c));
        setLowTemp(Math.round(data.forecast.forecastday[0].day.mintemp_c));
        setHighTemp(Math.round(data.forecast.forecastday[0].day.maxtemp_c));
        setFeelsLike(Math.round(data.current.feelslike_c));
        setWindSpeed(`${data.current.wind_kph} kph`);
        setVisibility(`${data.current.vis_km} km`);
        setPressure(`${data.current.pressure_mb} mb`);
        setTempUnit('°C');

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
      
      setLocation(data.location.name);
      setDescription(description);
      setHumidity(data.current.humidity);
      setWindDegree(data.current.wind_degree);
      setWindDirection(data.current.wind_dir);

      const windDirectionIconRotation = data.current.wind_degree - 45;

      $('#wind-direction-icon').css('transform', `rotate(${windDirectionIconRotation}deg)`);

      // const sunriseTime = new Date(data.sys.sunrise);
      // const sunsetTime = new Date(data.sys.sunset);

      // setSunrise(sunriseTime.toLocaleTimeString('en-US'));
      // setSunset(sunsetTime.toLocaleTimeString('en-US'));

      closeLocationSearch();
      $('#autocomplete').val('');
    }
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

  function convertTempUnit() {
    if (tempUnit === '°C') {
      setTemp(tempF.current);
      setFeelsLike(feelsLikeF.current);
      setHighTemp(highTempF.current);
      setLowTemp(lowTempF.current);
      setWindSpeed(windSpeedMph.current);
      setWindGust(windGustMph.current);
      setVisibility(visibilityMi.current);
      setPressure(pressureIn.current);
      setTempUnit('°F');
    }
    else {
      setTemp(tempC.current);
      setFeelsLike(feelsLikeC.current);
      setHighTemp(highTempC.current);
      setLowTemp(lowTempC.current);
      setWindSpeed(windSpeedKph.current);
      setWindGust(windGustKph.current);
      setVisibility(visibilityKm.current);
      setPressure(pressureMb.current);
      setTempUnit('°C');
    }
  }

  function changeDisplayMode() {
    const displayModeText = document.getElementById('display-mode-text');

    if (displayMode === 'dark') {
      $('#root').css('filter', 'invert(1)');
      $('#temp-span').css('filter', 'invert(1)');
      // if ((tempUnit === 'celsius' && temp < 15.5) || (tempUnit === 'fahrenheit' && temp < 60))
      //   $('#temp-span').css('color', '#4F80FC');
      // else if ((tempUnit === 'celsius' && (temp >= 15.5 && temp < 24)) || (tempUnit === 'fahrenheit' && (temp >= 60 && temp < 75)))
      //   $('#temp-span').css('filter', 'none');
      // else if ((tempUnit === 'celsius' && temp >= 24) || (tempUnit === 'fahrenheit' && temp >= 75))
      //   $('#temp-span').css('color', '#D11500');

      // if (weatherType === 'Snow')
      //   $('icon').css('color', '#388EB2');
        
      $('#icon').css('filter', 'invert(1)');
      // $('.shadow').css('box-shadow', '1px 1px 5px white');
      displayModeText.innerText = 'switch to dark mode';
      setDisplayMode('light');
    }
    else {
      $('#root').css('filter', 'none');
      $('#icon, #temp-span').css('filter', 'none');
      // if ((tempUnit === 'celsius' && temp < 15.5) || (tempUnit === 'fahrenheit' && temp < 60))
      //   $('#temp-span').css('color', '#1355FB');
      // else if ((tempUnit === 'celsius' && (temp >= 15.5 && temp < 24)) || (tempUnit === 'fahrenheit' && (temp >= 60 && temp < 75)))
      //   $('#temp-span').css('filter', 'none');
      // else if ((tempUnit === 'celsius' && temp >= 24) || (tempUnit === 'fahrenheit' && temp >= 75))
      //   $('#temp-span').css('color', '#FF6054');

      // if (weatherType === 'Snow')
      //   $('#icon').css('color', '#388EB2');
      
      $('#icon').css('filter', 'none');
      // $('.shadow').css('box-shadow', '1px 1px 5px black');
      displayModeText.innerText = 'switch to light mode';
      setDisplayMode('dark');
    }
  }

  function openLocationSearch() {
    $('#invalid-location-feedback').text('');
    $('#autocomplete').addClass('expand');
    $('#location-search-div').css('display', 'flex');
    $('#location-search-div').css('flex-direction', 'column');
  }

  function closeLocationSearch() {
    $('#autocomplete').removeClass('expand');
    $('#location-search-div').css('display', 'none');
  }

  return (
    <div id='outermost-container'>
      <div className='' id='location-search-div'>
        <div>
          <button onClick={closeLocationSearch} id='close-location-search'><FontAwesomeIcon className="" icon={faXmark} /></button>
        </div>
        <div>
          {/* <label htmlFor='autocomplete'></label> */}
          <p id='invalid-location-feedback'></p>
          <input id='autocomplete' name='autocomplete' className='expand' placeholder='Enter a location' type='text'/>
        </div>
      </div>
      <div className='shadow-2' id='brand-container'>
        <div className='width' id='brand-container-2'>
          {/* <div id="button-container" className="width">
            <button id="temp-unit-button" className="button-2" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button>
          </div> */}
          <div id='change-location-container' className='text-left'>
            <button id='change-location-button' onClick={openLocationSearch}>Choose location</button>
          </div>
          <div id="brand-logo" className='text-left' hidden>
            <FontAwesomeIcon id='brand-icon' icon={faTemperatureLow} />
            <h1 id='brand-name'>WeatherHere</h1>
          </div>
          <span id="display-mode-span" className='text-right'>
            <button id="temp-unit-button" className="button-2 mr-1" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnit}</button>
            {/* <button id="display-mode" aria-label="switch-display-mode" className="" name="switch-display-mode" onClick={changeDisplayMode}>
              <FontAwesomeIcon id="display-mode-icon" icon={faMoon} />
            </button>
            <span id="display-mode-text" hidden>switch to light mode</span> */}
          </span>
        </div>
      </div>
      <div id="app-container">
        <div className='flex-wrap width' id='app-container-child'>
          {/* <div id='location-container' className='basis-full go-up'>
            <div id="location" className="letter-spacing-4 shadow"><span id="location-text" className=''>{location}</span></div>
          </div> */}
          <div className="App width height go-up-2" id='app'>
            <div id="weather-loading" className="height"></div>
            <div id='location-container' className='go-up'>
              <div id="location" className="letter-spacing-4 shadow"><span id="location-text" className=''>{location}</span></div>
              <FontAwesomeIcon id="location-icon" icon={faLocationDot} />
            </div>
            <div id="weather-info-container">
              <div id="first-col" className="flex-wrap">
                <div id="temp-div" className="flex-nowrap">
                  <div className='temp-child'>
                    <span id="temp-span" className="line-height" name="temperature">{temp}</span>
                    <span id="temp-unit" className="line-height">{tempUnit}</span>
                  </div>
                  <div id='feels-like'><span className=''>Feels like</span> {feelsLike}°</div>
                </div>
                <div id='high-low'>
                  <span><span id='high-text' className='font-bold'>High</span> {highTemp}° | <span id='low-text' className='font-bold'>Low</span> {lowTemp}°</span>
                </div>
              </div>
              <div id="second-col" className='flex-wrap'>
                {/* <div id="icon-div"><FontAwesomeIcon id="icon" icon={weatherIcon} /></div> */}
                <div id="icon-div"><img id="icon" src={weatherIcon} /></div>
                <div id="description-div">
                  <p id="description-text" className='letter-spacing-2'>{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='width extra-info-sections shadow-2' id='wind-outer-container'>
            <div className='basis-full' id='wind-header-container'>
              <p id='wind-header' className='extra-info-header letter-spacing-2'>Wind</p>
            </div>
            <div className='extra-info wind-info' id='wind-speed-container'>
            <p className='wind-info-header letter-spacing-2'>Speed</p>
              <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-icon" icon={faWind} />
              <p className='extra-info-number' id="wind-speed">{windSpeed}</p>
            </div>
            <div className='extra-info wind-info' id='wind-direction-container'>
              <p className='wind-info-header letter-spacing-2'>Direction</p>
              <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-direction-icon" icon={faLocationArrow} />
              <p className='extra-info-number' id="wind-direction">{windDirection}</p>
            </div>
            <div className='extra-info wind-info' id='wind-gust-container'>
              <p className='wind-info-header letter-spacing-2'>Gust</p>
              <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-gust-icon" icon={faArrowUpWideShort} />
              <p className='extra-info-number' id="wind-gust">{windGust}</p>
            </div>
          </div>
          <div className='extra-info-sections width shadow-2' id='extra-info-section' hidden>
            <div className='go-down basis-full' id='extra-info-container'>
              <div id="humidity-container" className='shadow extra-info'>
                <p id='humidity-header' className='extra-info-header letter-spacing-2'>Humidity</p>
                <FontAwesomeIcon className='extra-info-icons' id='droplet' icon={faDroplet} />
                <p className='extra-info-number' id="humidity-number">{humidity}%</p>
              </div>
              <div id="visibility-container" className='shadow extra-info'>
                <p id='visibility-header' className='extra-info-header letter-spacing-2'>Visibility</p>
                <FontAwesomeIcon className='extra-info-icons gray-text' id="visibility-icon" icon={faEye} />
                <p className='extra-info-number' id="visibility-number">{visibility}</p>
              </div>
              <div id="pressure-container" className='shadow extra-info'>
                <p id='pressure-header' className='extra-info-header letter-spacing-2'>Pressure</p>
                <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-icon" icon={faDownLeftAndUpRightToCenter} />
                <p className='extra-info-number' id="pressure-number">{pressure}</p>
              </div>
            </div>
          </div>
          {/* <div id="button-container" className="width"> */}
            {/* <button id="temp-unit-button" className="button-2" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button> */}
            {/* <span id="display-mode-span">
              <button id="display-mode" aria-label="switch-display-mode" className="button-2" name="switch-display-mode" onClick={changeDisplayMode}>
                <FontAwesomeIcon id="display-mode-icon" icon={faMoon} />
              </button>
              <span id="display-mode-text" hidden>switch to light mode</span>
            </span> */}
          {/* </div> */}
          {/* <div id="weather-bg">
            <img id="weather-icon-2" src={weatherIcon2} />
          </div> */}
        </div>
        <div id='brand-text-container' className=''>
          <div id='brand-with-copyright'>
            <span>Copyright © 2023</span>
            <img id='brand-text' src='https://localweatherapp-images.s3.us-west-1.amazonaws.com/weatherapp-brand-text-white-2.png' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;