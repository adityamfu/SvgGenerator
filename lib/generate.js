var svg = document.querySelector('svg'),
  regenerate = document.getElementById('regenerate'),
  pointGroup = document.getElementById('points'),
  polygons = document.getElementById('polygons'),
  dashboard = document.querySelector('.dashboard'),
  noOfPoints = document.getElementById('noOfPoints'),
  polygonEdges = document.getElementById('polygonEdges'),
  showCircle = document.getElementById('showCircle'),
  edgeWidth = document.getElementById('edgeWidth'),
  btnGetSVG = document.getElementById('getSVG'),
  ctrlSpeed = document.getElementById('ctrlSpeed'),
  doAnimate = document.getElementById('doAnimate'),
  colorfull = document.getElementById('colorfull'),
  body = document.body,
  bg = document.querySelector('#bg'),
  svgNS = svg.namespaceURI,
  points = [],
  themes = [],
  theme = [],
  padding = 20,
  width,
  height,
  rr,
  gg,
  bb;

function setColor() {
  rr = parseInt(Math.random() * 200 + 55);
  gg = parseInt(Math.random() * 200 + 55);
  bb = parseInt(Math.random() * 200 + 55);
}

function drawPolygons(pointID, reset) {
  pointID = pointID || 0;
  if (!!reset) {
    polygons.innerHTML = '';
  }
  var poly = [],
    activePoint = points[pointID];
  points.forEach(function (p, i) {
    p.distance = getDistance(activePoint, p);
  });
  var temp = points.map(function (e, i) {
    if (i !== pointID) return e;
  });
  temp.sort(function (a, b) {
    return a.distance > b.distance ? 1 : -1;
  });

  temp = temp.filter(function (e, i) {
    if (i < polygonEdges.value) {
      e.angle = getAngleFromPoint(e, activePoint);
      return e;
    }
  });

  temp.sort(function (a, b) {
    return a.angle > b.angle ? 1 : -1;
  });

  temp.splice(0, 1);

  var d = ' ';
  for (var i = 0; i < temp.length; i++) {
    d += i === 0 ? 'M ' : i === 1 ? 'L ' : ' ';
    d += temp[i].X + ' ' + temp[i].Y + ' ';
  }
  d += ' L ' + temp[0].X + ' ' + temp[0].Y + ' ';
  var currentPath = d + ' Z';
  if (!!colorfull.checked) {
    setColor();
  }
  var polygon = document.createElementNS(svgNS, 'path');
  polygon.setAttribute('d', currentPath);
  polygon.setAttribute('stroke', 'rgba(' + rr + ',' + gg + ',' + bb + ',.2)');
  polygon.setAttribute('stroke-width', edgeWidth.value + 'px');
  polygon.setAttribute('fill', 'rgba(' + rr + ',' + gg + ',' + bb + ',.2)');
  polygons.appendChild(polygon);
}

function setSVG() {
  const monitorWidth = 80;
  const monitorHeight = 80;
  width = (monitorWidth / 100) * window.innerWidth;
  height = (monitorHeight / 100) * window.innerHeight;
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);

  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

function removeAll(finish) {
  var t = 100;
  p = Array.from(document.querySelectorAll('path'));
  function removePath() {
    p.pop().remove();
    if (p.length > 0) {
      setTimeout(removePath, 2);
      t = t * 0.7;
    } else {
      if (finish) setTimeout(finish, 100);
    }
  }
  try {
    removePath();
  } catch (e) {
    if (finish) setTimeout(finish, 100);
  }
}

function generateNew() {
  removeAll(() => {
    delete points;
    points = [];
    for (var i = 0; i < noOfPoints.value; i++) {
      points.push(new Point(parseInt(Math.random() * (width - padding) + padding / 2), parseInt(Math.random() * (height - padding) + padding / 2), i));
    }
    drawCircles();
    pointGroup.innerHTML = '';
    polygons.innerHTML = '';
    drawAll();
    animate();
  });
}

function drawAll() {
  polygons.innerHTML = '';
  for (var i = 0; i < points.length; i++) {
    drawPolygons(i);
  }
}

function animate() {
  if (!!doAnimate.checked) {
    for (var i = 0; i < points.length; i++) {
      points[i].move(ctrlSpeed.value);
    }
    drawAll();
    drawCircles();
  }
  requestAnimationFrame(animate);
}

function drawCircles() {
  pointGroup.innerHTML = '';
  if (!!showCircle.checked) {
    points.map(function (e, i) {
      var point = document.createElementNS(svgNS, 'circle');
      point.setAttribute('cx', e.X + 'px');
      point.setAttribute('cy', e.Y + 'px');
      point.setAttribute('r', '5px');
      point.setAttribute('title', i);
      point.setAttribute('stroke', 'rgba(' + rr + ',' + gg + ',' + bb + ',.6)');
      point.setAttribute('stroke-width', '2px');
      point.setAttribute('fill', 'none');
      pointGroup.appendChild(point);
    });
  }
}

function Point(x, y, id) {
  return {
    move: function (speed) {
      this.X += this.dx * speed;
      this.Y += this.dy * speed;
      if (this.X < 0 || this.X > width) {
        this.X -= this.dx * speed;
        this.dx = -this.dx;
      }
      if (this.Y < 0 || this.Y > height) {
        this.Y -= this.dy * speed;
        this.dy = -this.dy;
      }
    },
    X: x,
    Y: y,
    distance: -1,
    id: id,
    angle: -1,
    dx: Math.random() - Math.random(),
    dy: Math.random() - Math.random(),
  };
}

function getDistance(point1, point2) {
  var xs = 0;
  var ys = 0;

  xs = point2.X - point1.X;
  xs = xs * xs;

  ys = point2.Y - point1.Y;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
}

function getAngleFromPoint(point, centerPoint) {
  var dy = point.Y - centerPoint.Y,
    dx = point.X - centerPoint.X;
  var theta = Math.atan2(dy, dx);
  var angle = ((theta * 180) / Math.PI) % 360;
  angle = angle < 0 ? 360 + angle : angle;
  return angle;
}

function getSVG() {
  const svgElement = document.querySelector('svg');
  const svgXML = new XMLSerializer().serializeToString(svgElement);

  const noOfPointsValue = noOfPoints.value;
  const polygonEdgesValue = polygonEdges.value;
  const showCircleValue = showCircle.checked;
  const edgeWidthValue = edgeWidth.value;
  const doAnimateValue = doAnimate.checked;
  const ctrlSpeedValue = ctrlSpeed.value;
  const colorfullValue = colorfull.checked;

  const svgSpecContainer = document.getElementById('svgSpecContainer');
  const svgSpecContent = document.querySelector('.svg-spec-content');
  svgSpecContent.innerHTML = `
    <h1>SVG Specification</h1>
    <p>Points: <span>${noOfPointsValue}</span></p>
    <p>Edges: <span>${polygonEdgesValue}</span></p>
    <p>Show Circle: <span style="color: ${showCircleValue ? 'blue' : 'white'};">${showCircleValue ? 'Yes' : 'No'}</span></p>
    <p>Edge Width: <span>${edgeWidthValue}</span></p>
    <p>Animate: <span style="color: ${doAnimateValue ? 'blue' : 'white'};">${doAnimateValue ? 'Yes' : 'No'}</span></p>
    <p>Animation Speed: <span>${ctrlSpeedValue}</span></p>
    <p>Colorful: <span style="color: ${colorfullValue ? 'blue' : 'white'};">${colorfullValue ? 'Yes' : 'No'}</span></p>
    <button class="btn-action" id="downloadSVGButton">Download SVG</button>
    `;
  // <pre>${svgXML}</pre>
  svgSpecContainer.style.right = '0';
  overlayBg.classList.add('active');

  const downloadSVGButton = document.getElementById('downloadSVGButton');
  downloadSVGButton.addEventListener('click', () => {
    downloadSVG(svgXML);
  });
}

const closeBtn = document.createElement('div');
closeBtn.className = 'close-btn';
closeBtn.textContent = 'X';
closeBtn.addEventListener('click', () => {
  const svgSpecContainer = document.getElementById('svgSpecContainer');
  svgSpecContainer.style.right = '-400px';
  overlayBg.classList.remove('active');
});

svgSpecContainer.appendChild(closeBtn);

btnGetSVG.addEventListener('click', getSVG);

const overlayBg = document.createElement('div');
overlayBg.className = 'overlay-bg';
document.body.appendChild(overlayBg);

overlayBg.addEventListener('click', () => {
  const svgSpecContainer = document.getElementById('svgSpecContainer');
  svgSpecContainer.style.right = '-400px';
  overlayBg.classList.remove('active');
});

function downloadSVG() {
  const svgElement = document.querySelector('svg');
  const svgXML = new XMLSerializer().serializeToString(svgElement);

  const fileName = prompt('Input File Name! (ex : extention.svg):');
  if (fileName) {
    const blob = new Blob([svgXML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } else {
    alert('Nama file harus diisi untuk mengunduh.');
  }
}

setSVG();
window.onresize = setSVG;
regenerate.onclick = noOfPoints.oninput = polygonEdges.oninput = edgeWidth.oninput = generateNew;
showCircle.onchange = drawCircles;
colorfull.onchange = function () {
  getKulerTheme();
  drawAll();
};
setSVG();

function forEach(domNodes, cb) {
  return Array.prototype.forEach.call(domNodes, function (item, i) {
    cb(item, i);
  });
}

function aRun() {
  setColor();
  generateNew();
}

svg.addEventListener('click', aRun);
aRun();
