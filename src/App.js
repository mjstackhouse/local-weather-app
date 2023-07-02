import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faClipboardList, faCloud, faWind, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { faSmog } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { faCloudBolt } from '@fortawesome/free-solid-svg-icons';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { faTemperatureLow } from '@fortawesome/free-solid-svg-icons';
import {faDownLeftAndUpRightToCenter} from '@fortawesome/free-solid-svg-icons';
/* global google */


function App() {
  
  const [tempUnit, setTempUnit] = useState('celsius');
  const [tempUnitButton, setTempUnitButton] = useState('°C');
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
  const [wind, setWind] = useState(null);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [displayMode, setDisplayMode] = useState('dark');

  let fccWeatherIcon;
  let autocomplete;
  let customLocation;
  let timezoneOffset;
  
  useEffect(() => {
    if (apiLoaded === false) {
      (async function loadAuto() {
        const script = document.createElement('script');
        console.log('process.env.REACT_APP_GOOGLE_API_KEY: ', process.env.REACT_APP_GOOGLE_API_KEY);
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.id = 'google-script';

        document.head.appendChild(script);

        const googleScript = document.getElementById('google-script');

        googleScript.addEventListener('load', () => {
          const google = window.google;

          if (fetched === false) {
            fetchData();
            console.log('useEffect');
            setFetched(true);
          }
  
          setApiLoaded(true);
        })

        window.initAutocomplete = function() {
          console.log('initAutocomplete called');

          autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('autocomplete'), {
              types: ['(cities)'],
              fields: ['geometry', 'utc_offset_minutes']
            });
          
          autocomplete.addListener('place_changed', onPlaceSelected);
        }

        function onPlaceSelected() {
          console.log('onPlaceSelected');
          const place = autocomplete.getPlace();

          if (!place.geometry) {
            document.getElementById('autocomplete').placeholder = 'Enter a location';
          }
          else {
            customLocation = place.geometry.location;
            timezoneOffset = place.utc_offset_minutes;
            console.log('timezoneOffset: ', timezoneOffset);
            console.log('customLocation:', customLocation.lat());
            fetchData(customLocation.lat(), customLocation.lng());
          }
        }
      })();
      
      // const loader = new Loader({
      //   apiKey: "AIzaSyB9pl4ozoWXO9AT4GhNi8KLikRJtZZcrwM",
      //   version: "weekly",
      // });
      
      // loader.load().then(async () => {
      //   const { Autocomplete } = await google.maps.importLibrary('places');
      
      //   autocomplete = new Autocomplete(document.getElementById('autocomplete'));
      // });

      // setApiLoaded(true);
    } 
    else if (fetched === false) {
      fetchData();
      console.log('useEffect');
      setFetched(true);
    }

    // if (fetched === false) {
    //   fetchData();
    //   console.log('useEffect');
    //   setFetched(true);
    // }

    async function fetchData(latitude, longitude) {
      const weatherLoadingDiv = document.getElementById('weather-loading');
      const newWeatherLoadingInput = document.getElementById('autocomplete');
      const locationDiv = document.getElementById('location-container');
      const weatherInfoContainer = document.getElementById('weather-info-container');
      const api = 'https://weather-proxy.freecodecamp.rocks/api/current?';
    
      let latAndLong = [];
      let data;
  
      if (latitude && longitude) {
        weatherLoadingDiv.style.display = 'block';
        weatherInfoContainer.style.display = 'none';
        locationDiv.style.display = 'none';
        $('#app').removeClass('go-up-2');
        $('#extra-info-container').removeClass('go-down');
        $('#location-container').removeClass('go-up');
        loadingText('Loading your new location');
        newWeatherLoadingInput.value = 'Loading your new location';
      }
      else {
        loadingText('Loading your local weather');
      }
    
      const navigatorObj = window.navigator;
      const geolocationObj = navigatorObj.geolocation;

      // console.log('geoLocationObj: ', geolocationObj);
  
      geolocationObj.getCurrentPosition(async (position) => {
        console.log('Location successfully retrieved');

        let coordinates;
        let timestamp;
        let timestampDateObj;
        let timeHours;

        if (latitude && longitude) {
          const timeNow = new Date();
          console.log('timeNow: ', timeNow);
          const timeUTCHours = timeNow.getUTCHours();
          console.log('timeUTCHours: ', timeUTCHours);
          const offsetHours = timezoneOffset / 60;
          console.log('offsetHours: ', offsetHours);
          timeHours = timeUTCHours + offsetHours;
        }
        else {
          coordinates = position.coords;
          timestamp = position.timestamp;
          timestampDateObj = new Date(timestamp);
          timeHours = timestampDateObj.getHours();
        }

        console.log('timeHours: ', timeHours);

        if (timeHours >= 21 || (timeHours >= 0 && timeHours < 6)) {
          console.log('night bg');
          $('#app').css('color', 'white');
          $('#app').addClass('shadow-2');
          
          $('#location-search-div').css('background-color', '#1F1F1F');
          $('#brand-container').css('background-color', '#1F1F1F');
          $('#extra-info-section').css('background-color', '#1F1F1F');

          $('#icon').css('filter', 'brightness(1)');

          $('#app').css('background-color', '#024d89');
          $('#root').css('background-color', 'transparent');
          $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-nightsky-1.jpg")');
        }
        else if (timeHours >= 6 && timeHours < 10) {
          $('#app').css('background-color', 'transparent');
          $('#app').css('color', 'black');
          $('#app').removeClass('shadow-2');

          $('#location-search-div').css('background-color', 'black');
          $('#brand-container').css('background-color', 'black');
          $('#extra-info-section').css('background-color', 'black');

          $('#icon').css('filter', 'brightness(0)');
          
          $('#root').css('background-color', 'transparent');
          $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-dusk-1.jpg")');
        }
        else if (timeHours >= 10 && timeHours < 18) {
          $('#app').css('color', 'black');
          $('#app').addClass('shadow-2');

          $('#location-search-div').css('background-color', 'black');
          $('#brand-container').css('background-color', 'black');
          $('#extra-info-section').css('background-color', 'black');

          $('#icon').css('filter', 'brightness(0)');

          $('#app').css('background-color', '#45c7f3');
          $('#root').css('background-color', 'transparent');
          $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-bluesky-1.jpg")');
        }
        else if (timeHours >= 18 && timeHours < 21) {
          $('#app').css('background-color', 'transparent');
          $('#app').css('color', 'black');
          $('#app').removeClass('shadow-2');

          $('#location-search-div').css('background-color', 'black');
          $('#brand-container').css('background-color', 'black');
          $('#extra-info-section').css('background-color', 'black');

          $('#icon').css('filter', 'brightness(0)');

          $('#root').css('background-color', 'transparent');
          $('#root').css('background-image', 'url("https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-sunset-1.jpg")');
        }

        // console.log('coordinates: ', coordinates);

        if (latitude && longitude) {
          latAndLong.push(Number(latitude));
          latAndLong.push(Number(longitude));
        }
        else {
          latAndLong.push(Number(coordinates.latitude));
          latAndLong.push(Number(coordinates.longitude));
        }
  
  
        // MANUALLY SETTING LAT/LONG FOR TESTING
        
        // SAN ANTONIO
        // latAndLong.push(29.4);
        // latAndLong.push(-98.5);
  
        // GREAT FALLS, MONTANA
        // latAndLong.push(47.5);
        // latAndLong.push(-111.3);
  
        // JACKSON, MISSISSIPPI
        // latAndLong.push(32.3);
        // latAndLong.push(-90.2);
  
        // CHEYENNE, WYOMING
        // latAndLong.push(41.1);
        // latAndLong.push(-104.8);
  
        // FORT COLLINS, CO
        // latAndLong.push(40.6);
        // latAndLong.push(-105.1);
  
        // ALLIANCE, NEBRASKA
        // latAndLong.push(42.1);
        // latAndLong.push(-102.9);
  
        // CO SPRINGS
        // latAndLong.push(38.8);
        // latAndLong.push(-104.8);

        // 39.708530, -104.940740
  
        const locationQuery = `lon=${latAndLong[1]}&lat=${latAndLong[0]}`;
        const response = await fetch(api + locationQuery);
  
        data = await response.json();

        // console.log('data.weather[0].main: ', data.weather[0].main);
  
        // Clouds, Clear, Rain, Snow, Mist
        if (data.weather[0].main === 'Rain') {
          $('#icon').removeClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain.png');
          // setWeatherIcon2('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-big.png');
          // $('#app-container').css('background-image', 'url(https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-big.png');
          // $('#app-container').css('background-size', 'cover');
          // $('#app-container').css('background-blend-mode', 'color');
          setWeatherType('Rain');
        }
        else if (data.weather[0].main === 'Clouds') {
          $('#icon').removeClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy.png');
          // setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-mist.png');
          // setWeatherIcon2('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-cloudy-big.png');
          // setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-rain-2.png');
          // console.log('weatherIcon2: ', weatherIcon2);
          setWeatherType('Clouds');
        }
        else if (data.weather[0].main === 'Clear') {
          $('#icon').addClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adboestock-sunny.png');
          setWeatherType('Clear');
        }
        else if (data.weather[0].main === 'Snow') {
          $('#icon').removeClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-snow.png');
          setWeatherType('Snow');
        }
        else if (data.weather[0].main === 'Mist') {
          $('#icon').css('color', 'gray');
          $('#icon').removeClass('spin-once');
          setWeatherIcon(faSmog);
          setWeatherType('Mist');
        }
        else if (data.weather[0].main === 'Thunderstorm') {
          $('#icon').removeClass('spin-once');
          setWeatherIcon('https://localweatherapp-images.s3.us-west-1.amazonaws.com/adobestock-thunder.png');
          setWeatherType('Thunderstorm');
        }
        
        weatherLoadingDiv.style.display = 'none';
        weatherInfoContainer.style.display = 'grid';
        locationDiv.style.display = 'flex';

        // $('#extra-info-container').addClass('flex-nowrap');
        $('#extra-info-container').css('display', 'flex');
  
        // if (Math.round(data.main.temp) < 15.5)
        //   $('#temp-span').css('color', '#3E74FA');
        // else if (Math.round(data.main.temp) >= 24)
        //   $('#temp-span').css('color', '#FF6054');

        const descriptionUpperCase = data.weather[0].description[0].toUpperCase();
        const description = descriptionUpperCase + data.weather[0].description.slice(1);
  
        setTemp(Math.round(data.main.temp));
        setLowTemp(Math.round(data.main.temp_min));
        setHighTemp(Math.round(data.main.temp_max));
        setFeelsLike(Math.round(data.main.feels_like));
        setLocation(data.name + ', ' + data.sys.country);
        setDescription(description);
        setHumidity(data.main.humidity);
        setWind(data.wind.speed);
        setPressure(data.main.pressure);

        // console.log('data.sys.sunrise: ', data.sys.sunrise);
        // console.log('data.sys.sunset: ', data.sys.sunset);

        const sunriseTime = new Date(data.sys.sunrise);
        const sunsetTime = new Date(data.sys.sunset);

        setSunrise(sunriseTime.toLocaleTimeString('en-US'));
        setSunset(sunsetTime.toLocaleTimeString('en-US'));

        closeLocationSearch();
        newWeatherLoadingInput.value = '';
      }, () => {
        setTimeout(() => {
          $('#weather-loading').text('Try turning on your location and refreshing the page to get your local weather!');
        }, 3200);
        console.error('Location could not be retrieved');
      });
    }
  }, [tempUnit, temp, feelsLike, fetched, weatherIcon, sunset, sunrise, setSunrise, setSunset, setWeatherIcon]);


  function loadingText(text) {
    const tempLoadingDiv = document.getElementById('weather-loading');

    setTimeout(() => {
      tempLoadingDiv.innerText = `${text}`;
    }, 800);
    setTimeout(() => {
      tempLoadingDiv.innerText = `${text}.`;
    }, 1600);
    setTimeout(() => {
      tempLoadingDiv.innerText = `${text}..`;
    }, 2400);
    setTimeout(() => {
      tempLoadingDiv.innerText = `${text}...`;
    }, 3200);
  }

  function convertTempUnit() {
    let convertedTemp, convertedFeelsLike, convertedHighTemp, convertedLowTemp;

    if (tempUnit === 'celsius') {
      convertedTemp = Math.round((temp * (9/5)) + 32);
      convertedFeelsLike = Math.round((feelsLike * (9/5)) + 32);
      convertedHighTemp = Math.round((feelsLike * (9/5)) + 32);
      convertedLowTemp = Math.round((feelsLike * (9/5)) + 32);
      setTemp(convertedTemp);
      setFeelsLike(convertedFeelsLike);
      setHighTemp(convertedHighTemp);
      setLowTemp(convertedLowTemp);
      setTempUnit('fahrenheit');
      setTempUnitButton('°F');
    }
    else {
      convertedTemp = Math.round((temp - 32) * (5/9));
      convertedFeelsLike = Math.round((feelsLike - 32) * (5/9));
      convertedHighTemp = Math.round((highTemp - 32) * (5/9));
      convertedLowTemp = Math.round((lowTemp - 32) * (5/9));
      setTempUnit('celsius');
      setTemp(convertedTemp);
      setFeelsLike(convertedFeelsLike);
      setHighTemp(convertedHighTemp);
      setLowTemp(convertedLowTemp);
      setTempUnitButton('°C');
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
    // $('#autocomplete').removeClass('collapse');
    $('#autocomplete').addClass('expand');
    $('#location-search-div').css('display', 'flex');
    $('#location-search-div').css('flex-direction', 'column');
    // $('#brand-container').css('filter', 'blur(5px)');
    // $('#app-container').css('filter', 'blur(5px)');
    // setTimeout(() => {
    //   // $('#location-search-div').css('right', '0');
    // }, 1000);
  }

  function closeLocationSearch() {
    // $('#autocomplete').addClass('collapse');
    $('#autocomplete').removeClass('expand');
    $('#location-search-div').css('display', 'none');
    // $('#location-search-div').css('right', '100px');
    // $('#brand-container').css('filter', 'blur(0px)');
    // $('#app-container').css('filter', 'blur(0px)');
    // setTimeout(() => {
    //   $('#location-search-div').css('display', 'none');
    // }, 1000);
  }

  // function initAutocomplete() {
  //   console.log('initAutocomplete called');

  //   autocomplete = new google.maps.places.Autocomplete(
  //     document.getElementById('autocomplete'), {
  //       types: ['cities'],
  //       fields: ['geometry']
  //     });

  //   autocomplete.addListener('place_changed', onPlaceSelected);
  // }

  // function onPlaceSelected() {
  //   let customLocation;
  //   const place = autocomplete.getPlace();

  //   if (!place.geometry) {
  //     document.getElementById('autocomplete').placeholder = 'Enter a location';
  //   }
  //   else {
  //     customLocation = place.geometry.location;
  //   }
  // }

  return (
    <div id='outermost-container'>
      <div className='' id='location-search-div'>
        <div>
          <button onClick={closeLocationSearch} id='close-location-search'><FontAwesomeIcon className="" icon={faXmark} /></button>
        </div>
        <div>
          <input id='autocomplete' className='expand' placeholder='Enter a location' type='text'/>
        </div>
      </div>
      <div className='' id='brand-container'>
        <div className='width' id='brand-container-2'>
          {/* <div id="button-container" className="width">
            <button id="temp-unit-button" className="button-2" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button>
          </div> */}
          <button className='text-left' id='change-location-button' onClick={openLocationSearch}>Change location</button>
          <div id="brand-logo" className='text-left' hidden>
            <FontAwesomeIcon id='brand-icon' icon={faTemperatureLow} />
            <h1 id='brand-name'>WeatherHere</h1>
          </div>
          <span id="display-mode-span" className='text-right'>
            <button id="temp-unit-button" className="button-2 mr-1" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button>
            <button id="display-mode" aria-label="switch-display-mode" className="" name="switch-display-mode" onClick={changeDisplayMode}>
              <FontAwesomeIcon id="display-mode-icon" icon={faMoon} />
            </button>
            <span id="display-mode-text" hidden>switch to light mode</span>
          </span>
        </div>
      </div>
      <div id="app-container">
        <div className='flex-wrap'>
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
                    <span id="temp-unit" className="line-height">°{tempUnit === 'celsius' ? 'C' : 'F'}</span>
                  </div>
                  <div id='feels-like'><span className=''>Feels like</span> {feelsLike}°</div>
                </div>
                <div id='high-low'>
                  <span><span id='high-text' className=''>High</span> {highTemp}° / <span id='low-text' className=''>Low</span> {lowTemp}°</span>
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
          <div className='' id='extra-info-section'>
            <div className='go-down' id='extra-info-container' hidden>
              <div id="humidity-container" className='shadow extra-info'>
                <p id='humidity-header' className='extra-info-header letter-spacing-2'>Humidity</p>
                <FontAwesomeIcon className='extra-info-icons' id='droplet' icon={faDroplet} />
                <p className='extra-info-number' id="humidity-number">{humidity}%</p>
              </div>
              <div id="wind-container" className='shadow extra-info'>
                <p id='wind-header' className='extra-info-header letter-spacing-2'>Wind</p>
                <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-icon" icon={faWind} />
                <p className='extra-info-number' id="wind-number">{wind} mph</p>
              </div>
              <div id="pressure-container" className='shadow extra-info'>
                <p id='pressure-header' className='extra-info-header letter-spacing-2'>Pressure</p>
                <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-icon" icon={faDownLeftAndUpRightToCenter} />
                <p className='extra-info-number' id="pressure-number">{pressure} mb</p>
              </div>
            </div>
          </div>
          <div className='go-down' id='' hidden>
            <div id="humidity-container" className='shadow extra-info mr-1 gray-border'>
              <p id='humidity-header' className='extra-info-header letter-spacing-2'>Humidity</p>
              <FontAwesomeIcon className='extra-info-icons' id='droplet' icon={faDroplet} />
              <p id="humidity-number">{humidity}%</p>
            </div>
            <div id="wind-container" className='shadow extra-info mr-1 gray-border'>
              <p id='wind-header' className='extra-info-header letter-spacing-2'>Wind</p>
              <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-icon" icon={faWind} />
              <p id="wind-number">{wind} mph</p>
            </div>
            <div id="pressure-container" className='shadow extra-info gray-border'>
              <p id='pressure-header' className='extra-info-header letter-spacing-2'>Pressure</p>
              <FontAwesomeIcon className='extra-info-icons gray-text' id="wind-icon" icon={faDownLeftAndUpRightToCenter} />
              <p id="pressure-number">{pressure} mb</p>
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
      </div>
    </div>
  );
}

export default App;