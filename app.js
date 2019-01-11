let darkSkyData = {};
let OWMData = {};
let cities = {
  elpaso: { zip: 79936, latlng: '31.776593,-106.296976' },
  newyork: { zip: 10025, latlng: '40.798601,-73.966622' },
  losangeles: { zip: 90011, latlng: '34.007090,-118.258681' },
  chicago: { zip: 60629, latlng: '41.775868,-87.711496' },
  houston: { zip: 77084, latlng: '29.827486,-95.659920' },
  philadelphia: { zip: 19120, latlng: '40.034147,-75.119198' },
  phoenix: { zip: 85032, latlng: '33.625920,-112.002503' },
  sanantonio: { zip: 78245, latlng: '29.401093,-98.730806' },
  sandiego: { zip: 92154, latlng: '32.557022,-117.006214' },
  dallas: { zip: 75217, latlng: '32.710306,-96.678549' },
  sanfrancisco: { zip: 94112, latlng: '37.720375,-122.442950' },
  seattle: { zip: 98115, latlng: '47.685746,-122.281589' },
  boston: { zip: 02128, latlng: '42.361129,-71.006975' },
  hamilton: { zip: 01982, latlng: '42.6085869,-70.8413316' }
}
let offset = -5;

const convertKtoF = (kelvin) => {
  return (kelvin-273.15)*9/5+32;
}

const convertUnixTime = (unix) => {
  const daysOfMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let yearLen =  60*60*24*365;
  let dayLen = 60*60*24;
  let hourLen = 60*60;

  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let min = 0;
  let sec = 0;

  while(unix > yearLen) {
    if(year%4 !== 0) unix -= yearLen;
    //account for leap years
    else unix -= (yearLen + dayLen);
    year++;
  }

  //account for leap days
  if(year%4 === 0) daysOfMonths[1] = 29;
  while(unix > daysOfMonths[month-1]*dayLen) {
    unix -= daysOfMonths[month-1]*dayLen;
    month++;
  }
  if(month < 10) month = '0'+month;

  day += Math.floor(unix/dayLen);
  unix = unix%dayLen;
  if(day < 10) day = '0'+day;

  hour += Math.floor(unix/hourLen);
  unix = unix%hourLen;
  if(hour < 10) hour = '0'+hour;

  min += Math.floor(unix/60);
  unix = unix%60;
  if(min < 10) min = '0'+min;

  sec = Math.round(unix);
  if(sec < 10) sec = '0'+sec;

  return `${year}-${month}-${day}T${hour}:${min}:${sec}`;
}

$(() => {
  const storeOWM = (data) => {
    console.log(data);
    for(obj of data.list) {
      let rain = 0;
      let snow = 0;
      //check if the API is supplying the field
      if(typeof obj['rain'] !== 'undefined') {
        //convert from mm to in
        if(Object.keys(obj.rain).length !== 0) rain = obj.rain['3h']/(25.4*3);
      }
      if(typeof obj['snow'] !== 'undefined') {
        if(Object.keys(obj.snow).length !== 0) snow = obj.snow['3h']/(25.4*3);
      }

      OWMData[obj.dt.toString()] =
        {
          summary: obj.weather[0].main,
          temp: convertKtoF(obj.main.temp),
          humid: obj.main.humidity,
          cloud: obj.clouds.all/100,
          precip: Math.max(rain,snow),
          wind: obj.wind.speed,
          uv: Math.round((1-obj.clouds.all/100)*6)
        };
    }
  }

  const storeDarkSky = (data) => {
    offset = data.offset;
    for(obj of data.hourly.data) {
      darkSkyData[obj.time.toString()] =
        {
          summary: obj.summary,
          temp: obj.apparentTemperature,
          humid: obj.humidity,
          cloud: obj.cloudCover,
          precip: obj.precipIntensity*obj.precipProbability,
          wind: obj.windSpeed,
          uv: obj.uvIndex
        };
    }
  }

  const checkWeath = (data, prefs) => {
    let metPrefs = Object.keys(prefs).length;
    for(pref of Object.keys(prefs)) {
      if(pref.indexOf('Less') !== -1) {
        const aspect = pref.substring(0,pref.indexOf('Less'));
        if(data[aspect] > prefs[pref]) {
          console.log(`${aspect} is not less than ${prefs[pref]}`);
          metPrefs--;
        }
      } else if (pref.indexOf('Great') !== -1) {
        const aspect = pref.substring(0,pref.indexOf('Great'));
        if(data[aspect] < prefs[pref]) {
          console.log(`${aspect} is not greater than ${prefs[pref]}`);
          metPrefs--;
        }
      }
    }
    return metPrefs/Object.keys(prefs).length;
  }

  const drawCalendar = () => {
    //draw time column
    $('<div>').css('background-color','black').appendTo($('#time'))
    for(let i=0; i<2; i++) {
      let suffix = (i === 0) ? 'A' : 'P';
      for(let j=0; j<12; j++) {
        let start = ((j === 0) ? '12' : j)+suffix;
        let end = (j+1)+suffix;
        if(j === 11 && suffix === 'A') end = '12P';
        else if(j === 11 && suffix === 'P') end = '12A';
        $('<div>').text(`${start}`).css('background-color','black').appendTo($('#time'));
      }
    }

    //Determine the start of the local day in unix time
    let unixDay = Math.floor(new Date(Date.now()).setHours(0,0,0)/1000)-(offset+5)*60*60;
    for(let i=1; i<=6; i++) {
      let day = convertUnixTime(unixDay).substring(5,10);
      $('<div>').text(day).css('background-color','black').appendTo($(`#day${i}`));

      //iterate through the hours of each day
      for(let j=0; j<24; j++) {
        const currTime = unixDay+j*60*60;
        console.log(convertUnixTime(currTime));
        const $weathSlot = $('<div>').attr('id',currTime).appendTo($(`#day${i}`));
        //check first for data in Dark Sky for the exact time
        if(typeof darkSkyData[currTime.toString()] !== 'undefined') {
          let prefMatch = checkWeath(darkSkyData[currTime.toString()],myPrefs);
          $weathSlot.css('background-color',`rgb(0,${prefMatch*255},0)`);
        //then check for data in Open Weather Map for the exact time
        } else if(typeof OWMData[currTime.toString()] !== 'undefined') {
          let prefMatch = checkWeath(OWMData[currTime.toString()],myPrefs);
          $weathSlot.css('background-color',`rgb(0,${prefMatch*255},0)`);
        //...or data in Open Weather Map in the preceding 3-hour interval
        } else if(typeof OWMData[(currTime-60*60).toString()] !== 'undefined') {
          let prefMatch = checkWeath(OWMData[(currTime-60*60).toString()],myPrefs);
          $weathSlot.css('background-color',`rgb(0,${prefMatch*255},0)`);
        } else if(typeof OWMData[(currTime-2*60*60).toString()] !== 'undefined') {
          let prefMatch = checkWeath(OWMData[(currTime-2*60*60).toString()],myPrefs);
          $weathSlot.css('background-color',`rgb(0,${prefMatch*255},0)`);
        }
      }

      //increment the day
      unixDay = unixDay+24*60*60;
    }
  }

  // const city = 'losangeles';
  // $.ajax(
  //   {
  //     url: `https://api.darksky.net/forecast/68e294c9a2e58cfb2ef5efd86a1c702c/${cities[city].latlng}?units=us`,
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Content-Type':'application/json'
  //     },
  //     dataType: 'jsonp'
  //   }
  // ).then(
  //   storeDarkSky,
  //   ()=>{ console.log('bad request'); }
  // );
  //
  // $.ajax(
  //   {
  //     url: `http://api.openweathermap.org/data/2.5/forecast?zip=${cities[city].zip}&APPID=e4e6249c02c0a4cea28c0cc7541e8796`,
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Content-Type':'application/json'
  //     },
  //     dataType: 'jsonp'
  //   }
  // ).then(
  //   storeOWM,
  //   ()=>{ console.log('bad request'); }
  // );

  // setTimeout(drawCalendar,5000);

});
