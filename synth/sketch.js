// We define our palette
let palette = ["#F2E2C4", "#261D11", "#A6290D"]; //white black red
let available_brushes = ["hatch_brush"];
let drawoncanvas = 0;
function setup() {
  //set background
  createCanvas(600, 600, WEBGL);
  angleMode(DEGREES);
  background("#F2E2C4");

  // Scale brushes to adapt to canvas size
  brush.scaleBrushes(1.5);
}

function draw() {
  translate(-width / 2, -height / 2);
}

function drawCircle() {
  var color = random(palette);
  brush.set(random(available_brushes), color, 5);
  brush.fill(color, 75);
  brush.circle(random(width), random(height), random(10, 300), true);
}

function drawRectangle() {
  var color = random(palette);
  brush.fill(color, 75);
  brush.rect(random(width), random(height), random(50, 200), random(50, 200));
}

function drawLine() {
  brush.set(random(available_brushes), random(palette), 1);
  brush.strokeWeight(random(0.0, 2.5));
  // Draw a random flowLine (x, y, length, direction)
  brush.flowLine(random(width), random(height), random(300, 800), random(0, 360));
}

function keyPressed() {
  console.log("key pressed");
  
  if (keyCode === 16) {
    save('mysketch.jpg');
    return;
  }

  //randomly choose a function to do
  //draws some shapes
  var num = Math.floor(random(1, 4));
  console.log(num);
  switch (num) {
    case 1:
      drawCircle();
      drawCircle();
      drawLine();
      break;
    case 2:
      drawRectangle();
      drawRectangle();
      drawLine();
      break;
    case 3:
      drawLine();
      drawLine();
      drawLine();
      break;
    default:
      console.log("nothing");
  }
  // drawCircle();
  brush.reDraw();
}
