/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

let shapes = [];
let bubbles = [];
let song;
let amplitude;
let points = [[-3, -5], [3, -7], [1, -5], [2, -4], [4, -3], [5, -2], [6, -2], [8, -4], [8, 1], [6, 0], [0, 3], [2, 6], [-2, 3], [-4, 2], [-5, 1], [-6, -1], [-6, -2]];

function preload() {
  // 在程式開始前預載入外部音樂資源
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布、音樂播放狀態與生成多邊形物件
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    // 透過 map() 讀取全域陣列 points，將每個頂點的 x 與 y 分別乘上 10 到 30 之間的隨機倍率來產生變形
    let shapePoints = points.map(p => {
      return [p[0] * random(10, 30), p[1] * random(10, 30)];
    });

    shapes.push({
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: shapePoints
    });
  }
}

function draw() {
  // 每幀重複執行，處理背景更新、抓取音量與繪製動態圖形
  background('#ffcdb2');

  // 產生與繪製水泡
  if (random(1) < 0.05) {
    bubbles.push(new Bubble(random(width), height));
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].move();
    bubbles[i].show();
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }

  strokeWeight(2);

  // 透過 amplitude.getLevel() 取得當前音量大小
  let level = amplitude.getLevel();
  // 使用 map() 函式將 level 從 (0, 1) 的範圍映射到 (0.5, 2) 的範圍
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 走訪 shapes 陣列中的每個 shape 進行更新與繪製
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y);
    
    if (shape.dx > 0) {
      scale(-sizeFactor, sizeFactor); // 往右移動時，水平翻轉
    } else {
      scale(sizeFactor, sizeFactor);  // 往左移動時，維持原狀
    }

    // 繪製多邊形
    beginShape();
    for (let p of shape.points) {
      vertex(p[0], p[1]);
    }
    endShape(CLOSE);

    // 狀態還原
    pop();
  }
}

function mousePressed() {
  // 處理瀏覽器自動播放限制，點擊畫面開始或暫停音樂
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(10, 20);
    this.speed = random(1, 3);
    this.popY = random(0, height / 2); // 水泡破掉的高度
    this.popped = false;
    this.popTimer = 10; // 破掉效果持續時間
  }

  move() {
    if (!this.popped) {
      this.y -= this.speed;
      if (this.y < this.popY) {
        this.popped = true;
      }
    }
  }

  show() {
    if (this.popped) {
      if (this.popTimer > 0) {
        noFill();
        stroke(255, map(this.popTimer, 0, 10, 0, 255));
        strokeWeight(2);
        ellipse(this.x, this.y, this.size * 1.5);
        this.popTimer--;
      }
    } else {
      noFill();
      stroke(255, 150);
      strokeWeight(1);
      ellipse(this.x, this.y, this.size);
      
      noStroke();
      fill(255, 150);
      ellipse(this.x + this.size * 0.2, this.y - this.size * 0.2, this.size * 0.2);
    }
  }

  isFinished() {
    return this.popped && this.popTimer <= 0;
  }
}
