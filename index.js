import {initLoad} from "./modules/initLoad.js";
import {setPeriodTimes, setTimes} from "./modules/timeSetup.js";

// Setup main website
initLoad();

let periods;
periods = setPeriodTimes("Cabot-High");

setTimes(periods);

// main loop
setInterval(setTimes, 500, periods);