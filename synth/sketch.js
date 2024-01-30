// We define our palette
//let palette = ["#2c695a", "#4ad6af", "#7facc6", "#4e93cc", "#f6684f", "#ffd300"];
let palette = ["#F2E2C4", "#261D11", "#A6290D"]; //white black red
//let palette = ['#0477BF', '#F2B705', '#F2E2C4', '#261D11', '#A6290D']; //bauhaus colors blue yellow white black red
let available_brushes = ["hatch_brush"];
let drawoncanvas = 0;
function setup() {
  //noLoop();
  createCanvas(600, 600, WEBGL);
  angleMode(DEGREES);
  background("#F2E2C4");

  // Scale brushes to adapt to canvas size
  brush.scaleBrushes(1.5);

  // Activate the flowfield we're going to use
  //brush.field("seabed");
}

function draw() {
  translate(-width / 2, -height / 2);
  // brush.box() returns an array with available brushes
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
  brush.flowLine(
    random(width),
    random(height),
    random(300, 800),
    random(0, 360)
  );
}

function keyPressed() {
  console.log("key pressed");
  // drawCircle();
  // drawLine();
  // drawRectangle();

  var num = Math.floor(random(1, 4));
    console.log(num)
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
