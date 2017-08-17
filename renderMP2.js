        // eval code end

        mp.displayOn(ctx2);
    }
}


var out = fs.createWriteStream(__dirname + '/public_html/img/' + renderedImageFile);
var stream = canvas2.pngStream();

stream.on('data', function(chunk){
      out.write(chunk);
});

stream.on('end', function(){
      console.log('saved');
});

