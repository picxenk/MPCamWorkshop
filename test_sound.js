var player = require('play-sound')(opts={});
var soundFile = 'shot1.wav';

player.play(soundFile, function(err) {
    if (err) throw err;
});
