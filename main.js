const SIGNUPS = 0.5;

document.getElementsByTagName('form')[0].addEventListener('submit', function (e) {
  e.preventDefault();
  tween.play();
  colorChange.play();
  moveCanvas.play();
  colorChangeHex.play();
  document.getElementsByTagName('body')[0].classList.add('background-change');
  document.getElementsByTagName('h2')[0].textContent =
    "Let's make waves. Invite your friends before the waitlist closes!";
  document.getElementsByTagName('h1')[0].style.color = 'white';
  document.getElementsByTagName('h2')[0].style.color = 'white';
  document.getElementsByClassName('description')[0].style.display = 'none';
  document.getElementsByTagName('form')[0].style.display = 'none';
  document.getElementsByClassName('signups')[0].innerHTML = `— <b>${
    SIGNUPS * 1000
  }</b> <em>Current Sign-ups</em>`;
  document.getElementsByClassName('signups')[0].style.top = `${230 - SIGNUPS * 93}px`;
  initCanvas();
});

const lines = document.getElementsByClassName('line');
const hexagon = document.getElementsByClassName('hexagon')[0];
const canvas = document.getElementsByTagName('canvas')[0];

let tween = TweenMax.to(lines, {
  duration: 5,
  physics2D: {
    velocity: 'random(200, 250)',
    angle: 'random(200, 340)',
    gravity: 900,
  },
  rotation: 'random(-360, 360)',
  paused: true,
});

let colorChange = TweenMax.to([lines, hexagon], {
  duration: 0.2,
  paused: true,
  stroke: 'rgb(255, 255, 255)',
});

let colorChangeHex = TweenMax.to(hexagon, {
  duration: 0.2,
  paused: true,
  fill: 'rgba(0,0,0,0)',
  delay: 0.6,
});

let moveCanvas = TweenMax.to(canvas, {
  duration: 4,
  paused: true,
  visibility: 'visible',
});

gsap.defaults({ ease: 'elastic(1, 0.2)' });

let svg = document.querySelector('svg');
let paths = document.getElementsByClassName('line');

function runPath(path) {
  let currentPath = path.getAttribute('d');
  let currentPathSE = currentPath.split(' ');
  let connected = false;
  let snapDist = 14;
  function findMid(x1, x2, y1, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
  }
  const mid = findMid(
    parseInt(currentPathSE[0].split(',')[0].substring(1)),
    parseInt(currentPathSE[1].split(',')[0]),
    parseInt(currentPathSE[0].split(',')[1]),
    parseInt(currentPathSE[1].split(',')[1])
  );

  let p0 = { x: currentPathSE[0].split(',')[0].substring(1), y: currentPathSE[0].split(',')[1] };
  let p1 = { x: mid[0], y: mid[1] };
  let p2 = { x: currentPathSE[1].split(',')[0], y: currentPathSE[1].split(',')[1] };

  svg.addEventListener('mousemove', onMove);

  gsap.ticker.add(update);
  update();

  document.getElementsByTagName('form')[0].addEventListener('submit', function (e) {
    gsap.killTweensOf(p1);
    svg.removeEventListener('mousemove', onMove);
  });

  function update() {
    let d = 'M' + p0.x + ',' + p0.y + ' Q' + p1.x + ',' + p1.y + ' ' + p2.x + ',' + p2.y;

    path.setAttribute('d', d);

    if (Math.abs(p1.x - mid[0]) > snapDist * 2 || Math.abs(p1.y - mid[1]) > snapDist * 2) {
      connected = false;
      gsap.to(p1, { duration: 1, x: mid[0], y: mid[1] });
    }
  }

  function onMove(event) {
    if (!connected && event.target === path) {
      connected = true;
      gsap.killTweensOf(p1);
    }

    if (connected) {
      p1.x = event.pageX - (window.innerWidth / 2 - 300);
      p1.y = event.pageY;
    }
  }
}

for (path of paths) {
  runPath(path);
}

var points = [];
var rafID = null;

var guiVars = function () {
  this.totalPoints = 8;
  this.viscosity = 30;
  this.mouseDist = 40;
  this.damping = 0.05;
  this.showIndicators = false;
  this.leftColor = 'white';
  this.rightColor = '#0082fc';
};
var vars = new guiVars();

var mouseX = 0,
  mouseY = 0,
  mouseLastX = 0,
  mouseLastY = 0,
  mouseDirectionX = 0,
  mouseDirectionY = 0,
  mouseSpeedX = 0,
  mouseSpeedY = 0;

function mouseDirection(e) {
  if (mouseX < e.pageX) mouseDirectionX = 1;
  else if (mouseX > e.pageX) mouseDirectionX = -1;
  else mouseDirectionX = 0;

  if (mouseY < e.pageY) mouseDirectionY = 1;
  else if (mouseY > e.pageY) mouseDirectionY = -1;
  else mouseDirectionY = 0;

  mouseX = e.pageX;
  mouseY = e.pageY;
}
document.addEventListener('mousemove', mouseDirection);

function mouseSpeed() {
  mouseSpeedX = mouseX - mouseLastX;
  mouseSpeedY = mouseY - mouseLastY;

  mouseLastX = mouseX;
  mouseLastY = mouseY;

  setTimeout(mouseSpeed, 50);
}
mouseSpeed();

function Point(x, y, canvas) {
  this.x = x;
  this.ix = x;
  this.vx = 0;
  this.cx = 0;
  this.y = y;
  this.iy = y;
  this.vy = 0;
  this.cy = 0;
  this.canvas = canvas;
}

Point.prototype.move = function () {
  this.vy += (this.iy - this.y) / vars.viscosity;

  var dx = this.x - mouseX + (window.innerWidth / 2 - 100),
    dy = this.iy - mouseY + 140;

  var gap = this.canvas.getAttribute('gap');

  if ((mouseDirectionY > 0 && mouseY > this.y) || (mouseDirectionY < 0 && mouseY < this.y)) {
    if (Math.sqrt(dy * dy) < vars.mouseDist && Math.sqrt(dx * dx) < gap) {
      this.vy = mouseSpeedY / 8;
    }
  }

  this.vy *= 1 - vars.damping;
  this.y += this.vy;
};

function initCanvas() {
  var canvas = document.getElementsByTagName('canvas')[0];
  points = [];
  var gap = canvas.width / (vars.totalPoints - 1);
  var pointY = 150 - SIGNUPS * 90; //60
  for (var i = 0; i <= vars.totalPoints - 1; i++) points.push(new Point(i * gap, pointY, canvas));
  renderCanvas();
  canvas.setAttribute('gap', gap);
}

function renderCanvas() {
  var canvas = document.getElementsByTagName('canvas')[0];
  var context = canvas.getContext('2d');

  rafID = requestAnimationFrame(renderCanvas);

  context.fillStyle = vars.leftColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i <= vars.totalPoints - 1; i++) points[i].move();

  context.fillStyle = vars.rightColor;
  context.strokeStyle = vars.rightColor;
  context.beginPath();

  for (var i = 0; i <= vars.totalPoints - 1; i++) {
    var p = points[i];

    if (points[i + 1] != undefined) {
      p.cx = (p.x + points[i + 1].x) / 2 - 0.0001; // - 0.0001 hack to fix a 1px offset bug on Chrome...
      p.cy = (p.y + points[i + 1].y) / 2;
    } else {
      p.cx = p.ix;
      p.cy = p.iy;
    }
    context.bezierCurveTo(p.x, p.y, p.cx, p.cy, p.cx, p.cy);
  }
  context.lineTo(200, 200);
  context.lineTo(0, 200);
  context.fill();
}
