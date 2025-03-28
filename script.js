let pixelSize = 20;
let points = [];
let lastTime = 0;
const interval = 300; // ms between growth
const baseGrowthChance = 0.5;
const extraRandomness = 0.3;

let loopDelay = 2000; // Pause duration after full screen
let fillCompleteTime = null;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  background(255);

  startNewGrowth();
}

function draw() {
  if (!fillCompleteTime && millis() - lastTime > interval) {
    growPixels();
    lastTime = millis();
  }

  if (!fillCompleteTime && isScreenFilled()) {
    fillCompleteTime = millis(); // Start delay countdown
  }

  if (fillCompleteTime && millis() - fillCompleteTime > loopDelay) {
    resetGrowth();
    fillCompleteTime = null;
  }
}

function growPixels() {
  let newPoints = [];

  for (let pt of points) {
    if (!pt.active) continue;

    let dirs = [
      { dx: pixelSize, dy: 0 },
      { dx: -pixelSize, dy: 0 },
      { dx: 0, dy: pixelSize },
      { dx: 0, dy: -pixelSize },
      { dx: pixelSize, dy: pixelSize },
      { dx: pixelSize, dy: pixelSize }, // bias diagonals
      { dx: pixelSize, dy: -pixelSize },
      { dx: -pixelSize, dy: pixelSize },
      { dx: -pixelSize, dy: -pixelSize }
    ];

    shuffle(dirs, true);

    for (let dir of dirs) {
      if (random() < baseGrowthChance + random(-extraRandomness, extraRandomness)) {
        let nx = pt.x + dir.dx;
        let ny = pt.y + dir.dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          let alreadyExists = points.some(p => p.x === nx && p.y === ny);
          if (!alreadyExists) {
            let gray = randomGray();
            let newPt = {
              x: nx,
              y: ny,
              gray,
              active: random() < random(0.4, 0.9)
            };
            drawPixel(newPt);
            newPoints.push(newPt);
          }
        }
      }
    }

    pt.active = random() < 0.8;
  }

  points = points.concat(newPoints);
}

function isScreenFilled() {
  let cols = floor(width / pixelSize);
  let rows = floor(height / pixelSize);
  let totalSlots = cols * rows;
  return points.length >= totalSlots;
}

function resetGrowth() {
  background(255);
  startNewGrowth();
}

function startNewGrowth() {
  points = [];
  points.push({
    x: width - pixelSize,
    y: height - pixelSize,
    gray: randomGray(),
    active: true
  });
  drawPixel(points[0]);
}

function drawPixel(pt) {
  fill(pt.gray);
  noStroke();
  rect(pt.x, pt.y, pixelSize, pixelSize);
}

function randomGray() {
  let g = random(50, 200);
  return color(g, g, g);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  resetGrowth(); // Restart growth cleanly on resize
}
