let gridSize = 20;
let targetCol, targetRow;
let gameWon = false;
let clickedBoxes = []; // 儲存點擊過的錯誤方框座標

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 隨機設定目標方框的位置
  targetCol = floor(random(width / gridSize));
  targetRow = floor(random(height / gridSize));
}

function draw() {
  background(255);

  let cols = ceil(width / gridSize);
  let rows = ceil(height / gridSize);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * gridSize;
      let y = j * gridSize;

      stroke(230); // 淺灰色網格線

      // 檢查是否為目標方框，如果是則設定不同的顏色
      if (i === targetCol && j === targetRow) {
        fill(0, 200, 255); // 設定目標方框為青藍色
      } else if (isBoxClicked(i, j)) {
        fill(100); // 如果是被點擊過的錯誤方框，設定為深灰色
      } else {
        noFill();
      }
      rect(x, y, gridSize, gridSize);
    }
  }

  // 取得滑鼠目前所在的格子座標
  let mCol = floor(mouseX / gridSize);
  let mRow = floor(mouseY / gridSize);

  if (mCol >= 0 && mCol < cols && mRow >= 0 && mRow < rows) {
    // 計算滑鼠格子與目標格子的距離
    let d = dist(mCol, mRow, targetCol, targetRow);
    let maxD = dist(0, 0, cols, rows); // 畫面最大可能距離

    // 越接近目標，圓越大 (最大 gridSize*0.9，最小 2)
    let circleSize = map(d, 0, 20, gridSize * 0.9, 2, true);
    // 越接近目標，顏色越紅 (從灰色變為紅色)
    let circleColor = lerpColor(color(255, 0, 0), color(200), map(d, 0, 15, 0, 1, true));

    fill(circleColor);
    noStroke();
    ellipse(mCol * gridSize + gridSize / 2, mRow * gridSize + gridSize / 2, circleSize);
  }

  // 如果遊戲成功，顯示文字說明
  if (gameWon) {
    fill(0, 180); // 半透明遮罩
    rect(0, 0, width, height);
    
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("遊戲成功！", width / 2, height / 2);
    textSize(28);
    text("點擊畫面重新開始", width / 2, height / 2 + 60);
  }
}

// 檢查特定座標是否已被點擊過
function isBoxClicked(col, row) {
  return clickedBoxes.some(box => box.col === col && box.row === row);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (gameWon) {
    // 遊戲成功後點擊畫面任何地方皆重置並重新開始
    gameWon = false;
    clickedBoxes = []; // 重置被點擊過的方框紀錄
    targetCol = floor(random(width / gridSize));
    targetRow = floor(random(height / gridSize));
    return;
  }

  let mCol = floor(mouseX / gridSize);
  let mRow = floor(mouseY / gridSize);

  if (mCol === targetCol && mRow === targetRow) {
    gameWon = true;
  } else {
    // 如果點擊的不是目標，且該位置尚未紀錄過，則加入紀錄
    if (!isBoxClicked(mCol, mRow)) {
      clickedBoxes.push({ col: mCol, row: mRow });
    }
  }
}
