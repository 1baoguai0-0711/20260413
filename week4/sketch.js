// 定義全域變數來儲存輸入框物件
let inputElement;
let sliderElement;
let buttonElement;
let isBouncing = false;
let webPageElement;
let selectElement;

function setup() {
  // 1. 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 建立 DOM 輸入框 (Input Box)
  inputElement = createInput('✨Hello✨'); // 預設文字為 Hello
  inputElement.position(20, 20);       // 設定輸入框在視窗左上角的位置
  inputElement.size(350);              // 設定輸入框寬度加大
  inputElement.style('font-size', '30px'); // 設定輸入框內的文字大小
  
  // 3. 建立滑桿：範圍 15-80，預設值 30
  sliderElement = createSlider(15, 80, 30);
  sliderElement.position(390, 35);     // 位置：x=20+350+20=390, y=35(垂直置中)

  // 4. 建立按鈕
  buttonElement = createButton('跳動');
  buttonElement.position(540, 20);     // 位置：調整 Y 軸與輸入框對齊
  buttonElement.size(80, 40);          // 設定按鈕大小
  buttonElement.style('font-size', '20px'); // 設定按鈕文字大小
  buttonElement.mousePressed(() => isBouncing = !isBouncing); // 按下時切換狀態

  // 5. 建立下拉式選單
  selectElement = createSelect();
  selectElement.position(640, 20);     // 位置：按鈕右邊 (540 + 80 + 20 = 640)
  selectElement.size(150, 40);         // 設定選單大小
  selectElement.style('font-size', '20px'); // 設定選單文字大小
  selectElement.option('淡江教科系', 'https://www.et.tku.edu.tw');
  selectElement.option('淡江大學', 'https://www.tku.edu.tw');
  // 當選單改變時，更新 iframe 的 src
  selectElement.changed(() => webPageElement.html('<iframe src="' + selectElement.value() + '" style="width:100%; height:100%; border:none;"></iframe>'));

  // 設定文字繪製的通用屬性
  textSize(30);                // 題目要求：文字大小 30px
  textAlign(LEFT, CENTER);     // 設定文字對齊：水平靠左，垂直置中

  // 5. 建立一個 DIV，並在裡面放入 iframe 來顯示網頁
  // 使用 createDiv 建立容器，內部嵌入 iframe，並設定寬高 100% 填滿 DIV
  webPageElement = createDiv('<iframe src="https://www.et.tku.edu.tw" style="width:100%; height:100%; border:none;"></iframe>');
  webPageElement.position(200, 100);   // 設定 DIV 位置 (距離左上各 200px)
  webPageElement.size(windowWidth - 400, windowHeight - 200); // 設定大小 (扣除四周各 200px)
  webPageElement.style('opacity', '0.8'); // 設定透明度為 80%
}

function draw() {
  // 每次重繪前先清空背景 (設為淺灰色)
  background(220);
  
  // 3. 動態取得使用者輸入的內容
  let txt = inputElement.value();
  
  // 如果沒有輸入文字，則不執行繪製，避免錯誤或無限迴圈
  if (txt.length === 0) {
    return;
  }
  
  // 取得滑桿數值，設定為文字大小
  let txtSize = sliderElement.value();
  textSize(txtSize);

  // 計算文字寬度，並加上一點間距 (10px)，讓重複的文字不要黏在一起
  let txtWidth = textWidth(txt) + 10;
  
  // 定義色票陣列
  let palette = [
    '#99e2b4', '#88d4ab', '#78c6a3', '#67b99a', '#56ab91',
    '#469d89', '#358f80', '#248277', '#14746f', '#036666'
  ];
  
  noStroke();

  // 4. 利用雙重迴圈將文字重複排列填滿整個視窗
  // 設定行高 (文字大小 + 寬鬆間距 20)
  let rowHeight = txtSize + 20;
  let y = 100;

  while (y < height) {
    let x = 0;
    let count = 0; // 用來計算目前是該行的第幾個文字
    while (x < width) {
      fill(palette[count % palette.length]); // 依序使用色票顏色
      
      // 計算上下左右的跳動偏移量
      let bounceX = 0;
      let bounceY = 0;
      if (isBouncing) {
        // 讓 X 軸與 Y 軸的跳動分別受到 y 座標與 x 座標的影響，產生交錯的波浪感
        bounceX = sin(frameCount * 0.1 + y * 0.05) * 15;
        bounceY = cos(frameCount * 0.1 + x * 0.05) * 15;
      }

      // y + rowHeight / 2 讓文字在該行垂直置中
      text(txt, x + bounceX, y + rowHeight / 2 + bounceY);
      // 將 x 座標往右移動「文字寬度 + 間距」
      x += txtWidth;
      count++;
    }
    y += rowHeight;
  }
}

// 當視窗大小改變時，自動調整畫布大小，保持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  webPageElement.size(windowWidth - 400, windowHeight - 400); // 同步調整網頁區塊大小
}
