// import { useState } from 'react';
// import { useEffect } from 'react';
// import $ from 'jquery';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faClipboardList, faCloud, faWind } from '@fortawesome/free-solid-svg-icons';
// import { faCloudRain } from '@fortawesome/free-solid-svg-icons';
// import { faSun } from '@fortawesome/free-solid-svg-icons';
// import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
// import { faSmog } from '@fortawesome/free-solid-svg-icons';
// import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
// import { faCloudBolt } from '@fortawesome/free-solid-svg-icons';
// import { faDroplet } from '@fortawesome/free-solid-svg-icons';
// import { faMoon } from '@fortawesome/free-solid-svg-icons';
// import { faTemperatureLow } from '@fortawesome/free-solid-svg-icons';
// import {faDownLeftAndUpRightToCenter} from '@fortawesome/free-solid-svg-icons';

// function Navbar() {


//   return(
//     <div className='shadow gray-border-nav' id='brand-container'>
//       <div className='width' id='brand-container-2'>
//         <div id="brand-logo" className='text-left'>
//           <FontAwesomeIcon id='brand-icon' icon={faTemperatureLow} />
//           <h1 id='brand-name'>WeatherHere</h1>
//         </div>
//         {/* <div id="button-container" className="width">
//           <button id="temp-unit-button" className="button-2" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button>
//         </div> */}
//         <input id='autocomplete' placeholder='Enter a location' type='text' />
//         <span id="display-mode-span" className='text-right'>
//           <button id="temp-unit-button" className="button-2 mr-1" name="change-temperature-unit" onClick={convertTempUnit}>{tempUnitButton}</button>
//           <button id="display-mode" aria-label="switch-display-mode" className="" name="switch-display-mode" onClick={changeDisplayMode}>
//             <FontAwesomeIcon id="display-mode-icon" icon={faMoon} />
//           </button>
//           <span id="display-mode-text" hidden>switch to light mode</span>
//         </span>
//       </div>
//     </div>
//   )
// }

// export default Navbar;