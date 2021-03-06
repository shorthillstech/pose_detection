let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = 'Welcome';

function start () {
  document.getElementById("showDiv").style.display = "block";
  document.getElementById("header").style.display = "block";
  document.getElementById("homePageDiv").style.display = "none";
}

function setup() {
  var myCanvas;
  console.log(screen.width)
  if(screen.width < 440){
    myCanvas = createCanvas(240, 280);
  }
  else if(screen.width < 650 && screen.width > 440){
    myCanvas = createCanvas(440, 380);
  }
  else {
    myCanvas = createCanvas(640, 480);
  }
  myCanvas.parent('canvasDiv');
  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
  let options = {
    inputs:34,
    outputs:3,
    task:'classification',
    debug:true
  };
  brain = ml5.neuralNetwork(options);
  const modelDetails = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
  }
  brain.load(modelDetails, brainLoaded)
  // brain.loadData('poser.json', dataReady);
}


function brainLoaded(){
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose(){
  if(pose){
    let inputs = [];
    for(let i=0;i<pose.keypoints.length;i++){
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  }
  else{
    setTimeout(classifyPose,100);
  }
}

function gotResult(error,results){
  console.log(results);
  if(results[0].confidence > 0.75){
  if(results[0].label=='c'){
    poseLabel = 'Namaste';
    
  }
  else if(results[0].label=='d'){
    poseLabel = 'Salute';
  }
  else if(results[0].label=='e'){
    poseLabel = 'Hands Up';
  }
  else{
    poseLabel = 'Try a Pose';
  }}
  document.getElementById("yourPose").innerHTML = poseLabel;
  console.log(results[0].label);
  classifyPose();
}


function gotPoses(poses){
  if(poses.length>0){
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelReady(){
  console.log('PoseNet Ready');
}

function draw() {
  push();
  translate(video.width,0);
  scale(-1,1);
  image(video,0,0,video.width,video.height);
  if(pose){
    for(let i=0;i<pose.keypoints.length;i++){
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0,0,255);
      ellipse(x,y,15,15);
    }
    for(let i=0;i<skeleton.length;i++){
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(255);
      line(a.position.x,a.position.y,b.position.x,b.position.y);
    }
  }
  pop();
  
  // fill(100,10,10);
  // noStroke();
  // textSize(50);
  // textAlign(CENTER,CENTER);
  // text(poseLabel,width/2,height/2);
}