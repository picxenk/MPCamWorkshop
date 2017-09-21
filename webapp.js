var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var shotDir = 'public_html/shot';

var indexContent = '';
var itemContent = '';
var bigContent = '';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    fs.readdir(shotDir, (err, items) => {
        var links = '[';
        for (var i=0; i<items.length; i++) {
            var n = i+1;
            links += ' <a href="/'+n+'">'+n+'</a> ';
        }
        links += ']';
        var result = indexContent.toString().replace('#NAV#', links);
        // var result = links;
        res.send(result);
    });
});
// app.get('/', (req, res) => {
//     fs.readFile('public_html/index.html', (err, content) => {
//         fs.readdir(shotDir, (err, items) => {
//             var links = '[';
//             for (var i=0; i<items.length; i++) {
//                 var n = i+1;
//                 links += ' <a href="/'+n+'">'+n+'</a> ';
//             }
//             links += ']';
//             var result = content.toString().replace('#NAV#', links);
//             // var result = links;
//             res.send(result);
//         });
//     });
// });


app.get('/:id', (req, res) =>  {
        fs.readdir(shotDir, (err, items) => {
            var links = '[';
            for (var i=0; i<items.length; i++) {
                var n = i+1;
                links += ' <a href="/'+n+'">'+n+'</a> ';
                if ((i+1)%30 == 0) links += '<br/>';
            }
            links += ']';
            var result = itemContent.toString().replace('#NAV#', links);

            var id = req.params.id;
            var oriImage = '<img src="/shot/'+id+'/ori.png" width="400"/>';
            var mpImage= '<a href="/big/'+id+'"><img src="/shot/'+id+'/mp.png" width="400"/></a>';
            var codeText = '';

            fs.readFile('public_html/shot/'+id+'/code.txt', (err, code) => {
                codeText = code.toString();
                result = result.replace('#ORI#', oriImage);
                result = result.replace('#MPI#', mpImage);
                result = result.replace('#CODE#', codeText);
                res.send(result);
            });
        });
});

app.get('/big/:id', (req, res) =>  {
        fs.readdir(shotDir, (err, items) => {

            var id = req.params.id;
            var result = bigContent.toString();

            result = result.replace('#LINK#', id);
            result = result.replace('#MPI#', id);
            res.send(result);
        });
});


app.use(express.static('public_html'));
app.listen(80, () => {
    console.log('running...');
    fs.readFile('public_html/index.html', (err, content) => {
        indexContent = content;
    });
    fs.readFile('public_html/item.html', (err, content) => {
        itemContent = content;
    });
    fs.readFile('public_html/big.html', (err, content) => {
        bigContent = content;
    });
});
