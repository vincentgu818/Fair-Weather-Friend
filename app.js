$(() => {
  const renderWeather = (data) => {
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
      renderWeather,
      ()=>{ console.log('bad request'); }
    );
});
