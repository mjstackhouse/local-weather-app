import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { faSmog } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [tempUnit, setTempUnit] = useState('celsius');
  const [tempUnitButton, setTempUnitButton] = useState('switch to fahrenheit');
  const [temp, setTemp] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [weatherType, setWeatherType] = useState(null);
  const [displayMode, setDisplayMode] = useState('dark');
  
  useEffect(() => {
    if (fetched === false) {
      fetchData();
      setFetched(true);
    }

    async function fetchData() {
      const weatherLoadingDiv = document.getElementById('weather-loading');
      const locationDiv = document.getElementById('location');
      const weatherInfoContainer = document.getElementById('weather-info-container');
      const api = 'https://weather-proxy.freecodecamp.rocks/api/current?';
  
      let latAndLong = [];
      let data;
  
      loadingText();
    
      const navigatorObj = window.navigator;
      const geolocationObj = navigatorObj.geolocation;
  
      geolocationObj.getCurrentPosition(async (position) => {
        console.log('Location successfully retreived');
  
        const coordinates = position.coords;
  
        latAndLong.push(Number(coordinates.latitude));
        latAndLong.push(Number(coordinates.longitude));
  
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
  
        const locationQuery = `lon=${latAndLong[1]}&lat=${latAndLong[0]}`;
        const response = await fetch(api + locationQuery);
  
        data = await response.json();
  
        // Clouds, Clear, Rain, Snow, Mist
        if (data.weather[0].main === 'Rain') {
          $('#icon').css('color', '#0193F4');
          setWeatherIcon(faCloudRain);
          setWeatherType('Rain');
        }
        else if (data.weather[0].main === 'Clouds') {
          $('#icon').css('color', '#B5B5B5');
          setWeatherIcon(faCloud);
          setWeatherType('Clouds');
        }
        else if (data.weather[0].main === 'Clear') {
          $('#icon').css('color', '#EABF00');
          setWeatherIcon(faSun);
          setWeatherType('Clear');
        }
        else if (data.weather[0].main === 'Snow') {
          $('#icon').css('color', '#92C5DD');
          setWeatherIcon(faSnowflake);
          setWeatherType('Snow');
        }
        else if (data.weather[0].main === 'Mist') {
          $('#icon').css('color', 'gray');
          setWeatherIcon(faSmog);
          setWeatherType('Mist');
        }
        
        weatherLoadingDiv.style.display = 'none';
        weatherInfoContainer.style.display = 'grid';
        locationDiv.style.display = 'block';
  
        if (Math.round(data.main.temp) < 15.5)
          $('#temp-span').css('color', '#3E74FA');
        else if (Math.round(data.main.temp) >= 24)
          $('#temp-span').css('color', '#FF6054');
  
        setTemp(Math.round(data.main.temp));
        setLocation(data.name + ', ' + data.sys.country);
        setDescription(data.weather[0].description);
      }, () => {
        console.error('Location could not be retrieved');
      });
    }
  }, [tempUnit, temp, fetched, weatherIcon, setWeatherIcon]);


  function loadingText() {
    const tempLoadingDiv = document.getElementById('weather-loading');

    setTimeout(() => {
      tempLoadingDiv.innerText = 'Loading your local weather';
    }, 800);
    setTimeout(() => {
      tempLoadingDiv.innerText = 'Loading your local weather.';
    }, 1600);
    setTimeout(() => {
      tempLoadingDiv.innerText = 'Loading your local weather..';
    }, 2400);
    setTimeout(() => {
      tempLoadingDiv.innerText = 'Loading your local weather...';
    }, 3200);
  }

  function convertTempUnit() {
    let convertedTemp;

    if (tempUnit === 'celsius') {
      convertedTemp = Math.round((temp * (9/5)) + 32);
      setTemp(convertedTemp);
      setTempUnit('fahrenheit');
      setTempUnitButton('switch to celsius');
    }
    else {
      convertedTemp = Math.round((temp - 32) * (5/9));
      setTempUnit('celsius');
      setTemp(convertedTemp);
      setTempUnitButton('switch to fahrenheit');
    }
  }

  function changeDisplayMode() {
    const displayModeText = document.getElementById('display-mode-text');

    if (displayMode === 'dark') {
      $('#root').css('filter', 'invert(1)');
      $('#temp-span').css('filter', 'invert(1)');
      if ((tempUnit === 'celsius' && temp < 15.5) || (tempUnit === 'fahrenheit' && temp < 60))
        $('#temp-span').css('color', '#4F80FC');
      else if ((tempUnit === 'celsius' && (temp >= 15.5 && temp < 24)) || (tempUnit === 'fahrenheit' && (temp >= 60 && temp < 75)))
        $('#temp-span').css('filter', 'none');
      else if ((tempUnit === 'celsius' && temp >= 24) || (tempUnit === 'fahrenheit' && temp >= 75))
        $('#temp-span').css('color', '#D11500');

      if (weatherType === 'Snow')
        $('icon').css('color', '#388EB2');
        
      $('#icon').css('filter', 'invert(1)');
      $('.shadow').css('box-shadow', '1px 1px 5px white');
      displayModeText.innerText = 'switch to dark mode';
      setDisplayMode('light');
    }
    else {
      $('#root').css('filter', 'none');
      $('#icon, #temp-span').css('filter', 'none');
      if ((tempUnit === 'celsius' && temp < 15.5) || (tempUnit === 'fahrenheit' && temp < 60))
        $('#temp-span').css('color', '#1355FB');
      else if ((tempUnit === 'celsius' && (temp >= 15.5 && temp < 24)) || (tempUnit === 'fahrenheit' && (temp >= 60 && temp < 75)))
        $('#temp-span').css('filter', 'none');
      else if ((tempUnit === 'celsius' && temp >= 24) || (tempUnit === 'fahrenheit' && temp >= 75))
        $('#temp-span').css('color', '#FF6054');

      if (weatherType === 'Snow')
        $('#icon').css('color', '#388EB2');
      
      $('#icon').css('filter', 'none');
      $('.shadow').css('box-shadow', '1px 1px 5px black');
      displayModeText.innerText = 'switch to light mode';
      setDisplayMode('dark');
    }
  }

  return (
    <div>
      <div className="App shadow width height">
        <div id="weather-loading" className="width height"></div>
        <div id="location" className="width" hidden>{location}</div>
        <div id="weather-info-container" hidden>
          <div id="first-col" className="flex-nowrap">
            <div id="temp-div" className="flex-nowrap">
              <span id="temp-span" className="line-height" name="temperature">{temp}°</span>
              <span id="temp-unit" className="line-height">{tempUnit === 'celsius' ? 'C' : 'F'}</span>
            </div>
          </div>
          <div id="second-col">
            <div id="icon-div"><FontAwesomeIcon id="icon" icon={weatherIcon} /></div>
            <div id="description-div">
              <p id="description-text">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div id="button-container" className="width">
        <button id="temp-unit-button" className="button shadow" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button>
        <span id="display-mode-span">
          <button id="display-mode" aria-label="switch-display-mode" className="button shadow" name="switch-display-mode" onClick={changeDisplayMode}>
            <FontAwesomeIcon id="display-mode-icon" icon={faLightbulb} />
          </button>
          <span id="display-mode-text" hidden>switch to light mode</span>
        </span>
      </div>
    </div>
  );
}

export default App;
