const COLORS = ["#FF69B4", "#6EC6FF", "#FFDE59", "#88D498"];
const POINTS = 8, RADIUS = 120, VARIATION = 70, DURATION = 1000;
let currentColor, targetColor, points = [], targetPoints = [];
let animStart, animT = 1;
let lastFrameTime = 0;
let targetFrameRate = 60;

function setup() {
  createCanvas(600, 600);
  stroke(20);
  strokeWeight(2);
  
  // Set consistent frame rate
  frameRate(targetFrameRate);
  
  currentColor = targetColor = color(random(COLORS));
  points = targetPoints = createBlobPoints();
  
  // Initialize timing
  lastFrameTime = millis();
}

function draw() {
  background(245);
  translate(width / 2, height / 2);
  
  // Calculate delta time for frame-rate independent animation
  const currentTime = millis();
  const deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;
  
  updateAnimation(deltaTime);
  const t = easeInOutCubic(animT);
  const interpPoints = interpolatePoints(points, targetPoints, t);
  
  fill(lerpColor(currentColor, targetColor, t));
  drawBlob(interpPoints);
  
  // Clean transition when animation completes
  if (animT >= 1 && points[0].dist(targetPoints[0]) > 0.01) {
    points = targetPoints.map(p => p.copy());
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

function updateAnimation(deltaTime) {
  if (animT < 1) {
    // Frame-rate independent timing
    const expectedFrameTime = 1000 / targetFrameRate;
    const timeMultiplier = deltaTime / expectedFrameTime;
    
    const elapsed = millis() - animStart;
    animT = constrain(elapsed / DURATION, 0, 1);
    
    // Smooth out any timing jitter
    animT = lerp(animT, elapsed / DURATION, 0.1);
    animT = constrain(animT, 0, 1);
  }
}

function morph(newColor) {
  animStart = millis();
  animT = 0;
  currentColor = targetColor;
  targetColor = color(newColor);
  targetPoints = createBlobPoints();
}

function createBlobPoints() {
  return Array.from({length: POINTS}, (_, i) => {
    const angle = map(i, 0, POINTS, 0, TWO_PI);
    const r = RADIUS + random(-VARIATION, VARIATION);
    return createVector(cos(angle) * r, sin(angle) * r);
  });
}

function interpolatePoints(from, to, t) {
  return from.map((p, i) => createVector(
    lerp(p.x, to[i].x, t), 
    lerp(p.y, to[i].y, t)
  ));
}

function drawBlob(pts) {
  beginShape();
  curveVertex(pts[pts.length - 1].x, pts[pts.length - 1].y);
  pts.forEach(p => curveVertex(p.x, p.y));
  curveVertex(pts[0].x, pts[0].y);
  curveVertex(pts[1].x, pts[1].y);
  endShape();
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}
