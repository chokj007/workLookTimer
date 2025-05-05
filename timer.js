let poses = [];
let particles = [];
let bodyRadius = 200;
let bodyPoints = [];
let noiseOffset = 0;
// let maxParticles = 8000;
let timerDuration;
let countdown;
let endMessages = ["Break time!", "Take a break", "Snack time???", "Go for a stroll", "Fresh air perhaps?", "Stretch it out!", "Coffee time", "Step away for a sec!","Hydration break!", "Power-down moment...", "Can I interest you in a dance break?", "Time to recharge"];
let timerElement, restartButton;
let video, canvas;
let timerEnded = false;
let margin = 48; // 0.5 inch margin (approx. 48px)
let allowParticles = true;

let lastParticleTime = 0;
let particleSpawnInterval = 1000; //  between each attract call

let particleColor = 'black';


function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.hide(); 
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', results => poses = results);

    timerElement = select("#timer");
    restartButton = select("#restart");

    timerDuration = localStorage.getItem("timerDuration") * 60 || 900; // Default 15 min
    countdown = timerDuration;

    // setInterval(() => {
    //     if (countdown > 0) {
    //         countdown--;
    //         timerElement.html(formatTime(countdown));
    //     } else if (!timerEnded) {
    //         showEndMessage();
    //         timerEnded = true;
    //     }
    // }, 1000);

    document.getElementById("black-btn").addEventListener("click", () => {
        particleColor = 'black';
    });
    
    document.getElementById("white-btn").addEventListener("click", () => {
        particleColor = 'white';
    });
    


    playTimer();
}

function modelLoaded() {
    // console.log("PoseNet model loaded");
}

function draw() {
    background(255);

   
    let availableWidth = width - 2 * margin;
    let availableHeight = height - 2 * margin;
    let videoAspect = video.width / video.height;
    let canvasAspect = availableWidth / availableHeight;

    let drawWidth, drawHeight;
    if (videoAspect > canvasAspect) {
        drawWidth = availableWidth;
        drawHeight = availableWidth / videoAspect;
    } else {
        drawHeight = availableHeight;
        drawWidth = availableHeight * videoAspect;
    }

    let drawX = (width - drawWidth) / 2;
    let drawY = (height - drawHeight) / 2;


    push();
    translate(drawX + drawWidth, drawY);
    scale(-1, 1);
    image(video, 0, 0, drawWidth, drawHeight);
    pop();

    if (poses.length > 0 && allowParticles && !timerEnded) {
        let pose = poses[0].pose;
        let scaleX = drawWidth / video.width;
        let scaleY = drawHeight / video.height;

        let noseX = width - (pose.nose.x * scaleX + drawX); // Mirror X
        let noseY = pose.nose.y * scaleY + drawY;

        // // Particle generation around the face
        // if (!timerEnded) {
            // attractParticlesAroundFace(noseX, noseY);

            if (millis() - lastParticleTime > particleSpawnInterval) {
                attractParticlesAroundFace(noseX, noseY);
                lastParticleTime = millis();
            }
            
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].display();
    }

    if (particles.length > 10000) {
        particles.splice(0, particles.length - 3000); // Keep only last 10,000
    }
    

    noiseOffset += 0.005;

    
}

function attractParticlesAroundFace(centerX, centerY) {
    // Starts at 1 particle/frame -> increases up to 10 as time counts down
    let spawnRate = map(countdown, timerDuration, 0, 1, 10);
    spawnRate = pow(spawnRate, 1.5); // Exponential increase

    let particlesToSpawn = floor(spawnRate); 

    for (let i = 0; i < particlesToSpawn; i++) {
        let angle = random(TWO_PI);
        let radius = random(bodyRadius); // Random radius within face
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;

        particles.push(new Particle(x, y)); // Always push new particles
    }
}


// function attractParticlesConstant() {
//     if (particles.length >= maxParticles) return;

//     let spawnRate = map(countdown, timerDuration, 0, 1, 10);
//     let particlesToSpawn = floor(spawnRate);

//     for (let s = 0; s < particlesToSpawn; s++) {
//         let index = floor(random(bodyPoints.length));
//         if (particles.length < maxParticles) {
//             let p = new Particle(bodyPoints[index].x, bodyPoints[index].y);
//             particles.push(p);
//         }
//     }
// }

function showEndMessage() {
    timerElement.html(random(endMessages));
    restartButton.style("display", "block");

    // Play sound
    let sound = document.getElementById("sound");
    if (sound) {
    sound.currentTime = 0;
    sound.play();
     }

}

function restart() {
    localStorage.removeItem("timerDuration");
    window.location.href = "index.html";
}

function toggleFullscreen() {
    let fs = fullscreen();
    fullscreen(!fs);
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseSize = 5;
        this.maxSize = 50;
        this.size = this.baseSize;
    }

    update() {
        this.size = map(countdown, timerDuration, 0, this.baseSize, this.maxSize);
    }

    display() {
        noStroke();
        fill(particleColor === 'black' ? color(50, 100) : color(255, 255, 255, 180));
        ellipse(this.x, this.y, this.size, this.size);
    }
    

}

function formatTime(seconds) {
    let min = floor(seconds / 60);
    let sec = seconds % 60;
    return nf(min, 2) + ":" + nf(sec, 2);
}


//Home controls

let timerInterval;
let isPaused = false;

function playTimer() {
    if (!timerInterval && countdown > 0) {
        timerInterval = setInterval(updateTimer, 1000);
        isPaused = false;
        allowParticles = true;
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = true;
    allowParticles = false;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    countdown = timerDuration;
    timerElement.html(formatTime(countdown));
    isPaused = false;
    timerEnded = false;
    allowParticles = false;
    restartButton.style("display", "none");
    particles = []; 
}


function updateTimer() {
    if (countdown > 0) {
        countdown--;
        timerElement.html(formatTime(countdown));
    } else if (!timerEnded) {
        showEndMessage();
        timerEnded = true;
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function goHome() {
    window.location.href = "index.html"; 
}

