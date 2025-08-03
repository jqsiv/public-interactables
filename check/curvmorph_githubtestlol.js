const COLORS = ["#FF69B4", "#6EC6FF", "#FFDE59", "#88D498"];
const POINTS = 8, RADIUS = 120, VARIATION = 70, DURATION = 1000;

let currentColor, targetColor;
let points = [], targetPoints = [], interpPoints = [];
let animStart = 0, animT = 1;

function setup() {
  createCanvas(600, 600);
  stroke(20);
  strokeWeight(2);
  noFill();
  currentColor = targetColor = color(random(COLORS));
  points = createBlobPoints();
  targetPoints = points.map(p => p.copy());
  interpPoints = points.map(p => p.copy());
}

function draw() {
  background(245);
  translate(width / 2, height / 2);
  
  updateAnimation();
  const t = easeInOutCubic(animT);

  for (let i = 0; i < POINTS; i++) {
    interpPoints[i].x = lerp(points[i].x, targetPoints[i].x, t);
    interpPoints[i].y = lerp(points[i].y, targetPoints[i].y, t);
  }

  fill(lerpColor(currentColor, targetColor, t));
  drawBlob(interpPoints);

  // Lock in transition when complete
  if (animT >= 1 && points[0].dist(targetPoints[0]) > 0.1) {
    for (let i = 0; i < POINTS; i++) {
      points[i].set(targetPoints[i]);
    }
    currentColor = targetColor;
  }
}

function mousePressed() {
  if (animT >= 1) morph(random(COLORS));
}

function keyPressed() {
  if (animT < 1) return;
  const colorMap = {
    ' ': random(COLORS),
    '1': COLORS[0],
    '2': COLORS[1],
    '3': COLORS[2],
    '4': COLORS[3]
  };
  if (colorMap[key]) morph(colorMap[key]);
  if (key === 's' || key === 'S') saveCanvas("blob", "png");
}

function morph(newColor) {
  animStart = millis();
  animT = 0;
  currentColor = targetColor;
  targetColor = color(newColor);
  for (let i = 0; i < POINTS; i++) {
    const angle = map(i, 0, POINTS, 0, TWO_PI);
    const r = RADIUS + random(-VARIATION, VARIATION);
    targetPoints[i].set(cos(angle) * r, sin(angle) * r);
  }
}

function updateAnimation() {
  if (animT < 1) {
    animT = constrain((millis() - animStart) / DURATION, 0, 1);
  }
}

function createBlobPoints() {
  return Array.from({ length: POINTS }, (_, i) => {
    const angle = map(i, 0, POINTS, 0, TWO_PI);
    const r = RADIUS + random(-VARIATION, VARIATION);
    return createVector(cos(angle) * r, sin(angle) * r);
  });
}

function drawBlob(pts) {
  beginShape();
  curveVertex(pts[pts.length - 1].x, pts[pts.length - 1].y);
  for (let p of pts) {
    curveVertex(p.x, p.y);
  }
  curveVertex(pts[0].x, pts[0].y);
  curveVertex(pts[1].x, pts[1].y);
  endShape(CLOSE);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}
