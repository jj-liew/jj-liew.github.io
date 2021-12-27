function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.position(0,0, 'fixed');
  canvas.style('z-index', '-1');
}

function draw() {

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
