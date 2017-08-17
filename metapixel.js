var MetaPixel = function(px, py, pr, pg, pb, pa) {
    this.x = px;
    this.y = py;
    this.maxW;
    this.maxH;
    this.w = 1;

    this.r = pr;
    this.g = pg;
    this.b = pb;
    this.a = pa;

    this.isDoing = true;


    this.toColor = function(r, g, b, a) {
        return 'rgba('
                +this.r+','
                +this.g+','
                +this.b+','
                +this.a+')';
    }
    this.c = this.toColor(pr, pg, pb, pa);

    this.displayOn = function(ctx) {
            ctx.fillStyle = this.c;
            ctx.fillRect(this.x, this.y, this.w, this.w);
        // if (this.w == 1) {
            // ctx.strokeStyle = this.c;
            // this.point(ctxData, this.x, this.y, this.r, this.g, this.b, this.r);
        // } else {
            // this.point(ctxData, this.x, this.y, 100, 150, 200, 200);
            // ctx.stroke(this.c);
            // ctx.fill(this.c);
            // ctx.rect(this.x, this.y, this.w, this.w);
        // }
    }

    this.point = function(data, x, y, r, g, b, a) {
        var i = (x + y * this.maxW) * 4;
        data[i] = r;
        data[i+1] = g;
        data[i+2] = b;
        data[i+3] = a;
    }

    this.setMax = function(mw, mh) {
        this.maxW = mw;
        this.maxH = mh;
    }

    this.moveH = function(n) {
        this.x = this.x + Math.floor(n);
        if (this.x < 0) {
            this.x = this.maxW + this.x;
        }
        if (this.maxW < this.x) {
            this.x = this.maxW - this.x;
        }
    }

    this.moveV = function(n) {
        this.y = this.y + Math.floor(n);
        if (this.y < 0) {
            this.y = this.maxH + this.y;
        }
        if (this.maxH < this.y) {
            this.y = this.maxH - this.y;
        }
    }

    this.moveLeft = function(n) {
        this.moveH(n*-1);
    }
    this.moveRight = function(n) {
        this.moveH(n);
    }
    this.moveUp = function(n) {
        this.moveV(n*-1);
    }
    this.moveDown = function(n) {
        this.moveV(n);
    }

    this.moveRandom = function(n) {
        this.moveH(this.random(n*-1, n));
        this.moveV(this.random(n*-1, n));
    }
    this.beStrong = function(n) {
        this.w = this.w + n;
    }
    this.beStrongRandom = function(n) {
        this.w = this.w + this.random(0, n);
    }

    this.random = function(min, max) {
        return Math.random() * (max - min) + min;
    }
    this.randInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    this.붉은만큼 = this.r * 0.3;
    this.붉다면 = function() {
        if (this.r > this.g) {
            this.isDoing = true;
        } else {
            this.isDoing = false;
        }
        return this;
    }
    this.그렇지않다면 = function() {
        this.isDoing = !this.isDoing;
        return this;
    }

    this.강해져라 = function() {
        if (this.isDoing) {
            this.beStrong(15);
        }
        return this;
    }

    this.흘러내려라 = function(v) {
        if (this.isDoing) {
            this.moveDown(v);
        }
        return this;
    }

    this.흩어져라 = function() {
        if (this.isDoing) {
            this.moveRandom(this.r*0.5);
        }
        return this;
    }
}

module.exports = MetaPixel;
