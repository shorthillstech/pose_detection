let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = 'Welcome';
let state = 'waiting';
let targetLabel;

function setup() {
    const myCanvas = createCanvas(640, 480);
    myCanvas.parent('canvasDiv');
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', gotPoses);

    let options = {
        inputs: 34,
        outputs: 3,
        task: 'classification',
        debug: true
    };
    brain = ml5.neuralNetwork(options);

    //   const modelDetails = {
    //     model: 'model/model.json',
    //     metadata: 'model/model_meta.json',
    //     weights: 'model/model.weights.bin'
    //   }
    //   brain.load(modelDetails, brainLoaded)
    //  brain.loadData('poser.json', dataReady);
}

function keyPressed() {
    if (key == 's') {
        brain.saveData();
    }
    else {
        targetLabel = key;
        console.log(targetLabel);

        setTimeout(function () {
            console.log('collecting');
            state = 'collecting';
            setTimeout(function () {
                console.log('not collecting');
                state = 'waiting';
            }, 10000);
        }, 10000);
    }
}

function modelReady() {
    console.log('PoseNet Ready');
}

function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        let inputs = [];
        if (state == 'collecting') {
            for (let i = 0; i < pose.keypoints.length; i++) {
                let x = pose.keypoints[i].position.x;
                let y = pose.keypoints[i].position.y;
                inputs.push(x);
                inputs.push(y);
            }
        }
        let target = [targetLabel];
        brain.addData(inputs, target);
    }
}

function draw() {
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height);
    if (pose) {
        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0, 0, 255);
            ellipse(x, y, 15, 15);
        }
        for (let i = 0; i < skeleton.length; i++) {
            let a = skeleton[i][0];
            let b = skeleton[i][1];
            strokeWeight(2);
            stroke(255);
            line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
    }
    pop();

    fill(100, 10, 10);
    noStroke();
    textSize(50);
    textAlign(CENTER, CENTER);
    text(poseLabel, width / 2, height / 2);
}