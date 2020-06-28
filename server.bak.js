const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

const apiKey = '5badf62e6c47455b3c449f1af9635254';

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let d = new Date();
let n = d.getDay();
let dayAfter = daysOfWeek[n + 2]

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null, dayAfter: dayAfter});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  //let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&
  exclude=current&appid=5badf62e6c47455b3c449f1af9635254`;

  request(url, function (err, response, body) {
    if(err){
      res.render('index', {weather: null, error: 'Error, please try again'});
    } else {
      let weather = JSON.parse(body)
      if(weather.main == undefined){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let tempF = weather.main.temp;
        let tempC = (5/9) * (tempF - 32);
        tempC = tempC.toPrecision(3);
        
        let weatherText = `It's ${tempC} degrees in ${weather.timezone}!`;
        let weatherTomorrowText = `Tomorrow will be ${weather.daily[1].temp[0]}`;
        res.render('index', {weather: weatherText, weatherTomorrow: weatherTomorrowText, dayAfter: dayAfter, error: null});
      }
    }
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
