/**
 * 專案名稱: 不規則曲線電流急急棒 (p5.js)
 * 核心功能: 
 * 1. 使用 curveVertex 繪製平滑的不規則軌道
 * 2. 碰撞檢測機制 (基於陣列頂點計算)
 * 3. 遊戲狀態管理 (等待、遊戲中、勝利、失敗)
 */

let pathPoints = []; // 變數管理: 儲存軌道中心點的 PVector 陣列
let pointSpacing = 50; // 點與點之間的水平距離 (密度)
let pathGap = 70; // 安全區域: 上下邊界的間隙寬度

// 遊戲狀態常數
const STATE_WAIT = 0;
const STATE_PLAYING = 1;
const STATE_GAME_OVER = 2;
const STATE_WIN = 3;

let gameState = STATE_WAIT;
let failTimer = 0; // 用於控制失敗時的紅色閃爍時間

function setup() {
  // 畫布設定: 響應式畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化遊戲與軌道
  resetGame();
  
  // 設定線條樣式
  strokeJoin(ROUND);
  strokeCap(ROUND);
}

function draw() {
  // 視覺效果: 處理失敗時的背景閃爍 (紅色警示)
  if (gameState === STATE_GAME_OVER && failTimer > 0) {
    background(200, 0, 0); // 失敗提示: 紅色背景
    failTimer--;
    if (failTimer <= 0) {
      resetGame(); // 閃爍結束後自動回到起點
    }
  } else {
    background(30); // 正常深色背景
  }

  // 繪製軌道
  drawTrack();

  // 狀態機邏輯
  if (gameState === STATE_WAIT) {
    drawStartZone();
    drawText("點擊綠色圓圈開始", width / 2, height / 2);
  } else if (gameState === STATE_PLAYING) {
    drawStartZone();
    drawEndZone();
    
    // 繪製玩家游標
    drawPlayerCursor();
    
    // 執行碰撞與勝利判定
    checkGameLogic();
  } else if (gameState === STATE_GAME_OVER) {
    drawText("GAME OVER", width / 2, height / 2);
  } else if (gameState === STATE_WIN) {
    drawTrack(); // 勝利時保持軌道顯示
    drawEndZone();
    drawText("SUCCESS! 抵達終點 (點擊重來)", width / 2, height / 2);
    
    if (mouseIsPressed) {
      resetGame();
    }
  }
}

// 軌道生成: 產生由左至右的不規則路徑數據
function generatePath() {
  pathPoints = [];
  let x = 0;
  let y = height / 2;
  
  // 使用 Perlin Noise 產生平滑但隨機的 Y 軸起伏
  let noiseOffset = random(1000);
  
  // 起點：在左側固定高度
  pathPoints.push(createVector(0, height / 2));
  
  while (x < width) {
    x += pointSpacing;
    // 計算 noise 值 (0~1) 並映射到畫布高度 20%~80% 範圍
    let n = noise(x * 0.005 + noiseOffset);
    y = map(n, 0, 1, height * 0.2, height * 0.8);
    pathPoints.push(createVector(x, y));
  }
  
  // 終點：確保延伸出畫布外
  pathPoints.push(createVector(width + pointSpacing, height / 2));
}

// 視覺效果: 繪製上下邊界 (使用 curveVertex)
function drawTrack() {
  noFill();
  strokeWeight(4);
  
  // 設定發光效果 (僅在支援的瀏覽器有效)
  drawingContext.shadowBlur = 15;

  // --- 繪製上邊界 (螢光藍) ---
  stroke(0, 240, 255);
  drawingContext.shadowColor = color(0, 240, 255);
  beginShape();
  // 技巧: 重複第一個與最後一個頂點，讓 curveVertex 曲線通過所有控制點
  if (pathPoints.length > 0) curveVertex(pathPoints[0].x, pathPoints[0].y - pathGap / 2);
  for (let p of pathPoints) {
    // 座標計算邏輯: 原始中心點 Y 減去一半間隙寬度 = 上邊界 Y
    curveVertex(p.x, p.y - pathGap / 2);
  }
  if (pathPoints.length > 0) {
     let last = pathPoints[pathPoints.length - 1];
     curveVertex(last.x, last.y - pathGap / 2);
  }
  endShape();

  // --- 繪製下邊界 (閃電黃) ---
  stroke(255, 220, 0);
  drawingContext.shadowColor = color(255, 220, 0);
  beginShape();
  if (pathPoints.length > 0) curveVertex(pathPoints[0].x, pathPoints[0].y + pathGap / 2);
  for (let p of pathPoints) {
    // 座標計算邏輯: 原始中心點 Y 加上一半間隙寬度 = 下邊界 Y
    curveVertex(p.x, p.y + pathGap / 2);
  }
  if (pathPoints.length > 0) {
    let last = pathPoints[pathPoints.length - 1];
    curveVertex(last.x, last.y + pathGap / 2);
  }
  endShape();

  // 重置陰影
  drawingContext.shadowBlur = 0;
}

// 互動邏輯: 啟動開關與起點
function drawStartZone() {
  let startP = pathPoints[0];
  if (!startP) return;

  noStroke();
  fill(0, 255, 0);
  circle(startP.x + 40, startP.y, 40); // 起始圓圈
  
  if (gameState === STATE_WAIT) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("START", startP.x + 40, startP.y);
    
    // 點擊判定
    if (mouseIsPressed && dist(mouseX, mouseY, startP.x + 40, startP.y) < 20) {
      gameState = STATE_PLAYING;
    }
  }
}

function drawEndZone() {
  noStroke();
  fill(0, 255, 0, 50);
  rect(width - 60, 0, 60, height);
  fill(255);
  textAlign(CENTER, CENTER);
  text("FINISH", width - 30, height / 2);
}

function drawPlayerCursor() {
  noCursor(); // 隱藏系統滑鼠
  fill(255);
  noStroke();
  circle(mouseX, mouseY, 10); // 繪製白色光點
}

// 核心: 碰撞判定邏輯
function checkGameLogic() {
  // 1. 勝利條件: 到達最右側
  if (mouseX > width - 60) {
    gameState = STATE_WIN;
    cursor();
    return;
  }

  // 2. 找出滑鼠位於哪一段軌道 (使用 X 軸區間搜尋)
  let idx = -1;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    if (mouseX >= pathPoints[i].x && mouseX < pathPoints[i + 1].x) {
      idx = i;
      break;
    }
  }

  if (idx !== -1) {
    let p1 = pathPoints[idx];
    let p2 = pathPoints[idx + 1];

    // 計算滑鼠在該區段的進度比例 (0.0 ~ 1.0)
    let t = (mouseX - p1.x) / (p2.x - p1.x);

    // 使用線性插值計算當前 X 位置對應的中心 Y 座標
    // 註: 由於 curveVertex 與線性插值有微小誤差，這裡將碰撞範圍稍微內縮 (-5) 以提升體驗
    let currentCenterY = lerp(p1.y, p2.y, t);
    let safeTop = currentCenterY - pathGap / 2 + 5;
    let safeBottom = currentCenterY + pathGap / 2 - 5;

    // 碰撞判定: 觸碰或越過邊界
    if (mouseY < safeTop || mouseY > safeBottom) {
      triggerFail();
    }
  } else {
    // 如果在畫面最左側之外 (還沒進入第一段)，不計算碰撞
    if (mouseX > 0 && mouseX < pathPoints[0].x) {
       // 安全
    }
  }
}

function triggerFail() {
  gameState = STATE_GAME_OVER;
  failTimer = 10; // 設定閃爍持續時間
  cursor();
}

function resetGame() {
  gameState = STATE_WAIT;
  generatePath(); // 每次重來生成新路徑
}

function drawText(msg, x, y) {
  fill(255);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text(msg, x, y);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetGame();
}