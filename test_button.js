var Gpio = require('onoff').Gpio;
var buttonOptions = { debounceTimeout: 100};
// var button = new Gpio(5, 'in', 'both', buttonOptions); // for shotting
// var button2 = new Gpio(6, 'in', 'both', buttonOptions); // for extra
var button = new Gpio(5, 'in', 'both' ); // for shotting
var button2 = new Gpio(6, 'in', 'both' ); // for extra

process.on('SIGINT', function() {
    button.unexport();
    button2.unexport();
    led.unexport();
});

button.watch(function(err, value) {
    if(err) {
        throw err;
    }
    console.log('buttonA: '+value);
});


button2.watch(function(err, value) {
    if(err) {
        throw err;
    }
    console.log('buttonB: '+value);
});
