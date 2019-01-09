let darkSkyData = {};
let OWMData = {};

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
    else unix -= (yearLen + dayLen);
    year++;
  }

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
      OWMData[obj.dt.toString()] =
        {
          summary: obj.weather[0].main,
          temp: convertKtoF(obj.main.temp),
          humid: obj.main.humidity,
          cloud: obj.clouds.all,
          precip: Math.max(obj.rain['3h'],obj.snow['3h']),
          wind: obj.wind.speed
        };
    }
  }

  const storeDarkSky = (data) => {
    console.log(data);
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

  const drawCalendar = () => {
    //draw time column
    $('<div>').text('Time').appendTo($('#time'))
    for(let i=0; i<2; i++) {
      let suffix = (i === 0) ? 'A' : 'P';
      for(let j=0; j<12; j++) {
        let start = ((j === 0) ? '12' : j)+suffix;
        let end = (j+1)+suffix;
        if(j === 11 && suffix === 'A') end = '12P';
        else if(j === 11 && suffix === 'P') end = '12A';
        $('<div>').text(`${start}-${end}`).appendTo($('#time'));
      }
    }

    // const myWeatherPrefs = {
    //   tempGreat: 25,
    //   cloudLess: .8,
    //   windLess: 10,
    //   precipLess: .01
    // }

    let unixDay = Math.floor(new Date(Date.now()).setHours(0,0,0)/1000);
    for(let i=1; i<=6; i++) {
      let day = convertUnixTime(unixDay).substr(0,10);
      $('<div>').text(day).appendTo($(`#day${i}`));

      //iterate through the hours of each day
      for(let j=0; j<24; j++) {
        const currTime = unixDay+j*60*60;
        const $weathSlot = $('<div>').attr('id',currTime).appendTo($(`#day${i}`));
        if(typeof darkSkyData[currTime.toString()] !== 'undefined') {
          $weathSlot.text(darkSkyData[currTime.toString()].summary);
        } else if(typeof OWMData[currTime.toString()] !== 'undefined') {
          $weathSlot.text(OWMData[currTime.toString()].summary);
        }
      }

      //increment the day
      unixDay = unixDay+24*60*60;
    }
  }

  $.ajax(
      {
        // url: 'http://api.openweathermap.org/data/2.5/forecast?zip=01982&APPID=e4e6249c02c0a4cea28c0cc7541e8796',
        url: 'https://api.darksky.net/forecast/68e294c9a2e58cfb2ef5efd86a1c702c/42.6085869,-70.8413316',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type':'application/json'
        },
        dataType: 'jsonp'
      }
    ).then(
      storeDarkSky,
      ()=>{ console.log('bad request'); }
    );

    $.ajax(
      {
        url: 'http://api.openweathermap.org/data/2.5/forecast?zip=01982&APPID=e4e6249c02c0a4cea28c0cc7541e8796',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type':'application/json'
        },
        dataType: 'jsonp'
      }
    ).then(
      storeOWM,
      ()=>{ console.log('bad request'); }
    );

  setTimeout(drawCalendar,10000);

});
