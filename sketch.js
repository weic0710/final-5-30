let video;
let handposeModel;
let predictions = [];
let question = "2 + 2 = ?";
let options = ["3", "4", "5"];
let correctIndex = 1;
let optionBoxes = [];
let resultMsg = "";

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handposeModel = ml5.handpose(video, modelReady);
  handposeModel.on("predict", (results) => {
    predictions = results;
  });

  // 計算選項方框位置
  let boxW = 200,
    boxH = 80;
  let startY = height / 2;
  let gap = 40;
  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - boxW / 2;
    let y = startY + i * (boxH + gap);
    optionBoxes.push({ x, y, w: boxW, h: boxH });
  }
}

function modelReady() {
  // 模型載入完成，可在此顯示提示或執行其他動作
}

function draw() {
  background(220);
  // 顯示攝影機畫面
  push();
  translate(width, 0);
  scale(-1, 1); // 鏡像
  image(video, 0, 0, width, height);
  pop();

  // 顯示問題
  fill(0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text(question, width / 2, height / 4);

  // 顯示選項
  textSize(32);
  for (let i = 0; i < options.length; i++) {
    let box = optionBoxes[i];
    fill(255, 200);
    stroke(0);
    rect(box.x, box.y, box.w, box.h, 20);
    fill(0);
    text(options[i], box.x + box.w / 2, box.y + box.h / 2);
  }

  // 顯示手指座標
  if (predictions.length > 0) {
    let hand = predictions[0];
    let tip = hand.landmarks[8]; // 食指指尖
    let px = width - tip[0] * (width / video.width); // 鏡像修正
    let py = tip[1] * (height / video.height);
    fill(255, 0, 0);
    noStroke();
    ellipse(px, py, 30, 30);

    // 檢查是否點擊選項
    for (let i = 0; i < optionBoxes.length; i++) {
      let box = optionBoxes[i];
      if (
        px > box.x &&
        px < box.x + box.w &&
        py > box.y &&
        py < box.y + box.h
      ) {
        if (mouseIsPressed) {
          // 用滑鼠模擬點擊
          if (i === correctIndex) {
            resultMsg = "答對了！";
          } else {
            resultMsg = "答錯了！";
          }
        }
      }
    }
  }

  // 顯示結果訊息
  if (resultMsg) {
    fill(0, 200, 0);
    textSize(48);
    text(resultMsg, width / 2, height - 100);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新計算選項方框位置
  optionBoxes = [];
  let boxW = 200,
    boxH = 80;
  let startY = height / 2;
  let gap = 40;
  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - boxW / 2;
    let y = startY + i * (boxH + gap);
    optionBoxes.push({ x, y, w: boxW, h: boxH });
  }
}
