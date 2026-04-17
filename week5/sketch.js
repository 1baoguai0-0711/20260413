// 定義水草陣列與顏色盤
let grasses = [];
let bubbles = [];
let palette = ['#132a13', '#31572c', '#4f772d', '#90a955', '#ecf39e'];

function setup() {
  // 建立 iframe 嵌入網頁
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'absolute');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.style('z-index', '-1'); // 確保 iframe 在背景

  // 建立全螢幕畫布
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'fixed'); // 固定畫布位置
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布，以便操作 iframe
  noStroke(); // 去除邊框
  
  // 產生 50 根水草的資料
  for (let i = 0; i < 50; i++) {
    grasses.push({
      x: random(width),              // 允許位置重疊
      grassHeight: random(height * 0.2, height * 2 / 3), // 水草高度
      grassWidth: random(15, 30),            // 水草粗細
      grassColor: random(palette),           // 水草顏色
      swayOffset: random(1000),              // 隨機擺動偏移量 (起始相位)
      swayFreq: random(0.005, 0.02)          // 搖晃的頻率
    });
  }
}

function draw() {
  clear(); // 每幀開始前先清除畫布，避免半透明背景疊加導致變為不透明
  // 設定背景顏色
  background(142, 202, 230, 51); // 背景透明度 0.2 (51/255)，#8ecae6 RGB 為 142,202,230
  
  blendMode(BLEND); // 設定混合模式，讓透明度重疊效果更自然
  
  // 迴圈繪製每一根水草
  for (let g of grasses) {
    let c = color(g.grassColor); // 轉換顏色格式以設定透明度
    c.setAlpha(120); // 加入透明效果 (0-255)
    fill(c); // 設定該根水草的顏色
    drawSeaweed(g.x, height, g.grassHeight, g.grassWidth, g.swayOffset, g.swayFreq);
  }
  
  // 產生與繪製氣泡
  if (random() < 0.03) { // 每一幀有 3% 機率產生氣泡
    bubbles.push(new Bubble());
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }
}

// 繪製水草的自訂函式
function drawSeaweed(xBase, yBase, totalHeight, baseWidth, noiseOffset, swayFreq) {
  let segments = 50; // 將水草切分為多少段 (越多越平滑)
  let time = frameCount * swayFreq; // 使用獨立的頻率變數，控制搖晃快慢
  
  beginShape();
  
  // 起始控制點 (底部左側)，確保曲線從正確位置開始
  curveVertex(xBase - baseWidth, yBase);
  
  // 1. 繪製左側邊緣 (從底部往上長)
  for (let i = 0; i <= segments; i++) {
    // 計算當前段落的高度比例 (0.0 到 1.0)
    let t = i / segments; 
    
    // 計算 Y 座標 (由下往上)
    let y = yBase - (totalHeight * t);
    
    // 利用 Perlin Noise 產生擺動值
    // noise(時間, 垂直位置係數) 
    // 加入 noiseOffset 讓每根水草擺動不同
    let noiseVal = noise(time + noiseOffset, i * 0.1); 
    
    // 利用 map 將 noise (0~1) 映射到擺動範圍 (-60~60)
    // 這裡乘以 t 是為了讓根部 (t=0) 不動，頂部 (t=1) 擺動最大
    let xOffset = map(noiseVal, 0, 1, -40, 40) * t; // 改直一點，減少搖晃幅度
    
    // 計算隨高度變窄的寬度 (頂端變尖)
    let currentWidth = map(t, 0, 1, baseWidth, 0);
    
    // 產生頂點 (中心點 + 擺動 - 寬度的一半)
    curveVertex(xBase + xOffset - currentWidth, y);
  }
  
  // 2. 繪製右側邊緣 (從頂部往下回到底部，以形成封閉圖形)
  for (let i = segments; i >= 0; i--) {
    let t = i / segments;
    let y = yBase - (totalHeight * t);
    
    let noiseVal = noise(time + noiseOffset, i * 0.1);
    let xOffset = map(noiseVal, 0, 1, -40, 40) * t; // 改直一點，減少搖晃幅度
    let currentWidth = map(t, 0, 1, baseWidth, 0);
    
    // 右側頂點 (中心點 + 擺動 + 寬度的一半)
    curveVertex(xBase + xOffset + currentWidth, y);
  }
  
  // 結束控制點 (底部右側)，確保曲線在底部穩定結束
  curveVertex(xBase + baseWidth, yBase);
  
  endShape(CLOSE); // 結束並封閉圖形
}

// 當視窗大小改變時，調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 氣泡類別
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 10;
    this.size = random(5, 15);
    this.speed = random(1, 3);
    this.maxHeight = random(height * 0.2, height * 0.7); // 氣泡上升的極限高度，到達此處會破掉
    this.popping = false;
    this.alpha = 255;
  }

  update() {
    if (!this.popping) {
      this.y -= this.speed; // 上升
      this.x += sin(frameCount * 0.05 + this.x) * 0.5; // 左右輕微搖擺
      // 如果到達極限高度，開始破裂效果
      if (this.y < this.maxHeight) {
        this.popping = true;
      }
    } else {
      // 破裂效果：變大並淡出
      this.size += 1; 
      this.alpha -= 10; 
    }
  }

  display() {
    push();
    noStroke();
    
    // 水泡本體：白色，透明度 0.5 (約 127)
    let bodyAlpha = map(this.alpha, 0, 255, 0, 127);
    fill(255, bodyAlpha);
    circle(this.x, this.y, this.size);
    
    // 水泡上面的白色圓圈 (光澤)：白色，透明度 0.7 (約 178)
    let highlightAlpha = map(this.alpha, 0, 255, 0, 178);
    fill(255, highlightAlpha);
    circle(this.x + this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3);
    pop();
  }

  isDead() {
    return this.alpha <= 0;
  }
}
