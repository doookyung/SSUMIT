let isHelpOpen = false;
let startBtn, helpBtn, closeBtn;
let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  initButtons();
}

function draw() {
  background(15, 23, 42); 
  drawBackgroundGrid();
  updateButtonPositions();

  // 1. 타이틀 (SSUMIT)
  push();
  textAlign(CENTER, CENTER);
  textFont('Helvetica');
  textStyle(BOLD);
  textSize(width * 0.06); 
  fill(255);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(0, 229, 255, 0.6)';
  text("SSUMIT", width / 2, height * 0.3);
  pop();

  // 2. 제작자 명
  push();
  textAlign(CENTER, CENTER);
  textSize(max(12, width * 0.015));
  fill(148, 163, 184); 
  text("썸썸써밋 : 김도경, 김도현, 김도현", width / 2, height * 0.4);
  pop();

  // 3. 게임 설명 팝업 처리
  if (isHelpOpen) {
    drawHelpPopup();
    closeBtn.show();
    startBtn.hide();
    helpBtn.hide();
  } else {
    closeBtn.hide();
    startBtn.show();
    helpBtn.show();
  }
}

function initButtons() {
  startBtn = createButton('GAME START');
  styleButton(startBtn, '#00E5FF', '#000000');
  startBtn.mousePressed(() => { alert("게임 시작!"); });

  helpBtn = createButton('HOW TO PLAY');
  styleButton(helpBtn, 'transparent', '#FFFFFF');
  helpBtn.style('border', '2px solid #FFFFFF');
  helpBtn.mousePressed(() => { isHelpOpen = true; });

  closeBtn = createButton('✕');
  styleButton(closeBtn, '#FF4655', '#FFFFFF');
  closeBtn.style('border-radius', '50%');
  closeBtn.style('font-size', '16px');
  closeBtn.style('padding', '0px');
  closeBtn.size(35, 35);
  closeBtn.mousePressed(() => { isHelpOpen = false; });
  closeBtn.hide();
}

function updateButtonPositions() {
  let btnWidth = max(200, width * 0.15);
  let btnHeight = 50;

  startBtn.size(btnWidth, btnHeight);
  startBtn.position(width / 2 - btnWidth / 2, height * 0.55);

  helpBtn.size(btnWidth, btnHeight);
  helpBtn.position(width / 2 - btnWidth / 2, height * 0.65);

  // 반응형 팝업 크기 계산과 연동하여 닫기 버튼 위치 지정
  let popW = min(650, width * 0.9);
  let popH = min(550, height * 0.85);
  closeBtn.position(width / 2 + popW / 2 - 45, height / 2 - popH / 2 + 15);
}

function styleButton(btn, bgColor, textColor) {
  btn.style('background-color', bgColor);
  btn.style('color', textColor);
  btn.style('font-family', 'Helvetica');
  btn.style('font-weight', 'bold');
  btn.style('border', 'none');
  btn.style('border-radius', '8px');
  btn.style('cursor', 'pointer');
  btn.style('transition', 'all 0.2s ease');
  
  btn.mouseOver(() => {
    btn.style('transform', 'scale(1.05)');
    btn.style('box-shadow', '0px 0px 15px rgba(255,255,255,0.3)');
  });
  btn.mouseOut(() => {
    btn.style('transform', 'scale(1)');
    btn.style('box-shadow', 'none');
  });
}

function drawBackgroundGrid() {
  stroke(30, 41, 59, 100);
  strokeWeight(1);
  for (let i = 0; i < width; i += 60) { line(i, 0, i, height); }
  for (let j = 0; j < height; j += 60) { line(0, j, width, j); }
}

// ⚠️ 글씨 어긋남 문제를 완전히 수정한 팝업 함수
function drawHelpPopup() {
  // 화면 크기에 유연하게 반응하는 팝업 너비와 높이
  let popW = min(650, width * 0.9);
  let popH = min(580, height * 0.85);
  
  // 배경 어둡게
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  // 팝업 메인 박스
  push();
  rectMode(CENTER);
  fill(30, 41, 59);
  stroke(71, 85, 105);
  strokeWeight(2);
  rect(width / 2, height / 2, popW, popH, 15);
  pop();

  // 텍스트 그리기 시작
  push();
  // 텍스트 기준점을 좌상단(TOP, LEFT)으로 고정하여 어긋남 방지
  textAlign(LEFT, TOP);
  
  // 텍스트가 그려질 시작 좌표 계산 (여백 30px 적용)
  let startX = width / 2 - popW / 2 + 30;
  let currentY = height / 2 - popH / 2 + 30;
  let textWrapWidth = popW - 60; // 텍스트가 박스를 안 넘어가게 제한하는 가로 폭

  // 1. 타이틀: HOW TO PLAY
  fill('#00E5FF');
  textSize(24);
  textStyle(BOLD);
  text("HOW TO PLAY", startX, currentY);
  
  // 2. 전체 개요 및 전환 설명
  currentY += 45;
  fill(241, 245, 249);
  textSize(14);
  textStyle(NORMAL);
  textLeading(22); // 줄간격을 넓혀 가독성 확보
  
  let mainDesc = "이 게임은 한 곡 안에서 밴드의 세가지 세션(베이스, 건반, 드럼)을 모두 플레이 할 수 있는 리듬게임입니다.\n\n🔄 악기별 전환을 위해 타이밍에 맞추어 카메라에 [악보 넘기는 모션]을 취합니다.";
  text(mainDesc, startX, currentY, textWrapWidth);

  // 3. 세션별 설명 (설명 길이에 맞춰 아래로 흐르도록 간격 조정)
  currentY += 95;

  // --- 베이스 ---
  fill('#FFD700'); textStyle(BOLD); textSize(15);
  text("🎸 베이스", startX, currentY);
  
  fill(218, 223, 230); textStyle(NORMAL); textSize(13);
  let bassDesc = "마우스를 위 아래로 움직여 조준점을 줄 위에 위치시키고 타이밍을 맞춰 스페이스바 또는 클릭합니다.";
  text(bassDesc, startX, currentY + 22, textWrapWidth);

  // --- 건반 ---
  currentY += 70; // 이전 텍스트 영역 확보 후 이동
  fill('#A855F7'); textStyle(BOLD); textSize(15);
  text("🎹 건반", startX, currentY);
  
  fill(218, 223, 230); textStyle(NORMAL); textSize(13);
  let pianoDesc = "블럭이 떨어지는 타이밍에 맞추어 지정된 키보드를 누릅니다.";
  text(pianoDesc, startX, currentY + 22, textWrapWidth);

  // --- 드럼 ---
  currentY += 70;
  fill('#10B981'); textStyle(BOLD); textSize(15);
  text("🥁 드럼", startX, currentY);
  
  fill(218, 223, 230); textStyle(NORMAL); textSize(13);
  let drumDesc = "드럼 악보 위 지정된 키를 타이밍에 맞추어 누릅니다. 심벌 타이밍에는 카메라 화면 속 원에 손을 올립니다.";
  text(drumDesc, startX, currentY + 22, textWrapWidth);
  
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}