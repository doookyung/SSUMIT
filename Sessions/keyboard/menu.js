et gameState = 'MENU'; // 'MENU' 또는 'PLAYING'
let myFont;

// UI 및 애니메이션용 변수
let startBtn = { x: 0, y: 0, w: 200, h: 60, hovered: false };
let particles = [];
let titleGlow = 0;

function preload() {
  // 폰트가 있다면 로드 (없다면 기본 폰트 사용되므로 생략 가능)
  // myFont = loadFont('Paperlogy-7Bold.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (myFont) textFont(myFont);
  
  // 배경을 꾸며줄 네온 입자들 생성
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      speedX: random(-0.5, 0.5),
      speedY: random(-0.5, 0.5),
      size: random(2, 5),
      color: random() > 0.5 ? color(0, 230, 255, 100) : color(255, 0, 128, 100)
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(15, 15, 25); // 어두운 사이버펑크 풍 배경
  
  // 배경 입자 애니메이션 그리기
  drawBackgroundParticles();

  // 게임 상태(State)에 따른 화면 분기
  if (gameState === 'MENU') {
    drawMainMenu();
  } else if (gameState === 'PLAYING') {
    drawGamePlaceholder();
  }
}

// ============================================
// 1. 메인 메뉴 화면 렌더링
// ============================================
function drawMainMenu() {
  // 버튼 위치 실시간 계산 (화면 중앙 하단)
  startBtn.x = width / 2 - startBtn.w / 2;
  startBtn.y = height * 0.7;
  
  // 마우스가 버튼 위에 있는지 확인
  startBtn.hovered = (mouseX > startBtn.x && mouseX < startBtn.x + startBtn.w &&
                      mouseY > startBtn.y && mouseY < startBtn.y + startBtn.h);

  // --- 타이틀 텍스트 (Neon 효과) ---
  titleGlow = sin(frameCount * 0.05) * 15 + 15; // 깜빡이는 효과
  textAlign(CENTER, CENTER);
  
  // 타이틀 그림자 (글로우 효과)
  fill(0, 230, 255, 50 + titleGlow);
  textSize(max(36, width * 0.06));
  text("NEON BEATS", width / 2 + 2, height * 0.25 + 2);
  
  // 타이틀 본체
  fill(255);
  text("NEON BEATS", width / 2, height * 0.25);

  // --- 고정 곡 정보창 (Song Info Box) ---
  let infoW = max(300, width * 0.3);
  let infoH = 100;
  let infoX = width / 2 - infoW / 2;
  let infoY = height * 0.42;
  
  // 정보창 테두리 및 배경
  fill(25, 25, 40, 150);
  stroke(255, 0, 128, 100);
  strokeWeight(1.5);
  rect(infoX, infoY, infoW, infoH, 8);
  
  // 정보창 텍스트
  noStroke();
  textAlign(LEFT, TOP);
  textSize(max(14, width * 0.015));
  fill(255, 0, 128);
  text("NOW PLAYING", infoX + 20, infoY + 15);
  
  fill(255);
  textSize(max(18, width * 0.02));
  text("Neon Beats Original Track", infoX + 20, infoY + 40);
  
  fill(150, 150, 170);
  textSize(max(12, width * 0.012));
  text("BPM: 126  |  Difficulty: Hard", infoX + 20, infoY + 70);

  // --- [START] 버튼 ---
  if (startBtn.hovered) {
    fill(0, 230, 255); // 호버 시 하늘색 노란빛 네온
    stroke(255);
    cursor(HAND);
  } else {
    fill(10, 10, 20);
    stroke(0, 230, 255);
    cursor(ARROW);
  }
  strokeWeight(2);
  rect(startBtn.x, startBtn.y, startBtn.w, startBtn.h, 30); // 둥근 버튼
  
  // 버튼 텍스트
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(22);
  if (startBtn.hovered) fill(0);
  else fill(0, 230, 255);
  text("GAME START", width / 2, startBtn.y + startBtn.h / 2);
}

// ============================================
// 2. 게임 화면 플레이스홀더 (나중에 기존 코드 합칠 곳)
// ============================================
function drawGamePlaceholder() {
  cursor(ARROW);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(24);
  text("여기에 기존 리듬게임 코드가 실행됩니다!", width / 2, height / 2);
  
  textSize(14);
  fill(150);
  text("[ESC] 누르면 다시 홈 화면으로 복귀", width / 2, height / 2 + 50);
}

// ============================================
// 3. 마우스 및 키보드 이벤트 리스너
// ============================================
function mousePressed() {
  if (gameState === 'MENU' && startBtn.hovered) {
    // START 버튼을 누르면 게임 상태를 전환!
    gameState = 'PLAYING';
    
    // [팁] 나중에 여기에 음악 재생(bgm.play())이나 
    // 기존 코드의 초기화 로직을 트리거하면 됩니다.
  }
}

function keyPressed() {
  // 테스트 편의상 ESC 누르면 메뉴로 돌아오게 설정
  if (key === 'Escape') {
    gameState = 'MENU';
  }
}

// 백그라운드 잔잔한 움직임 효과
function drawBackgroundParticles() {
  for (let p of particles) {
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0 || p.x > width) p.speedX *= -1;
    if (p.y < 0 || p.y > height) p.speedY *= -1;
    
    noStroke();
    fill(p.color);
    circle(p.x, p.y, p.size);
  }
}