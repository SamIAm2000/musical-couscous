let backgroundImage;
function preload() {
  // Load the image
  backgroundImage = loadImage('./img.JPG');
}

function setup() {
  //set background
  let canvas = createCanvas(windowWidth, windowHeight); // Adjust according to your needs
  canvas.parent('p5-canvas-container'); // Render canvas within the #p5-canvas-container

  // Set the background to the loaded image
  image(backgroundImage, 0, 0, width, height);

  angleMode(DEGREES);

}

function draw() {
}

function keyPressed() {
  console.log("key pressed");
  // if key is SHIFT, save sketch
  if (keyCode === 16) {
    save('mysketch.jpg');
    return;
  }

  let x1 = floor(random(width));
  let y1 = floor(random(height));
  let size = floor(random(70, 100));

  // Make sure the copied region stays within the canvas bounds
  x1 = constrain(x1, 0, width - size);
  y1 = constrain(y1, 0, height - size);

  let x2 = floor(x1 + random(-10, 10));
  let y2 = floor(y1 + random(-10, 10));

  // Make sure the new position stays within the canvas bounds
  x2 = constrain(x2, 0, width - size);
  y2 = constrain(y2, 0, height - size);

  set(x2, y2, get(x1, y1, size, size));
  updatePixels();
}
