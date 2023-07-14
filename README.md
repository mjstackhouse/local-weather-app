# WeatherHere: React.js Weather App

## The Technologies Used

This is a web application built with React.js, Javascript, HTML, CSS, and AWS S3.

## An Overview of the Application

This app retrieves a user's local weather data through WeatherAPI.com's api using their geolocation. It also allows the user to choose any other city in the world, which involves utilizing the Google Places Autocomplete API for city selection with minimal validation necessary.

For any location selected, the user receives all of the regular weather data that you'd come to expect (ex: main temperature, high and low, hourly/daily forecasts, miscellaneous data like humidity/wind/UV index).

Since this app doesn't have any particular structure through different pages like on a regular website, I'll go through and highlight specific features/things that I implemented.

### Features / Highlights

- The temperature unit (and general measurement system) is something that the user can choose at will. But, since the average user won't be changing the units from what their country uses, I implemented logic to choose it for them. Based on the country that the user is located in, Fahrenheit (and the imperial system, generally) or Celsius will be selected. If they decide to look at another country's weather that uses the other measurement system, their original units will stay the same as to keep being what they're familiar with.

- The background image and certain icons are chosen depending on the time of day. The time-specific icons change between a 'sun' and 'moon' version, while the background images switch for 4 different times of day: sunrise, daytime, sunset, and nighttime. The various UI elements also change to adapt to the different backgrounds for pleasing visuals.

- The Google Places Autocomplete API is utilized for when the user selects a custom location. It simplified the process of making sure that the user selected a valid location by automating the options provided, as well as only requesting cities from the API. With its built-in detection of an invalid location, I simply added user feedback when that occurs.

- The sections of the app are structured intially by the average user's priority, which is the main, current weather information, followed by the hourly and then 3-day (only 3 days because that's what WeatherAPI.com's free plan offers), daily forecasts. The details of the current day's weather are provided below that, including the wind, sunrise/sunset times, and more. The general font sizing of the main, current information is larger and has a different color background than everything below it to separate it and draw the user's attention. The 4 sections below the main info and forecasts alternate between 2 and 3 column designs to create some visual variety as the user scrolls down. There is also subtle bolding and pops of color in the icons to separate everything and make it all easy to navigate visually.

## Things to Implement in the Future

- Display even more information than is currently available. That would likely include things like the extra information provided for each day in the daily forecast or adding weather alerts to pop up when they're available.

- Add various notifications for when the user has the application installed on their device

- Improve the UI of the temperature-unit-switching-buttons to be more aesthetically pleasing

- Add more subtle animations to increase the 'wow factor' of the UI and UX

- Add proper testing for quality assurance purposes