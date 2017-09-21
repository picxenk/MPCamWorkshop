var config = require('./config');

// vars 
var stateA = 'READY';
var stateB = 'READY';
var oButtonAValue = -1;
var cButtonAValue = -1;
var oButtonBValue = -1;
var cButtonBValue = -1;
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


// sound trigger
var player = require('play-sound')(opts={});
var soundFile = 'shot1.wav';


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
    if(err) {
        throw err;
    }
    console.log('buttonA: '+value);
    debug();

    cButtonAValue = value;
    if (stateA == 'READY' && oButtonAValue == -1 && cButtonAValue == 0) {
        stateA = 'SHOT';
        oButtonAValue = 0;
    }
    if (stateA == 'SHOT' && oButtonAValue == 0 && cButtonAValue == 1) {
        stateA = 'RELEASE';
        oButtonAValue = 1;
    }
    
    if (stateA == 'SHOT' && !isProcessing) {
        console.log('==================================CHAL');
        processMPCam();
    }

    if (stateA == 'RELEASE') {
        if (isShutterOpen) {
            console.log('==================================KHACK!');
            isShutterOpen = false;
        }
        oButtonAValue = -1;
        stateA = 'READY';
    }
});


button2.watch(function(err, value) {
    if(err) {
        throw err;
    }
    console.log('buttonB: '+value);
    debug();

    cButtonBValue = value;
    if (stateB == 'READY' && oButtonBValue == -1 && cButtonBValue == 0) {
        stateB = 'SHOT';
        oButtonBValue = 0;
    }
    if (stateB == 'SHOT' && oButtonBValue == 0 && cButtonBValue == 1) {
        stateB = 'RELEASE';
        oButtonBValue = 1;
    }
    
    if (stateB == 'SHOT' && !isProcessing) {
        console.log('==================================CHAL');
        processMPCam();
    }

    if (stateB == 'RELEASE') {
        if (isShutterOpen) {
            console.log('==================================KHACK!');
            isShutterOpen = false;
        }
        oButtonBValue = -1;
        stateB = 'READY';
    }
});


process.on('SIGINT', function() {
    button.unexport();
    button2.unexport();
    led.unexport();
});


var processMPCam = function() {
    var fileName;
    var shotProc;

    player.play(soundFile, function(err) {
        if (err) throw err;
    });

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


var makeTimeString = function() {
    return dateFormat(new Date(), "yyyymmdd-HH_MM_ssl");
}

function debug() {
    if (isDebugging) {
        // console.log('state:'+state+' isProcessing:'+isProcessing);
        console.log('isProcessing:'+isProcessing);
    }
}
