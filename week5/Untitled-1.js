// 定義水草陣列與顏色盤
let grasses = [];
let palette = ['#132a13', '#31572c', '#4f772d', '#90a955', '#ecf39e'];

// 初始化設定
function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  noStroke(); // 去除邊框
  
  // 產生 50 根水草的資料
  for (let i = 0; i < 50; i++) {
    grasses.push({
      x: map(i, 0, 50, 0, width),    // 均衡分佈在視窗寬度內
      h: random(height * 0.4, height * 0.8), // 隨機高度
      w: random(30, 60),             // 隨機粗細
      c: random(palette),            // 隨機顏色
      offset: random(1000)           // 隨機擺動偏移量，讓每根草搖晃不同
    });
  }
}

function draw() {
  // 設定背景顏色
  background('#8ecae6');
  
  // 迴圈繪製每一根水草
  for (let g of grasses) {
    fill(g.c); // 設定該根水草的顏色
    drawSeaweed(g.x, height, g.h, g.w, g.offset);
  }
}

// 繪製水草的自訂函式
function drawSeaweed(xBase, yBase, totalHeight, baseWidth, noiseOffset) {
  let segments = 30; // 將水草切分為多少段 (越多越平滑)
  let time = frameCount * 0.01; // 時間變數，用於 noise 移動
  
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
    
    // 利用 map 將 noise (0~1) 映射到擺動範圍 (-40~40)
    // 這裡乘以 t 是為了讓根部 (t=0) 不動，頂部 (t=1) 擺動最大
    let xOffset = map(noiseVal, 0, 1, -60, 60) * t;
    
    // 計算隨高度變窄的寬度 (頂端變尖)
    let currentWidth = map(t, 0, 1, baseWidth, 0);
    
    // 產生頂點 (中心點 + 擺動 + 寬度的一半)
    curveVertex(xBase + xOffset - currentWidth, y);
  }
  
  // 2. 繪製右側邊緣 (從頂部往下回到底部，以形成封閉圖形)
  for (let i = segments; i >= 0; i--) {
    let t = i / segments;
    let y = yBase - (totalHeight * t);
    
    let noiseVal = noise(time + noiseOffset, i * 0.1);
    let xOffset = map(noiseVal, 0, 1, -60, 60) * t;
    let currentWidth = map(t, 0, 1, baseWidth, 0);
    
    // 右側頂點 (中心點 + 擺動 - 寬度的一半)
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
