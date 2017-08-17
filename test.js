var fs = require('fs');
var dir = 'public_html/shot';

fs.readdir(dir, (err, items) => {
    console.log(items);
});
