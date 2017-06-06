#!/usr/bin/nodejs
var     ipcamera    = require('node-hikvision-api');
var     http        = require('http');

// Options:
var openhabOptions = {
      host     : 'localhost',
      port     : 8080,
      username : 'user',
      password : 'pass'
}

// options for hikvision camera
// required per camera
var optionsGarage = {
    host    : '192.168.1.111',
    port    : '80',
    user    : 'admin',
    pass    : 'password123',
    log     : false,
};

var optionsFront = {
    host    : '192.168.1.112',
    port    : '80',
    user    : 'admin',
    pass    : 'password123',
    log     : false,
};

// one required per camera
var hikvisionGarage   = new ipcamera.hikvision(optionsGarage);
var hikvisionFront   = new ipcamera.hikvision(optionsFront);

// Set initial state to no motion
setState('Motion_VT_Garage', 'CLOSED');
setState('Motion_VT_Garage_Line', 'CLOSED');
setState('Motion_VT_Front', 'CLOSED');
setState('Motion_VT_Front_Line', 'CLOSED');


// Monitor Camera Alarms
// requires one function per camera
hikvisionGarage.on('alarm', function(code,action,index) {
    if (code === 'VideoMotion'   && action === 'Start')  {
        console.log(getDateTime() + ' Garage Channel ' + index + ': Video Motion Detected')
        setState('Motion_VT_Garage', 'OPEN');
    }
    if (code === 'VideoMotion'   && action === 'Stop')   {
        console.log(getDateTime() + ' Garage Channel ' + index + ': Video Motion Ended')
        setState('Motion_VT_Garage', 'CLOSED');
    }
    if (code === 'LineDetection' && action === 'Start')  {
        console.log(getDateTime() + ' Garage Channel ' + index + ': Line Cross Detected')
        setState('Motion_VT_Garage_Line', 'OPEN');
    }
    if (code === 'LineDetection' && action === 'Stop')   {
        console.log(getDateTime() + ' Garage Channel ' + index + ': Line Cross Ended')
        setState('Motion_VT_Garage_Line', 'CLOSED');
    }

});

// code = event reported by camera
// expected code values  AlarmLocal  VideoMotion  LineDetection  VideoLoss  VideoBlind
// action = Start or Stop
// index = camera index number in the camera device. almost always 1
hikvisionFront.on('alarm', function(code,action,index) {
    if (code === 'VideoMotion'   && action === 'Start')  {
        console.log(getDateTime() + ' Front Channel ' + index + ': Video Motion Detected')
        setState('Motion_VT_Front', 'OPEN');
    }
    if (code === 'VideoMotion'   && action === 'Stop')   {
        console.log(getDateTime() + ' Front Channel ' + index + ': Video Motion Ended')
        setState('Motion_VT_Front', 'CLOSED');
    }
    if (code === 'LineDetection' && action === 'Start')  {
        console.log(getDateTime() + ' Front Channel ' + index + ': Line Cross Detected')
        setState('Motion_VT_Front_Line', 'OPEN');
    }
    if (code === 'LineDetection' && action === 'Stop')   {
        console.log(getDateTime() + ' Front Channel ' + index + ': Line Cross Ended')
        setState('Motion_VT_Front_Line', 'CLOSED');
    }
});


function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

// takes 2 variables, item, which is the item name in openhab
// and the state you intend to set
function setState( item, newState ) {

    var username = openhabOptions['username'];
    var password = openhabOptions['password'];
    var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

    var headers = {
        'Content-Type': 'text/plain',
        'Authorization': auth
    };

    var options = {
      host: openhabOptions['host'],
      port: openhabOptions['port'],
      path: '/rest/items/' + item + '/state',
      method: 'PUT',
      headers: headers
    };

    var req = http.request(options, function(res) {
//    console.log('STATUS: ' + res.statusCode);
//    console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
//      console.log('BODY: ' + chunk);
      });
    });

    req.on('error', function(e) {
//    console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(newState);
    req.end();

}
