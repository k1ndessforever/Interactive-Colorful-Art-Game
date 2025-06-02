const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.querySelector('.color-picker');
const clearBtn = document.getElementById('clear-btn');
const toggleTrailBtn = document.getElementById('toggle-trail');
const changeModeBtn = document.getElementById('change-mode');
const toggleMirrorBtn = document.getElementById('toggle-mirror');
const randomizeBtn = document.getElementById('randomize');

// Canvas setup
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Initial settings
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0;
let direction = true;
let lineWidth = 10;
let isTrailEnabled = true;
let currentMode = 0;
let isMirrorEnabled = false;
let autoDecayAmount = 0.01;
let shapes = [];

// Color presets
const colors = [
    '#FF1493', // Pink
    '#4169E1', // Royal Blue
    '#FF4500', // Orange Red
    '#FFD700', // Gold
    '#32CD32', // Lime Green
    '#9400D3', // Violet
    '#FF6347', // Tomato
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#FFFFFF'  // White
];

// Drawing modes
const modes = [
    { name: 'Particles', draw: drawParticles },
    { name: 'Brush', draw: drawBrush },
    { name: 'Spirals', draw: drawSpirals },
    { name: 'Stars', draw: drawStars },
    { name: 'Bubbles', draw: drawBubbles }
];

// Currently selected color
let selectedColor = colors[0];

// Populate color picker
colors.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.classList.add('color-option');
    colorOption.style.backgroundColor = color;
    colorOption.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        colorOption.classList.add('active');
        selectedColor = color;
    });
    colorPicker.appendChild(colorOption);
});

// Set initial active color
document.querySelector('.color-option').classList.add('active');

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', handleTouchStart);

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', handleTouchMove);

canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchend', stopDrawing);

clearBtn.addEventListener('click', clearCanvas);
toggleTrailBtn.addEventListener('click', toggleTrail);
changeModeBtn.addEventListener('click', changeMode);
toggleMirrorBtn.addEventListener('click', toggleMirror);
randomizeBtn.addEventListener('click', randomize);

// Adjust canvas size when window is resized
window.addEventListener('resize', () => {
    // Save current canvas content
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Restore content
    ctx.drawImage(tempCanvas, 0, 0);
});

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    const x = e.offsetX;
    const y = e.offsetY;

    // Call the current drawing mode function
    modes[currentMode].draw(x, y, lastX, lastY);

    // Mirror drawing if enabled
    if (isMirrorEnabled) {
        const mirrorX = canvas.width - x;
        modes[currentMode].draw(mirrorX, y, canvas.width - lastX, lastY);
    }

    [lastX, lastY] = [x, y];

    // Cycle through colors
    hue += 0.5;
    if (hue >= 360) hue = 0;

    // Change line width
    if (direction) {
        lineWidth += 0.1;
        if (lineWidth >= 50) direction = false;
    } else {
        lineWidth -= 0.1;
        if (lineWidth <= 5) direction = true;
    }
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes = [];
}

function toggleTrail() {
    isTrailEnabled = !isTrailEnabled;
    if (isTrailEnabled) {
        autoDecayAmount = 0.01;
    } else {
        autoDecayAmount = 0;
    }
}

function changeMode() {
    currentMode = (currentMode + 1) % modes.length;
    document.querySelector('.instructions').textContent =
        `Current Mode: ${modes[currentMode].name} - Click and drag to create evolving patterns.`;
}

function toggleMirror() {
    isMirrorEnabled = !isMirrorEnabled;
}

function randomize() {
    selectedColor = colors[Math.floor(Math.random() * colors.length)];
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.style.backgroundColor === selectedColor) {
            option.classList.add('active');
        }
    });

    currentMode = Math.floor(Math.random() * modes.length);
    document.querySelector('.instructions').textContent =
        `Current Mode: ${modes[currentMode].name} - Click and drag to create evolving patterns.`;

    lineWidth = 5 + Math.random() * 20;
}

// Various drawing modes
function drawParticles(x, y, lastX, lastY) {
    const particleCount = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * lineWidth;
        const speedX = (Math.random() - 0.5) * 8;
        const speedY = (Math.random() - 0.5) * 8;
        const lifespan = 50 + Math.random() * 100;

        shapes.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            size,
            speedX,
            speedY,
            color: selectedColor,
            lifespan,
            life: 0,
            type: 'particle'
        });
    }
}

function drawBrush(x, y, lastX, lastY) {
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = selectedColor;
    ctx.globalAlpha = 0.8;

    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawSpirals(x, y, lastX, lastY) {
    const size = lineWidth;
    shapes.push({
        x,
        y,
        size,
        angle: 0,
        growRate: 0.1 + Math.random() * 0.2,
        rotationSpeed: 0.1 + Math.random() * 0.2,
        maxSize: 100 + Math.random() * 200,
        color: selectedColor,
        lifespan: 100 + Math.random() * 200,
        life: 0,
        type: 'spiral'
    });
}

function drawStars(x, y, lastX, lastY) {
    const size = 5 + Math.random() * lineWidth;
    shapes.push({
        x,
        y,
        size,
        points: 5 + Math.floor(Math.random() * 7),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        color: selectedColor,
        lifespan: 100 + Math.random() * 100,
        life: 0,
        type: 'star'
    });
}

function drawBubbles(x, y, lastX, lastY) {
    const size = 5 + Math.random() * lineWidth;
    const speedY = -0.5 - Math.random() * 2;

    shapes.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        size,
        speedX: (Math.random() - 0.5) * 1,
        speedY,
        color: selectedColor,
        lifespan: 100 + Math.random() * 100,
        life: 0,
        type: 'bubble'
    });
}

// Animation loop
function animate() {
    // Apply fade effect if trail is enabled
    if (isTrailEnabled) {
        ctx.fillStyle = 'rgba(17, 17, 17, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Update and draw shapes
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        shape.life++;

        // Remove shapes that have reached their lifespan
        if (shape.life >= shape.lifespan) {
            shapes.splice(i, 1);
            continue;
        }

        // Calculate alpha based on life percentage
        const lifePercent = shape.life / shape.lifespan;
        const alpha = lifePercent < 0.7 ? 1 : 1 - ((lifePercent - 0.7) / 0.3);

        // Draw different shape types
        ctx.save();
        ctx.globalAlpha = alpha;

        switch (shape.type) {
            case 'particle':
                // Update position
                shape.x += shape.speedX;
                shape.y += shape.speedY;
                shape.speedY += 0.05; // Gravity

                // Draw particle
                ctx.beginPath();
                ctx.fillStyle = shape.color;
                ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'spiral':
                // Update spiral
                shape.angle += shape.rotationSpeed;
                const currentSize = Math.min(shape.maxSize, shape.size + shape.life * shape.growRate);

                // Draw spiral
                ctx.translate(shape.x, shape.y);
                ctx.rotate(shape.angle);
                ctx.beginPath();
                for (let i = 0; i < 100; i++) {
                    const radius = (i / 30) * currentSize;
                    const angle = 0.1 * i;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case 'star':
                // Update star
                shape.rotation += shape.rotationSpeed;

                // Draw star
                ctx.translate(shape.x, shape.y);
                ctx.rotate(shape.rotation);
                ctx.beginPath();

                const points = shape.points;
                const outerRadius = shape.size;
                const innerRadius = shape.size / 2;

                for (let i = 0; i < points * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI * 2 * i) / (points * 2);
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();
                ctx.fillStyle = shape.color;
                ctx.fill();
                break;

            case 'bubble':
                // Update bubble
                shape.x += shape.speedX;
                shape.y += shape.speedY;
                shape.speedX *= 0.99;

                // Draw bubble
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(
                    shape.x - shape.size / 3, shape.y - shape.size / 3, 0,
                    shape.x, shape.y, shape.size
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(0.5, shape.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

                ctx.fillStyle = gradient;
                ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.beginPath();
                ctx.arc(shape.x - shape.size / 3, shape.y - shape.size / 3, shape.size / 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    requestAnimationFrame(animate);
}

// Start animation
animate();

// Select initial active color
document.querySelector('.color-option').classList.add('active');

// Update instructions with current mode
document.querySelector('.instructions').textContent =
    `Current Mode: ${modes[currentMode].name} - Click and drag to create evolving patterns.`;