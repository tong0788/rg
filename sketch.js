// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circles = []; // 圓圈資料
let circleRadius = 109; // 圓的半徑
let currentQuestion = null; // 當前顯示的題目
let currentIndex = 0; // 當前題目的索引
let showResult = false; // 是否顯示結果
let resultMessage = ""; // 結果訊息
let resultTimer = 0; // 結果顯示的計時器
let score = 0; // 總分
let startTime = 0; // 計時開始時間
let gameStarted = false; // 遊戲是否開始
let gameEnded = false; // 遊戲是否結束
let startButton; // 開始按鈕
let questionX, questionY; // 題目位置

// 題目資料
const questions = [
  {
    number: 1,
    text: "教育科技在未來十年最有可能改變哪一項教學元素？",
    options: ["A. 學科內容本身", "B. 教師的角色與教學方式", "C. 教室的地板設計"],
    answer: "B"
  },
  {
    number: 2,
    text: "下列哪一項是虛擬實境（VR）與擴增實境（AR）在教育現場應用時常見的挑戰？",
    options: ["A. 學生對科技失去興趣", "B. 教材難以轉換為科技內容", "C. 設備與技術成本高"],
    answer: "C"
  },
  {
    number: 3,
    text: "數位落差對學生有什麼主要影響？",
    options: ["A. 提高成績一致性", "B. 強化群體合作能力", "C. 造成學習機會與成果的不平等"],
    answer: "C"
  },
  {
    number: 4,
    text: "人工智慧在教育中的一項潛在貢獻是什麼？",
    options: ["A. 自動安排課堂座位", "B. 提供個別化的學習路徑", "C. 取代學校行政人員"],
    answer: "B"
  },
  {
    number: 5,
    text: "關於線上學習平台（如 Coursera、edX），下列何者為其可能的正向影響？",
    options: ["A. 增加學生分心機率", "B. 降低教學內容的深度", "C. 提供更多元且彈性的學習機會"],
    answer: "C"
  },
  {
    number: 6,
    text: "遊戲化學習最主要的優點是什麼？",
    options: ["A. 讓學生輕鬆獲得分數", "B. 提升學生的學習動機與參與感", "C. 減少老師的工作量"],
    answer: "B"
  },
  {
    number: 7,
    text: "為了提升教科系學生的職場競爭力，下列何者最為重要？",
    options: ["A. 熟悉紙本教材編輯", "B. 具備跨領域能力，如程式設計與設計思維", "C. 專注於單一教育理論的研究"],
    answer: "B"
  },
  {
    number: 8,
    text: "在數位學習的時代，教師與教育科技專業人員之間應如何互動？",
    options: ["A. 教師應完全交由科技人員負責教學內容", "B. 教師與科技人員應建立合作關係並共同設計學習資源", "C. 教師可忽略科技發展，專注於教學經驗"],
    answer: "B"
  }
];

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓圈資料
  for (let i = 0; i < questions.length; i++) {
    circles.push({
      x: random(100, width - 100),
      y: random(100, height - 100),
      number: questions[i].number,
      question: questions[i]
    });
  }

  // 隨機生成題目位置
  questionX = constrain(random(50, width - 400), 50, width - 400);
  questionY = constrain(random(50, height - 200), 50, height - 200);

  handPose.detectStart(video, gotHands);

  // 建立開始按鈕
  if (!startButton) {
    startButton = createButton("START");
    startButton.position(width / 2 - 40, height / 2 - 20);
    startButton.size(80, 40);
    startButton.style("background-color", "#A6E1FA");
    startButton.style("color", "#001C55");
    startButton.style("font-family", "新細明體");
    startButton.style("font-size", "18px");
    startButton.style("border", "none");
    startButton.style("cursor", "pointer");

    startButton.mousePressed(() => {
      gameStarted = true;
      startTime = millis();
      currentQuestion = questions[currentIndex];
      startButton.hide(); // 隱藏按鈕
    });
  }
}

function draw() {
  image(video, 0, 0);

  // 如果遊戲尚未開始，顯示開始畫面
  if (!gameStarted) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("請按下按鈕開始遊戲", width / 2, height / 2 - 50);

    // 繪製按鈕
    fill("#A6E1FA");
    rect(width / 2 - 40, height / 2 - 20, 80, 40, 10);
    fill("#001C55");
    textSize(18);
    text("START", width / 2, height / 2 + 5);
    return; // 遊戲未開始時，直接返回
  }

  // 如果遊戲結束，顯示結束畫面
  if (gameEnded) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    let totalTime = ((millis() - startTime) / 1000).toFixed(2);
    text(`遊戲結束！總分：${score} 分`, width / 2, height / 2 - 20);
    text(`完成時間：${totalTime} 秒`, width / 2, height / 2 + 20);

    // 顯示重新開始按鈕
    let restartButton = createButton("重新開始");
    restartButton.position(width / 2 - 40, height / 2 + 60);
    restartButton.size(100, 40);
    restartButton.style("background-color", "#A6E1FA");
    restartButton.style("color", "#001C55");
    restartButton.style("font-family", "新細明體");
    restartButton.style("font-size", "18px");
    restartButton.style("border", "none");
    restartButton.style("cursor", "pointer");

    restartButton.mousePressed(() => {
      location.reload(); // 重新載入頁面
    });
    return;
  }

  // 顯示計時器
  fill(255);
  textSize(20);
  textAlign(RIGHT, TOP);
  let elapsedTime = millis() - startTime;
  let minutes = floor(elapsedTime / 60000);
  let seconds = ((elapsedTime % 60000) / 1000).toFixed(2);
  text(`時間：${minutes}:${seconds < 10 ? "0" : ""}${seconds}`, width - 10, 10);

  // 繪製圓圈和數字
  for (let circle of circles) {
    fill(0, 0, 255, 150); // 半透明藍色
    noStroke();
    ellipse(circle.x, circle.y, circleRadius); // 修正為 ellipse

    fill(255); // 白色文字
    textAlign(CENTER, CENTER);
    textSize(32);
    text(circle.number, circle.x, circle.y);
  }

  // 顯示當前題目
  if (currentQuestion && !showResult) {
    fill(0);
    textSize(20);
    textAlign(LEFT, TOP);
    text(currentQuestion.text, questionX, questionY);

    // 顯示選項
    for (let i = 0; i < currentQuestion.options.length; i++) {
      text(`${String.fromCharCode(65 + i)}. ${currentQuestion.options[i]}`, questionX, questionY + 30 + i * 30);
    }
  }

  // 顯示結果
  if (showResult) {
    fill(resultMessage === "正確！" ? "green" : "red"); // 顯示綠色或紅色
    textSize(32);
    textAlign(CENTER, CENTER);
    text(resultMessage, width / 2, height / 2);

    // 計時器結束後切換到下一題
    if (millis() - resultTimer > 2000) {
      showResult = false;
      currentIndex++;
      if (currentIndex < questions.length) {
        currentQuestion = questions[currentIndex];
        questionX = constrain(random(50, width - 400), 50, width - 400); // 更新題目位置
        questionY = constrain(random(50, height - 200), 50, height - 200);
      } else {
        gameEnded = true; // 遊戲結束
      }
    }
  }

  // 確保至少有一隻手被偵測到
  if (hands.length > 0 && !showResult) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        let indexFinger = hand.annotations.indexFinger[3]; // 食指尖端的座標

        // 檢查食指是否碰觸圓圈
        for (let circle of circles) {
          let d = dist(indexFinger[0], indexFinger[1], circle.x, circle.y);
          if (d < circleRadius / 2) {
            // 檢查答案是否正確
            if (circle.question.answer === currentQuestion.answer) {
              resultMessage = "正確！";
              score += 12.5; // 加分
            } else {
              resultMessage = "錯誤！";
            }
            showResult = true;
            resultTimer = millis();
          }
        }
      }
    }
  }
}
