let video;
let handpose;
let predictions = [];
let options = [
  { text: "1997", x: 465, y: 130, width: 120, height: 60 },
  { text: "1998", x: 665, y: 130, width: 120, height: 60 },
  { text: "1999", x: 865, y: 130, width: 120, height: 60 }
];
let draggingOption = null;
let feedback = ""; // 用於顯示答題結果
let showNextButton = false; // 控制是否顯示下一題按鈕
let currentQuestion = 1; // 當前題目編號

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480); // 保持鏡頭大小及比例
  video.style('transform', 'scale(-1, 1)'); // 水平翻轉鏡頭
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  background(240);
  const scaleFactor = 1.2; // 放大比例
  const videoWidth = video.width * scaleFactor;
  const videoHeight = video.height * scaleFactor;
  const xOffset = (width - videoWidth) / 2;
  const yOffset = (height - videoHeight) / 2;

  push();
  translate(width, 0); // 翻轉畫布
  scale(-1, 1); // 水平翻轉
  image(video, width - xOffset - videoWidth, yOffset, videoWidth, videoHeight);
  pop();

  drawKeypoints();
  drawQuestion();
  drawOptions();
  drawAnswerArea(videoWidth, videoHeight, xOffset, yOffset);
  handleDragging();
  drawFeedback();
  if (showNextButton) {
    drawNextButton();
  }
}

function drawQuestion() {
  const cardWidth = 450;
  const cardHeight = 100;
  const cardX = (width - cardWidth) / 2;
  const cardY = 20;

  push();
  fill(255);
  stroke(100);
  strokeWeight(3);
  rect(cardX, cardY, cardWidth, cardHeight, 15); // 圓角矩形

  textAlign(CENTER, CENTER);
  textSize(26);
  fill(50);
  const questionText = currentQuestion === 1 
    ? "請問教科系於西元幾年創立?" 
    : currentQuestion === 2 
    ? "下列哪項為教科系大一的課程?" 
    : "請問下列哪個是教科系的英文縮寫?";
  text(questionText, cardX + cardWidth / 2, cardY + cardHeight / 2);
  pop();
}

function drawOptions() {
  for (let option of options) {
    push();
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(option.x, option.y, option.width, option.height, 10); // 圓角矩形

    textAlign(CENTER, CENTER);
    textSize(20);
    fill(50);
    text(option.text, option.x + option.width / 2, option.y + option.height / 2);
    pop();
  }
}

function drawAnswerArea(videoWidth, videoHeight, xOffset, yOffset) {
  const answerAreaWidth = 150;
  const answerAreaHeight = 100;
  const answerAreaX = width - xOffset - answerAreaWidth - 20; // 視訊右下角
  const answerAreaY = yOffset + videoHeight - answerAreaHeight - 20;

  push();
  noFill(); // 內部透明
  stroke(100);
  strokeWeight(3);
  rect(answerAreaX, answerAreaY, answerAreaWidth, answerAreaHeight, 15); // 圓角矩形

  textAlign(CENTER, CENTER);
  textSize(18);
  fill(50);
  text("答題欄", answerAreaX + answerAreaWidth / 2, answerAreaY + answerAreaHeight / 2);
  pop();

  // 檢查選項是否進入答題欄
  for (let option of options) {
    if (
      option.x + option.width / 2 > answerAreaX &&
      option.x + option.width / 2 < answerAreaX + answerAreaWidth &&
      option.y + option.height / 2 > answerAreaY &&
      option.y + option.height / 2 < answerAreaY + answerAreaHeight
    ) {
      feedback = currentQuestion === 1 
        ? (option.text === "1997" ? "正確" : "錯誤") 
        : currentQuestion === 2 
        ? (option.text === "程式設計" ? "正確" : "錯誤") 
        : (option.text === "TKUET" ? "正確" : "錯誤"); // 設定正確答案
      showNextButton = true; // 顯示下一題按鈕
    }
  }
}

function handleDragging() {
  if (predictions.length > 0) {
    const scaleFactor = 1.2; // 放大比例
    const videoWidth = video.width * scaleFactor;
    const videoHeight = video.height * scaleFactor;
    const xOffset = (width - videoWidth) / 2;
    const yOffset = (height - videoHeight) / 2;

    const indexTip = predictions[0].landmarks[8]; // 食指末端

    const indexX = width - (indexTip[0] * scaleFactor + xOffset); // 修正水平翻轉
    const indexY = indexTip[1] * scaleFactor + yOffset;

    if (!draggingOption) {
      for (let option of options) {
        if (
          indexX > option.x &&
          indexX < option.x + option.width &&
          indexY > option.y &&
          indexY < option.y + option.height
        ) {
          draggingOption = option;
          break;
        }
      }
    }

    if (draggingOption) {
      draggingOption.x = indexX - draggingOption.width / 2;
      draggingOption.y = indexY - draggingOption.height / 2;
    }
  } else {
    draggingOption = null;
  }
}

function drawKeypoints() {
  const scaleFactor = 1.2; // 放大比例
  const videoWidth = video.width * scaleFactor;
  const videoHeight = video.height * scaleFactor;
  const xOffset = (width - videoWidth) / 2;
  const yOffset = (height - videoHeight) / 2;

  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    const indexTip = prediction.landmarks[8]; // 食指末端

    const [x, y, z] = indexTip;
    const adjustedX = width - (x * scaleFactor + xOffset); // 修正水平翻轉
    const adjustedY = y * scaleFactor + yOffset;
    fill(0, 255, 0);
    noStroke();
    ellipse(adjustedX, adjustedY, 10, 10);
  }
}

function drawFeedback() {
  const cardWidth = 350;
  const cardHeight = 80;
  const cardX = (width - cardWidth) / 2;
  const cardY = height - 120;

  push();
  fill(255);
  stroke(100);
  strokeWeight(3);
  rect(cardX, cardY, cardWidth, cardHeight, 15); // 圓角矩形

  textAlign(CENTER, CENTER);
  textSize(24);
  fill(50);
  text(feedback, cardX + cardWidth / 2, cardY + cardHeight / 2);
  pop();
}

function drawNextButton() {
  const buttonWidth = 180;
  const buttonHeight = 60;
  const buttonX = 30; // 鏡頭左下角
  const buttonY = height - 90;

  push();
  fill(0, 122, 204);
  stroke(50);
  strokeWeight(3);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 15); // 圓角矩形

  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255);
  text("下一題", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
  pop();

  // 檢查是否點擊按鈕
  if (mouseIsPressed && mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
    nextQuestion();
  }
}

function nextQuestion() {
  feedback = ""; // 清除答題結果
  showNextButton = false; // 隱藏下一題按鈕
  currentQuestion++; // 切換到下一題
  options = currentQuestion === 2 
    ? [
        { text: "行銷管理", x: 465, y: 130, width: 120, height: 60 },
        { text: "社會未來", x: 665, y: 130, width: 120, height: 60 },
        { text: "程式設計", x: 865, y: 130, width: 120, height: 60 }
      ] 
    : [
        { text: "TKUEE", x: 465, y: 130, width: 120, height: 60 },
        { text: "TKUET", x: 665, y: 130, width: 120, height: 60 },
        { text: "TKUIB", x: 865, y: 130, width: 120, height: 60 }
      ]; // 更新選項為下一題
}
