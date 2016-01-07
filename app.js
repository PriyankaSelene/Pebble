var AUTH_KEY = '99841AN7YoQ7Nd8ak566970ff';
var MOBILE_NUMBERS = '919916451550'; // HULK
var SENDER_ID = 'PEBBLE';

var UI = require('ui');
var Vector2 = require('vector2');
var Voice = require('ui/voice');
var ajax = require('ajax');

var smsMessage = null;
var locationOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000
};

var window = new UI.Window();
var mainMenu = new UI.Menu();
setMainMenuItems();
var alertMenu = new UI.Menu();
setAlertMenuItems();

mainMenu.show();
mainMenu.on('select', function(e) {
  if (e.itemIndex === 0) {
    alertMenu.remove();
    Voice.dictate('start', true, function(dictation) {
      if (dictation.err) {
        showText('dictation error' + dictation.err);
        console.log('Dictation Error: ' + dictation.err);

        Voice.dictate('stop');
        return;
      }
      Voice.dictate('stop');
      console.log('Dictation sucess: ' + dictation.transcription);
      smsMessage = dictation.transcription;
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    });
  } else {
    alertMenu.show();
  }
});
alertMenu.on('select', function(e) {
  smsMessage = e.item.title;
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);  
});

function setMainMenuItems() {
  var inputOptions = ['Voice Input', 'Select from List'];
  var items = inputOptions.map(function(option) {
    return { title: option };
  });
  mainMenu.section(0, { items: items });
}

function setAlertMenuItems() {
  var alerts = ['Alpha Call', 'Code 70', 'Code V'];
  var items = alerts.map(function(alert) {
    return { title: alert };
  });
  alertMenu.section(0, { items: items });
}

function locationSuccess(location) {
  var latitude = location.coords.latitude;
  var longitude = location.coords.longitude;
  console.log('lat=' + latitude + ', lon=' + longitude);
  var message = 'Message: ' + smsMessage + '\nLocation: ' + latitude + ', ' + longitude;
  console.log(message);
  sendSMS(message);
}

function locationError(error) {
  showText('location error' + error.message);
  console.log('location error (' + error.code + '): ' + error.message);
}

function sendSMS(message) {
  var encodedMessage = encodeURIComponent(message);
  ajax(
  {
    url: 'https://control.msg91.com/api/sendhttp.php?authkey=' + AUTH_KEY + '&mobiles=' + MOBILE_NUMBERS + '&message=' + encodedMessage + '&sender=' + SENDER_ID + '&route=4'
  },
  function(data, status, request) {
    console.log('The ajax request response: ' + data);
    showText('Message sent successfully!');
  },
  function(error, status, request) {
    console.log('The ajax request failed: ' + error);
    showText(error);
  });
}

function showText(message) {
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(100, 100),
    text: message
  });
  window.add(text);
  window.show();
  window.on('click', 'back', function(){
    Voice.dictate('stop');
    text.remove();
    window.hide();
  });
}