// Kevin Liew
"use strict";

let transformUniform, colorUniform, overallTransform, mouseClickFront, mouseClickBack;

const BLACK  = [0.0, 0.0, 0.0];
const GREEN  = [0.0, 0.6, 0.3];
const RED    = [0.8, 0.0, 0.0];
const BLUE   = [0.1, 0.4, 0.8];
const ORANGE = [0.9, 0.5, 0.0];
const WHITE  = [0.9, 0.9, 0.9];
const YELLOW = [1.0, 0.8, 0.0];

setup("cube.vert", "cube.frag").then(main);

class SubCube {
  constructor(x, y, z) {
    this.x = this.x0 = x;
    this.y = this.y0 = y;
    this.z = this.z0 = z;
    this.transform = (new Transform()).translate(x, y, z);
  }

  drawSquare([r, g, b], outside = true) {
    overallTransform.push();
    overallTransform.translate(0, 0, 0.5);
    gl.uniformMatrix4fv(transformUniform, false,
      overallTransform.matrix);
    gl.uniform3f(colorUniform, ...BLACK);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    if (outside) {
      overallTransform.translate(0, 0, 0.001).scale(0.9, 0.9, 1);
      gl.uniformMatrix4fv(transformUniform, false,
        overallTransform.matrix);
      gl.uniform3f(colorUniform, r, g, b);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    overallTransform.pop();
  }

  draw() {
    overallTransform.push();
    overallTransform.multiplyBy(this.transform);
    this.drawSquare(GREEN,  this.z0 ==  1);  // +z
    overallTransform.rotate(90, "Y");
    this.drawSquare(RED,    this.x0 ==  1);  // +x
    overallTransform.rotate(90, "Y"); 
    this.drawSquare(BLUE,   this.z0 == -1);  // -z
    overallTransform.rotate(90, "Y");
    this.drawSquare(ORANGE, this.x0 == -1);  // -x
    overallTransform.rotate(90, "X");
    this.drawSquare(WHITE,  this.y0 == -1);  // -y
    overallTransform.rotate(180, "X");
    this.drawSquare(YELLOW, this.y0 ==  1);  // +y
    overallTransform.pop();
  }

  rotateXYZ(ccw, axis) {

    if (axis == "X") {
      let y = ccw ? -this.z : this.z;
      this.z = ccw ? this.y : -this.y;
      this.y = y;

    } else if (axis == "Y") {
      let x = ccw ? this.z : -this.z;
      this.z = ccw ? -this.x : this.x;
      this.x = x;
    
    } else { // Z
      let x = ccw ? -this.y : this.y;
      this.y = ccw ? this.x : -this.x;
      this.x = x;
    }
  }
}

function main() {
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);
  
  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  transformUniform = gl.getUniformLocation(
    shaderProgram, "transform");
  colorUniform = gl.getUniformLocation(
    shaderProgram, "color");

  let vertexData = [ -0.5,  0.5, 0,
                     -0.5, -0.5, 0,
                      0.5, -0.5, 0,
                      0.5,  0.5, 0 ];
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
      gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
      3, gl.FLOAT, false, 12, 0);

  overallTransform = new Transform();
  overallTransform.frustum(1, 0.75, 5, 35);
  overallTransform.translate(0, 0, -20);
  overallTransform.rotate(20, "X").rotate(-30, "Y");

  // invert overallTransform
  let inverted = Transform.invert(overallTransform);
    
  const subCubes = [ [ [],[],[] ],
                     [ [],[],[] ],
                     [ [],[],[] ] ];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        subCubes[i][j].push(new SubCube(i - 1, j - 1, k - 1));
        subCubes[i][j][k].draw();
      }
    }
  }

  let cv = document.querySelector("#canvas");
  let click = [];
  let rotating = false;

  // stores mouseDown coordinates and transfer to mouseUp 
  function setMouseClick(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    return [x1, y1, z1, x2, y2, z2, x3, y3, z3];
  }

  function mousedownHandler(event) {
    // get cvv coordinates (-1 to 1)
    let xCoord = ((event.pageX - cv.offsetLeft) / (canvas.width / 2) ) - 1;
    let yCoord = -(((event.pageY - cv.offsetTop) / (canvas.height / 2) ) - 1);

    let mouseClickF = [xCoord, yCoord, -1, 1];
    // get 3d coordinates from mouse coordinates
    mouseClickFront = math.multiply(Transform.make2D(inverted.matrix), mouseClickF).flat();
    // divide all coordinates by w (mouseClickFront[3])
    mouseClickFront = mouseClickFront.map(n => n / mouseClickFront[3]);
       
    let mouseClickB = [xCoord, yCoord, 1, 1];
    mouseClickBack = math.multiply(Transform.make2D(inverted.matrix), mouseClickB).flat();
    mouseClickBack = mouseClickBack.map(n => n / mouseClickBack[3]);

    let t = 0;
    
    // get x,y,z in three situations (x=1.5, y=1.5, z=1.5)
    let x = 1.5;
    t = (x - mouseClickFront[0]) / (mouseClickBack[0] - mouseClickFront[0]);

    let x1 = mouseClickFront[0] + (mouseClickBack[0] - mouseClickFront[0]) * t;
    let y1 = mouseClickFront[1] + (mouseClickBack[1] - mouseClickFront[1]) * t;
    let z1 = mouseClickFront[2] + (mouseClickBack[2] - mouseClickFront[2]) * t;

    let y = 1.5; 
    t = (y - mouseClickFront[1]) / (mouseClickBack[1] - mouseClickFront[1]);

    let x2 = mouseClickFront[0] + (mouseClickBack[0] - mouseClickFront[0]) * t;
    let y2 = mouseClickFront[1] + (mouseClickBack[1] - mouseClickFront[1]) * t;
    let z2 = mouseClickFront[2] + (mouseClickBack[2] - mouseClickFront[2]) * t;
    
    let z = 1.5; 
    t = (z - mouseClickFront[2]) / (mouseClickBack[2] - mouseClickFront[2]);

    let x3 = mouseClickFront[0] + (mouseClickBack[0] - mouseClickFront[0]) * t;
    let y3 = mouseClickFront[1] + (mouseClickBack[1] - mouseClickFront[1]) * t;
    let z3 = mouseClickFront[2] + (mouseClickBack[2] - mouseClickFront[2]) * t;

    click = setMouseClick(x1, y1, z1, x2, y2, z2, x3, y3, z3);
  }
  
  function mouseupHandler(event) {
    // this repeated calculation is to get the coordinates of mouseUp to calculate drag
    let xCoord = ((event.pageX - cv.offsetLeft) / (canvas.width / 2) ) - 1;
    let yCoord = -(((event.pageY - cv.offsetTop) / (canvas.height / 2) ) - 1);

    let mouseClickF = [xCoord, yCoord, -1, 1];
    mouseClickFront = math.multiply(Transform.make2D(inverted.matrix), mouseClickF).flat();
    mouseClickFront = mouseClickFront.map(n => n / mouseClickFront[3]);
       
    let mouseClickB = [xCoord, yCoord, 1, 1];
    mouseClickBack = math.multiply(Transform.make2D(inverted.matrix), mouseClickB).flat();
    mouseClickBack = mouseClickBack.map(n => n / mouseClickBack[3]);

    let t = 0;
    
    let x = 1.5;
    t = (x - mouseClickFront[0]) / (mouseClickBack[0] - mouseClickFront[0]);

    let y1 = mouseClickFront[1] + (mouseClickBack[1] - mouseClickFront[1]) * t;
    let z1 = mouseClickFront[2] + (mouseClickBack[2] - mouseClickFront[2]) * t;

    let y = 1.5; 
    t = (y - mouseClickFront[1]) / (mouseClickBack[1] - mouseClickFront[1]);

    let x2 = mouseClickFront[0] + (mouseClickBack[0] - mouseClickFront[0]) * t;
    let z2 = mouseClickFront[2] + (mouseClickBack[2] - mouseClickFront[2]) * t;
    
    let z = 1.5; 
    t = (z - mouseClickFront[2]) / (mouseClickBack[2] - mouseClickFront[2]);

    let x3 = mouseClickFront[0] + (mouseClickBack[0] - mouseClickFront[0]) * t;
    let y3 = mouseClickFront[1] + (mouseClickBack[1] - mouseClickFront[1]) * t;

    // coords from mouseDown - coords from mouseUp
    let yDrag1 = click[1] - y1; 
    let zDrag1 = click[2] - z1;
    let xDrag2 = click[3] - x2;
    let zDrag2 = click[5] - z2;
    let xDrag3 = click[6] - x3;
    let yDrag3 = click[7] - y3;

    rotating = true; // starts rotating
    let ccw = false;
    
    // click is an array that stores coordinates from mouseDown
    // so you choose the subgroup based on mouseDown (instead of mouseUp)

    // x = 1.5
    if (click[0] == 1.5 && (click[1] > -1.5 && click[1] < 1.5) && (click[2] > -1.5 && click[2] < 1.5)) {
      // dragging down or up (uses absolute value for easier comparison)
      if (Math.abs(yDrag1) > Math.abs(zDrag1)) {
        // choose counter clockwise or clockwise depends on the direction you drag
        if (yDrag1 < 0) {
          ccw = true;
        } 
        // determine which subgroup you drag
        if ((click[2] > -0.5 && click[2] < 0.5)) {         
          rotateGroup("Z", 0, ccw);
        }
        else if ((click[2] > 0.5 && click[2] < 1.5)) {  
          rotateGroup("Z", 1, ccw);
        }
        else if ((click[2] > -1.5 && click[2] < -0.5)) {   
          rotateGroup("Z", -1, ccw);
        }
      }
      else if (Math.abs(zDrag1) > Math.abs(yDrag1)) {
        if (zDrag1 > 0) {
          ccw = true;
        }  
        if ((click[1] > -0.5 && click[1] < 0.5)) {    
          rotateGroup("Y", 0, ccw);
        }
        else if ((click[1] > 0.5 && click[1] < 1.5)) {   
          rotateGroup("Y", 1, ccw);
        }
        else if ((click[1] > -1.5 && click[1] < -0.5)) {    
          rotateGroup("Y", -1, ccw);
        }
      }
    } 
    // y = 1.5
    else if (click[4] == 1.5 && (click[3] > -1.5 && click[3] < 1.5) && (click[5] > -1.5 && click[5] < 1.5)) {
      if (Math.abs(xDrag2) > Math.abs(zDrag2)) {
        if (xDrag2 > 0) {
          ccw = true;
        } 
        if ((click[5] > -0.5 && click[5] < 0.5)) {         
          rotateGroup("Z", 0, ccw);
        }
        else if ((click[5] > 0.5 && click[5] < 1.5)) {  
          rotateGroup("Z", 1, ccw);
        }
        else if ((click[5] > -1.5 && click[5] < -0.5)) {   
          rotateGroup("Z", -1, ccw);
        }
      }
      else if (Math.abs(zDrag2) > Math.abs(xDrag2)) {
        if (zDrag2 < 0) {
          ccw = true;
        }  
        if ((click[3] > -0.5 && click[3] < 0.5)) {    
          rotateGroup("X", 0, ccw);
        }
        else if ((click[3] > 0.5 && click[3] < 1.5)) {   
          rotateGroup("X", 1, ccw);
        }
        else if ((click[3] > -1.5 && click[3] < -0.5)) {    
          rotateGroup("X", -1, ccw);
        }
      }
    }
    // z = 1.5
    else if (click[8] == 1.5 && (click[6] > -1.5 && click[6] < 1.5) && (click[7] > -1.5 && click[7] < 1.5)) {
      if (Math.abs(xDrag3) > Math.abs(yDrag3)) {
        if (xDrag3 < 0) {
          ccw = true;
        } 
        if ((click[7] > -0.5 && click[7] < 0.5)) {         
          rotateGroup("Y", 0, ccw);
        }
        else if ((click[7] > 0.5 && click[7] < 1.5)) {  
          rotateGroup("Y", 1, ccw);
        }
        else if ((click[7] > -1.5 && click[7] < -0.5)) {   
          rotateGroup("Y", -1, ccw);
        }
      }
      else if (Math.abs(yDrag3) > Math.abs(xDrag3)) {
        if (yDrag3 > 0) {
          ccw = true;
        }  
        if ((click[6] > -0.5 && click[6] < 0.5)) {    
          rotateGroup("X", 0, ccw);
        }
        else if ((click[6] > 0.5 && click[6] < 1.5)) {   
          rotateGroup("X", 1, ccw);
        }
        else if ((click[6] > -1.5 && click[6] < -0.5)) {    
          rotateGroup("X", -1, ccw);
        }
      }
    } 
  }
  
  function rotateGroup(axis, group, ccw) {
    let inRotGroup;
    if      (axis == "X") inRotGroup = sc => sc.x == group;
    else if (axis == "Y") inRotGroup = sc => sc.y == group;
    else    /* Z */       inRotGroup = sc => sc.z == group;

    let f = 0;

    function animate() {

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            let sc = subCubes[i][j][k];

            if (inRotGroup(sc)) {
              sc.transform.preRotate(ccw ? 1 : -1, axis);
              if (f == 89) {
                sc.rotateXYZ(ccw, axis);
                rotating = false; // stops rotating
              }
            }
            sc.draw();
          }
        }
      }

      // cannot rotate while it's rotating, but you can preselect the subgroup and direction
      // as long as you don't release mouse click before the rotation ends 
      if (rotating == true) {
        window.removeEventListener("mouseup", mouseupHandler);
      } else {
        window.addEventListener("mousedown", mousedownHandler);
        window.addEventListener("mouseup", mouseupHandler);
      }

      if (++f < 90) {
        requestAnimationFrame(animate);   
      }
    }

    animate();
  }         
  window.addEventListener("mousedown", mousedownHandler);
  window.addEventListener("mouseup", mouseupHandler);
}