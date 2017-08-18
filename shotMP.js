var config = require('./config');

// vars 
var state = 'READY';
var oButtonValue = -1;
var cButtonValue = -1;
var isProcessing = false;
var isShutterOpen = false;
var isDebugging = true;

var camOptions = config.camOptions;
var scpOptions = [config.MPScreenServerUser+"@"
    +config.MPScreenServerIP+":"
    +"./MPScreenServer/MPCams/"
    +config.MPCamID+"/"];
var shotDir = 'public_html/shot';
var shotNum = 0;

// common
var spawn = require('child_process').spawn;
var exec  = require('child_process').exec;
var dateFormat = require('dateformat');
var path = require('path');
var fs = require('fs');


// for buttons & LED
var Gpio = require('onoff').Gpio;
var buttonOptions = { debounceTimeout: 30};
var button = new Gpio(5, 'in', 'both', buttonOptions); // for shotting
var button2 = new Gpio(6, 'in', 'both', buttonOptions); // for extra
var led = new Gpio(21, 'out');
var blink;

led.writeSync(1);
// blink = setInterval(function() {
//     led.writeSync(led.readSync() ^ 1);
// }, 50);
fs.readdir(shotDir, (err, items) => {
    shotNum = items.length;
    console.log('current shot number : ' + shotNum);
});

button.watch(function(err, value) {
    var fileName;
    var shotProc;
    var scpProc;

    if(err) {
        throw err;
    }
    cButtonValue = value;
    if (state == 'READY' && oButtonValue == -1 && cButtonValue == 0) {
        state = 'SHOT';
        oButtonValue = 0;
    }
    if (state == 'SHOT' && oButtonValue == 0 && cButtonValue == 1) {
        state = 'RELEASE';
        oButtonValue = 1;
    }

    // if (state == 'READY') {
    //     clearInterval(blink);
    //     led.writeSync(1);
    // }


    console.log(value);
    debug();

    
    if (state == 'SHOT' && !isProcessing) {
        console.log('==================================CHAL');

        blink = setInterval(function() {
            led.writeSync(led.readSync() ^ 1);
        }, 100);

        isShutterOpen = true;
        isProcessing = true;

        var timeStamp = makeTimeString();
        fileName = timeStamp+".png";
        mpFileName = timeStamp+"_mp.png";
        filePath = path.join(__dirname, "public_html/img/"+fileName);
        mpFilePath = path.join(__dirname, "public_html/img/"+mpFileName);

        shotProc = spawn('raspistill', camOptions.concat(filePath));
        console.log('cam done '+filePath);
        shotProc.on('exit', (code) => {
            shotNum++;
            var newShotDir = shotDir + '/' + shotNum; 
            exec('mkdir '+newShotDir+';cat renderMP1.js code.js renderMP2.js > render.js', (err, sto, ste) => {

                if (err) {
                    console.error(`${err}`);
                    return;
                }
                exec('cp '+filePath+' '+newShotDir+'/ori.png');

                var mpProc = spawn('node', [path.join(__dirname, 'render.js'), fileName]);
                mpProc.on('exit', (code) => {
                    isProcessing = false;
                    console.log('renderMP done '+mpFileName);
                    exec('cp '+mpFilePath+' '+newShotDir+'/mp.png');
                    exec('cp code.js '+newShotDir+'/code.txt');
                    clearInterval(blink);
                    led.writeSync(1);
                });
            });
        });
    }

    if (state == 'RELEASE') {
        if (isShutterOpen) {
            console.log('==================================KHACK!');
            isShutterOpen = false;
        }
        oButtonValue = -1;
        state = 'READY';

    }

});

button2.watch(function(err, value) {
    if(err) {
        throw err;
    }
    console.log('b2: '+value);

});


process.on('SIGINT', function() {
    button.unexport();
    button2.unexport();
    led.unexport();
});


var makeTimeString = function() {
    return dateFormat(new Date(), "yyyymmdd-HH_MM_ssl");
}

function debug() {
    if (isDebugging) {
        console.log('state:'+state+' isProcessing:'+isProcessing);
    }
}
