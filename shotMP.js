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


// common
var spawn = require('child_process').spawn;
var dateFormat = require('dateformat');
var path = require('path');


// for buttons
var Gpio = require('onoff').Gpio;
var buttonOptions = { debounceTimeout: 30};
var button = new Gpio(5, 'in', 'both', buttonOptions); // for shotting
var button2 = new Gpio(6, 'in', 'both', buttonOptions); // for extra


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


    console.log(value);
    debug();

    
    if (state == 'SHOT' && !isProcessing) {
        console.log('==================================CHAL');
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
            var mpProc = spawn('node', [path.join(__dirname, 'renderMPCanvas.js'), fileName]);
            mpProc.on('exit', (code) => {
                    isProcessing = false;
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
});


var makeTimeString = function() {
    return dateFormat(new Date(), "yyyymmdd-HH_MM_ssl");
}

function debug() {
    if (isDebugging) {
        console.log('state:'+state+' isProcessing:'+isProcessing);
    }
}
