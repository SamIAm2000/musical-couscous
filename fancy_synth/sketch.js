let drawnImage;
let backgroundImage;
let pressedTimes = 0;
let canvas;
function preload() {
  // Load the image
  backgroundImage = loadImage('img.JPG');
}

function setup() {
  //set background
  canvas = createCanvas(windowWidth, windowHeight); // Adjust according to your needs
  canvas.parent('p5-canvas-container'); // Render canvas within the #p5-canvas-container

  // Set the background to the loaded image
  image(backgroundImage, 0, 0, width, height);
  originalimg = createImage(backgroundImage.width, backgroundImage.height);
  drawnImage = createImage(windowWidth, windowHeight);
  originalimg.copy(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, originalimg.width, originalimg.height);
  //drawnImage.copy(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, drawnImage.width, drawnImage.height);
  angleMode(DEGREES);

}

function draw() {
}

function keyPressed() {
  console.log("key pressed");
  // if key is SHIFT, save sketch
  if (keyCode === 16) {
      save('mysketch.jpg');
      image(originalimg, 0, 0, width, height);
      return;
  }
  if (keyCode === 32) { // if key is SPACE, change image
    pressedTimes = (pressedTimes + 1) % 2;
    if (pressedTimes == 0) {
      updatePixels();
      image(drawnImage, 0, 0, windowWidth, windowHeight);
      console.log("drawnImage");
    } else {
      updatePixels();
      image(originalimg, 0, 0, windowWidth, windowHeight);a
      console.log("original image");
    }
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
  drawnImage.copy(canvas, 0, 0, windowWidth, windowHeight, 0, 0, windowWidth, windowHeight); // Copy current canvas state to drawnImage
  updatePixels();
  
}