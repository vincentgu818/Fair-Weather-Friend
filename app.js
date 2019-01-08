
let weatherData = []

const daysOfMonths = { jan: 31, feb: 28, mar: 31, apr: 30, may: 31, jun: 30,
                        jul: 31, aug: 31, sep: 30, oct: 31, nov: 30, dec: 31}

const convertKToF = (kelvin) => {
  return (kelvin-273.15)*9/5+32;
}

$(() => {
  const storeOWMWeather = (data) => {
    console.log(data);
    for(obj of data.list) {
      weatherData.push({time: obj.dt_txt, temp: obj.main.temp, humid: obj.main.humidity,
        rain: obj.rain['3h'], snow: obj.snow['3h'], clouds: obj.clouds.all, wind: obj.wind.speed});
    }
  }


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
      storeOWMWeather,
      ()=>{ console.log('bad request'); }
    );
});
