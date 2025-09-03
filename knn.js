// KNN Visualizer JS

// Utility: Generate normal distributed random number (Box-Muller)
function randn_bm(mean, std) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * std + mean;
}

// Generate points
function generatePoints(n, meanX, meanY, std, color) {
    let pts = [];
    for(let i=0; i<n; i++) {
        pts.push({
            x: randn_bm(meanX, std),
            y: randn_bm(meanY, std),
            color: color
        });
    }
    return pts;
}

const canvas = document.getElementById('plot');
const ctx = canvas.getContext('2d');
const kSelect = document.getElementById('k-select');
const classifyBtn = document.getElementById('classify-btn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Initial points
let points = [
    ...generatePoints(30, 150, 350, 50, 'red'),
    ...generatePoints(30, 350, 150, 50, 'blue')
];
let unknownPoint = null;

function drawPoints() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Draw known points
    for(const pt of points) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, 2*Math.PI);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#333';
        ctx.stroke();
    }
    // Draw unknown point
    if(unknownPoint) {
        ctx.beginPath();
        ctx.arc(unknownPoint.x, unknownPoint.y, 10, 0, 2*Math.PI);
        ctx.fillStyle = unknownPoint.color;
        ctx.globalAlpha = 1.0;
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}

drawPoints();

canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Only one unknown point at a time
    unknownPoint = { x, y, color: 'green' };
    classifyBtn.disabled = false;
    drawPoints();
});

function distance(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function classifyKNN() {
    if(!unknownPoint) return;
    const k = parseInt(kSelect.value);
    // Compute distances
    let dists = points.map(pt => ({...pt, dist: distance(pt, unknownPoint)}));
    dists.sort((a,b) => a.dist - b.dist);
    let neighbors = dists.slice(0, k);
    let reds = neighbors.filter(pt => pt.color === 'red').length;
    let blues = neighbors.filter(pt => pt.color === 'blue').length;
    unknownPoint.color = reds > blues ? 'red' : 'blue';
    drawPoints();
    classifyBtn.disabled = true;
}

classifyBtn.addEventListener('click', classifyKNN);
