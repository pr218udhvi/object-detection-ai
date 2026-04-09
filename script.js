const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const descriptionBox = document.getElementById('descriptionBox');

let model;

// Start Camera
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });
    video.srcObject = stream;

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

// Generate Text Description
function generateDescription(predictions) {
    let objects = {};

    predictions.forEach(p => {
        if (p.score > 0.6) {
            objects[p.class] = (objects[p.class] || 0) + 1;
        }
    });

    let keys = Object.keys(objects);

    if (keys.length === 0) {
        return "I can't see anything clearly.";
    }

    if (objects["person"] && objects["cell phone"]) {
        return "A person is using a mobile phone.";
    }

    if (objects["person"] && objects["laptop"]) {
        return "A person is working on a laptop.";
    }

    let text = keys.map(k => 
        objects[k] > 1 ? `${objects[k]} ${k}s` : `a ${k}`
    );

    return "I can see " + text.join(", ");
}

// Detect Objects
async function detectObjects() {
    const predictions = await model.detect(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Label
        ctx.fillStyle = "lime";
        ctx.fillRect(x, y - 20, 100, 20);

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(prediction.class, x + 5, y - 5);
    });

    // 👇 TEXT OUTPUT
    const description = generateDescription(predictions);
    descriptionBox.innerText = description;

    requestAnimationFrame(detectObjects);
}

// Main Function
async function main() {
    model = await cocoSsd.load();
    await setupCamera();

    video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    detectObjects();
}

main();
