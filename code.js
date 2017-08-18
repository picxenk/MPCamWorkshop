// if (pixel.r > pixel.g) { 
// pixel.beStrong(30); 
// pixel.moveDown(r*0.6); 
// } else { 
// pixel.moveRandom(r*0.2); 
// } 
if (pixel.r > pixel.b) {
    pixel.moveLeft(r*0.5)
} else {
    pixel.moveRight(b*0.5)
}
