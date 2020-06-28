const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

const owmApiKey = '5badf62e6c47455b3c449f1af9635254';
const googleApiKey = 'AIzaSyB-3hW5ZIn9ErVs27FdQBRFXQ6CTe0QJ_Y';

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let d = new Date();
let n = d.getDay();
let dayAfter = daysOfWeek[n + 2]
var lat, lon, locationName;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, dayAfter: dayAfter, weathericoncode: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  //let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  
  let locationurl = `https://maps.googleapis.com/maps/api/geocode/json?components=administrative_area:${city}&key=${googleApiKey}`;

  request(locationurl, function(err, response, body) {
    if(err){
      res.render('index', {weather: null, weathericoncode: null, dayAfter: dayAfter, error: 'Error, please try again'});
    } else {
      //console.log("using google api..");
      let location = JSON.parse(body);
      lat = location.results[0].geometry.location.lat;
      lon = location.results[0].geometry.location.lng;
      locationName = location.results[0].address_components[0].long_name;
      //console.log("lat is: " + lat);
      //console.log("lon is: " + lon);
    }

    let weatherurl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${owmApiKey}`;

    request(weatherurl, function (err, response, body) {
      //console.log("Weather request. Lat is " + lat + " and lon is " + lon);
      if(err){
        res.render('index', {weather: null, weathericoncode: null, dayAfter: dayAfter, error: 'Error, please try again'});
      } else {
        let weather = JSON.parse(body);
        if(weather.timezone == undefined){
          res.render('index', {weather: null, weathericoncode: null, dayAfter: dayAfter, error: 'Error, please try again'});
        } else {
          let currentTempC = (weather.current.temp - 273.15).toPrecision(3);
          let tomorrowTempC = (weather.daily[1].temp.day - 273.15).toPrecision(3);

          let weatherTodayIconUrl = `http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`;
          let weatherTomorrowIconUrl = `http://openweathermap.org/img/wn/${weather.daily[1].weather[0].icon}@2x.png`;

          //console.log("Passing the following url: " + weathericonurl);
          
          let weatherText = `It's ${currentTempC} degrees with ${weather.current.weather[0].description} in ${locationName}!`;
          let weatherTomorrowText = `Tomorrow will be ${tomorrowTempC} degrees with ${weather.daily[1].weather[0].description}`;
          res.render('index', {dayAfter: dayAfter, weatherTodayIconUrl: weatherTodayIconUrl, weatherTomorrowIconUrl: weatherTomorrowIconUrl, weather: weatherText, weatherTomorrow: weatherTomorrowText,  error: null});
        }
      }
    });
  })

  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
