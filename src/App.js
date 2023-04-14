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

function App() {
  const [tempUnit, setTempUnit] = useState('celsius');
  const [temp, setTemp] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [displayMode, setDisplayMode] = useState('dark');
  
  useEffect(() => {
    if (fetched === false) {
      fetchData();
      setFetched(true);
    }
  }, [tempUnit, temp, fetched, weatherIcon, setWeatherIcon]);

  async function fetchData() {
    const tempDiv = document.getElementById('temp-loading');
    const tempSpan = document.getElementById('temp-span');
    const tempUnit = document.getElementById('temp-unit');
    const locationDiv = document.getElementById('location');
    const gridContainer = document.getElementById('grid-container');
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

      const locationQuery = `lon=${latAndLong[1]}&lat=${latAndLong[0]}`;
      const response = await fetch(api + locationQuery);

      data = await response.json();

      $('.App').css('grid-template-rows', '75px 1fr');

      // Clouds, Clear, Rain, Snow, Mist
      if (data.weather[0].main === 'Rain') {
        $('#icon').css('color', '#0193F4');
        setWeatherIcon(faCloudRain);
      }
      else if (data.weather[0].main === 'Clouds') {
        $('#icon').css('color', '#B5B5B5');
        setWeatherIcon(faCloud);
      }
      else if (data.weather[0].main === 'Clear') {
        $('#icon').css('color', '#EABF00');
        setWeatherIcon(faSun);
      }
      else if (data.weather[0].main === 'Snow') {
        $('#icon').css('color', '#8BE7F0');
        setWeatherIcon(faSnowflake);
      }
      else if (data.weather[0].main === 'Mist') {
        $('#icon').css('color', 'gray');
        setWeatherIcon(faSmog);
      }
      
      tempDiv.style.display = 'none';
      gridContainer.style.display = 'grid';
      tempSpan.style.display = 'inline';
      tempUnit.style.display = 'inline';
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

  function loadingText() {
    const tempLoadingDiv = document.getElementById('temp-loading');

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
    }
    else {
      convertedTemp = Math.round((temp - 32) * (5/9));
      setTempUnit('celsius');
      setTemp(convertedTemp);
    }
  }

  function changeDisplayMode() {
    const displayModeButton = document.getElementById('display-mode');

    if (displayMode === 'dark') {
      $('#root').css('filter', 'invert(1)');
      $('#temp-span').css('filter', 'invert(1)');
      if ((tempUnit === 'celsius' && temp < 15.5) || (tempUnit === 'fahrenheit' && temp < 60))
        $('#temp-span').css('color', '#4F80FC');
      else if ((tempUnit === 'celsius' && (temp >= 15.5 && temp < 24)) || (tempUnit === 'fahrenheit' && (temp >= 60 && temp < 75)))
        $('#temp-span').css('filter', 'none');
      else if ((tempUnit === 'celsius' && temp >= 24) || (tempUnit === 'fahrenheit' && temp >= 75))
        $('#temp-span').css('color', '#D11500');
        
      $('#icon').css('filter', 'invert(1)');
      $('.shadow').css('box-shadow', '1px 1px 5px white');
      displayModeButton.innerText = 'switch to dark mode';
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
      
      $('.shadow').css('box-shadow', '1px 1px 5px black');
      displayModeButton.innerText = 'switch to light mode';
      setDisplayMode('dark');
    }
  }

  return (
    <div>
      <div className="App shadow">
        <div id="temp-loading"></div>
        <div id="location">{location}</div>
        <div id="grid-container">
          <div id="first-col">
            <div id="temp-div">
              <span id="temp-span" name="temperature" hidden>{temp}°</span>
              <button id="temp-unit" className="shadow" name="change-temperature-unit" onClick={convertTempUnit} hidden>{tempUnit === 'celsius' ? 'C' : 'F'}</button>
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
      <button id="display-mode" className="shadow" name="switch-display-mode" onClick={changeDisplayMode}>switch to light mode</button>
    </div>
    
  );
}

export default App;
