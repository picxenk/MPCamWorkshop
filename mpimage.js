var Canvas = require('canvas');
var MetaPixel = require('./metapixel');

var MPImage = function(anImage, aWidth, aHeight) {
    this.img = anImage;
    this.w = aWidth;
    this.h = aHeight;
    this.canvas = new Canvas(this.w, this.h);
    this.ctx = this.canvas.getContext('2d');
    // this.ctx = canvasOut.getContext('2d');
    // this.ctxData = this.ctx.getImageData(0, 0, this.w, this.h);
    
    this.mps = [];

    this.updateMetaPixels = function() {
        this.mps = [];
        // this.mps = new Array(this.w * this.h);

        for (var i=0; i<this.w; i++) {
            for (var j=0; j<this.h; j++) {
                var off = (j*this.w+i)*4;
                var r = this.img[off];
                var g = this.img[off+1];
                var b = this.img[off+2];
                var a = this.img[off+3];
                var mp = new MetaPixel(i, j, r, g, b, a);
                mp.setMax(this.w, this.h);
                this.mps.push(mp);
                // this.mps[j*this.w+i] = mp;
            }
        }
    }


    this.processMPImage = function() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 255)';
        this.ctx.fillRect(0, 0, this.w, this.h);

        // for (var i=0; i<this.mps.length; i++) {
        //     this.mps[i].displayOn(this.ctx);
        // }
        for (var i=this.mps.length-1; i>=0; i--) {
            this.mps[i].displayOn(this.ctx);
        }

    }

    this.do01 = function() {
        for (var i=0; i<this.mps.length; i++) {
            var p = this.mps[i];
            if (p.r > p.g) {
                p.moveLeft(p.r*0.05);
            } else {
                p.moveDown(1);
            }
        }
    }
    this.흘러라 = this.do01;

    this.do02 = function() {
        for (var i=0; i<this.mps.length; i++) {
            var p = this.mps[i];
            if (p.r > p.g) {
                p.beStrong(15);
                p.moveDown(p.r*0.3);
                // p.moveRandom(p.r*0.5);
            } else {
                p.moveRandom(p.r*0.5);
            }
        }
    }
    this.흘러내린다 = this.do02;
}

module.exports = MPImage;
