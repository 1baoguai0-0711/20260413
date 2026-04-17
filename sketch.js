/**
 * 水底世界展覽區
 */

let seaweeds = [];
let bubbles = [];
let fishes = [];
let bgBubbles = [];
let particles = [];
let assignments = [
  { week: "第一週", title: "幾何練習", url: "./week1" },
  { week: "第二週", title: "色彩互動", url: "./week2" },
  { week: "第三週", title: "Vertex 創作", url: "./week3" },
  { week: "第四週", title: "海草生態", url: "./week4" },
  { week: "第五週", title: "進階特效", url: "./week5" },
  { week: "第六週", title: "整合應用", url: "./week6" }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化海草 (數量隨作業數增加)
  for (let i = 0; i < assignments.length * 3; i++) {
    seaweeds.push(new Seaweed(random(width), assignments.length));
  }
  
  // 初始化互動氣泡
  for (let i = 0; i < assignments.length; i++) {
    let x = map(i, 0, assignments.length - 1, width * 0.1, width * 0.5);
    bubbles.push(new AssignmentBubble(x, height * 0.7, assignments[i]));
  }

  // 初始化裝飾魚群
  for (let i = 0; i < 5; i++) {
    fishes.push(new VertexFish());
  }

  // 初始化背景水泡
  for (let i = 0; i < 15; i++) {
    bgBubbles.push(new BgBubble());
  }
}

function draw() {
  // 水底漸層背景
  backgroundGradient();
  
  // 繪製海草
  for (let sw of seaweeds) {
    sw.update();
    sw.display();
  }
  
  // 繪製魚群
  for (let f of fishes) {
    f.update();
    f.display();
  }
  
  // 繪製與更新氣泡
  for (let b of bubbles) {
    b.update();
    b.display();
  }

  // 更新與繪製背景裝飾水泡
  for (let i = bgBubbles.length - 1; i >= 0; i--) {
    bgBubbles[i].update();
    bgBubbles[i].display();
    if (bgBubbles[i].popped) {
      // 產生破掉的特效粒子
      for (let j = 0; j < 8; j++) {
        particles.push(new Particle(bgBubbles[i].pos.x, bgBubbles[i].pos.y));
      }
      bgBubbles[i].reset(); // 重置水泡到地底部
    }
  }

  // 更新與繪製粒子特效
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

// -----------------------------------------------------------
// Class: 動態海草
// -----------------------------------------------------------
class Seaweed {
  constructor(x, growthFactor) {
    this.x = x;
    this.baseHeight = random(100, 200);
    this.targetHeight = this.baseHeight + (growthFactor * 40); // 隨作業數長高
    this.segments = 15;
    this.angleOffset = random(1000);
  }

  update() {
    this.angleOffset += 0.02;
  }

  display() {
    push();
    noFill();
    stroke(46, 139, 87, 200);
    strokeWeight(4);
    beginShape();
    for (let i = 0; i < this.segments; i++) {
      let y = height - (i * this.targetHeight / this.segments);
      let xOff = sin(this.angleOffset + i * 0.3) * (i * 2); 
      curveVertex(this.x + xOff, y);
    }
    endShape();
    pop();
  }
}

// -----------------------------------------------------------
// Class: 互動氣泡 (作業點)
// -----------------------------------------------------------
class AssignmentBubble {
  constructor(x, y, data) {
    this.pos = createVector(x, y);
    this.data = data;
    this.size = random(60, 80);
    this.noiseOffset = random(1000);
  }

  update() {
    // 輕微漂浮感
    this.pos.y += sin(frameCount * 0.05 + this.noiseOffset) * 0.5;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // 氣泡本體
    fill(135, 206, 250, 100);
    stroke(255, 150);
    ellipse(0, 0, this.size);
    
    // 高光
    fill(255, 180);
    noStroke();
    ellipse(-this.size/4, -this.size/4, this.size/6);
    
    // 文字
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(14);
    text(this.data.week, 0, 0);
    pop();
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.pos.x, this.pos.y);
    return d < this.size / 2;
  }
}

// -----------------------------------------------------------
// Class: Vertex 魚 (利用 beginShape 繪製)
// -----------------------------------------------------------
class VertexFish {
  constructor() {
    this.reset();
  }

  reset() {
    this.pos = createVector(-100, random(height * 0.2, height * 0.8));
    this.speed = random(1, 3);
    this.size = random(0.5, 1.2);
    this.color = color(random(200, 255), random(100, 200), 0);
  }

  update() {
    this.pos.x += this.speed;
    if (this.pos.x > width + 100) this.reset();
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.size);
    fill(this.color);
    noStroke();
    
    // 使用 Vertex 勾勒魚的身型
    beginShape();
    vertex(40, 0);         // 魚頭
    bezierVertex(20, -15, -10, -10, -20, 0); // 背部
    vertex(-35, -15);      // 尾鰭上
    vertex(-25, 0);        // 尾柄
    vertex(-35, 15);       // 尾鰭下
    bezierVertex(-10, 10, 20, 15, 40, 0);    // 腹部
    endShape(CLOSE);
    
    // 魚眼
    fill(255);
    ellipse(25, -2, 5);
    fill(0);
    ellipse(26, -2, 2);
    pop();
  }
}

// -----------------------------------------------------------
// Class: 背景裝飾水泡 (由下而上，隨機高度破裂)
// -----------------------------------------------------------
class BgBubble {
  constructor() {
    this.reset();
  }

  reset() {
    this.pos = createVector(random(width), height + random(20, 100));
    this.vel = createVector(random(-0.5, 0.5), random(-1, -2.5));
    this.size = random(5, 15);
    this.popY = random(height * 0.1, height * 0.6); // 隨機破裂高度
    this.popped = false;
  }

  update() {
    this.pos.add(this.vel);
    this.pos.x += sin(frameCount * 0.02 + this.size) * 0.3; // 輕微左右晃動
    if (this.pos.y < this.popY) {
      this.popped = true;
    }
  }

  display() {
    push();
    noFill();
    stroke(255, 120);
    strokeWeight(1);
    circle(this.pos.x, this.pos.y, this.size);
    // 小高光
    noStroke();
    fill(255, 150);
    circle(this.pos.x - this.size * 0.2, this.pos.y - this.size * 0.2, this.size * 0.2);
    pop();
  }
}

// -----------------------------------------------------------
// Class: 破裂粒子特效
// -----------------------------------------------------------
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.lifespan = 255;
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 12; // 消失速度
  }

  display() {
    push();
    stroke(255, this.lifespan);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}

// 繪製漸層背景
function backgroundGradient() {
  let c1 = color(0, 40, 80);
  let c2 = color(0, 10, 30);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

// -----------------------------------------------------------
// 互動整合
// -----------------------------------------------------------
function mousePressed() {
  for (let b of bubbles) {
    if (b.isClicked(mouseX, mouseY)) {
      // 顯示 Iframe 並更換 URL
      let frameDiv = document.getElementById('content-frame');
      let iframe = document.getElementById('work-iframe');
      frameDiv.style.display = 'block';
      iframe.src = b.data.url;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
