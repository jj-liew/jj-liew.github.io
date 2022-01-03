var canvas;
let stars = [];
let connect = 0;
let canConnect = true;
let n = 40;
let randx = 0;
let randy = 0;
let randxs = [];
let randys = [];
let opa = 0;
let flick = true;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0,0);
  canvas.style('z-index', -1);

  starColor = color(255, 255, 255);
  
  for (i = 0; i < n; i++) {
    randxs[i] = -10;
   }
  for (i = 0; i < n; i++) {
    randys[i] = -10;
   }
  
  setInterval(randomizeX, 8500);
  setInterval(randomizeY, 8500);
}

function draw() {
  background(color("#181818"));
  
  noStroke();
  fill(starColor);
  starColor.setAlpha(opa);
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = starColor;
  
  drawCircle();
  
  flicker();

  //console.log(connect, canConnect);
}

function randomizeX(){
  randx = int(random(0, 9));
   for (i = 0; i < n; i++) {
    randxs[i] = int(random(0, windowWidth));
   }
  opa = 0;
}

function randomizeY(){
  randy = int(random(0, 9));
  for (i = 0; i < n; i++) {
    randys[i] = int(random(0, windowHeight));
   }
  opa = 0;
}

function drawCircle() {
  
  for (i = 0; i < 9; i++) {
    for (j = 0; j < 9; j++) {
      stars[i] = [];    
    }
  }
  
  for (i = 0; i < n; i++) {
    stars[randx][randy] = circle(randxs[i], randys[i], 3);
    let d = dist(randxs[i], randys[i], mouseX, mouseY);
    if (d < 3*50 && canConnect == true) {
      stroke(starColor);
      line(randxs[i], randys[i], mouseX, mouseY);
      circle(mouseX, mouseY, 3);
      connect +=1;
    }
    if (connect >= 5) {
      canConnect = false;
      } else {
      canConnect = true;
    }
  }
}

function mouseMoved() {
  connect = 0;
  return false;
}

function flicker() {

  if (opa >= 100) {
    flick = false;
  }
  if (opa == 0) {
    flick = true;
  }
  
  if (flick == true) {
    opa+=0.4;
  } else if (flick == false) {
    opa-=0.4;
  }
}

//function


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
