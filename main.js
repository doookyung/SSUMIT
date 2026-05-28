// ===================================================
// [최종본] 정밀 타임라인 세션 체인저 (main.js)
// ===================================================

let masterBgm;
let globalSongTime = 0;       
let isSongPlaying = false;    
let isHelpVisible = false;    
let isGameEnded = false;      // 게임 종료 상태 플래그

// 🔘 UI 요소 관리
let uiButtons = {
  start: { x: 0, y: 0, w: 220, h: 60, label: "START GAME" },
  help:  { x: 0, y: 0, w: 220, h: 60, label: "HOW TO PLAY" },
  full:  { x: 0, y: 0, w: 120, h: 40, label: "FULLSCREEN" },
  replay: { x: 0, y: 0, w: 220, h: 60, label: "REPLAY" }
};

const SESSION_TIMELINE = {
  KEYBOARD: { start: 0,      end: 17500  },
  BASS:     { start: 17500,  end: 31500  },
  DRUM:     { start: 31500,  end: 48000 }
};

function preload() {
  masterBgm = loadSound('126.mp3');
  if (typeof keyboardPreload === 'function') keyboardPreload();
  if (typeof bassPreload === 'function') bassPreload();
  if (typeof drumPreload === 'function') drumPreload();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (typeof keyboardSetup === 'function') keyboardSetup();
  if (typeof bassSetup === 'function') bassSetup();
  if (typeof drumSetup === 'function') drumSetup();
  updateUIElements();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateUIElements();
}

function updateUIElements() {
  uiButtons.start.x = width / 2 - 110;
  uiButtons.start.y = height / 2 + 60;
  uiButtons.help.x = width / 2 - 110;
  uiButtons.help.y = height / 2 + 140;
  uiButtons.full.x = width - 140;
  uiButtons.full.y = 20;
  uiButtons.replay.x = width / 2 - 110;
  uiButtons.replay.y = height / 2 + 80;
}

function draw() {
  background(15, 15, 25); 
  
  if (!isSongPlaying && !isGameEnded) {
    drawStartScreen();
  } else if (isGameEnded) {
    drawEndScreen();
  } else {
    // 게임 진행 중
    if (masterBgm && masterBgm.isPlaying()) {
      globalSongTime = masterBgm.currentTime() * 1000;
    }
    
    // 타임라인 종료 체크
    if (globalSongTime >= 48000) { 
      isSongPlaying = false;
      isGameEnded = true;
    }

    // 릴레이 로직
    if (globalSongTime >= SESSION_TIMELINE.KEYBOARD.start && globalSongTime < SESSION_TIMELINE.KEYBOARD.end) {
      if (typeof keyboardDraw === 'function') keyboardDraw();
      drawSessionIndicator("KEYBOARD SESSION");
    } else if (globalSongTime >= SESSION_TIMELINE.BASS.start && globalSongTime < SESSION_TIMELINE.BASS.end) {
      if (typeof bassDraw === 'function') bassDraw();
      drawSessionIndicator("BASS SESSION");
    } else if (globalSongTime >= SESSION_TIMELINE.DRUM.start && globalSongTime < SESSION_TIMELINE.DRUM.end) {
      if (typeof drumDraw === 'function') drumDraw();
      drawSessionIndicator("DRUM SESSION");
    }
    drawMasterOverlay();
  }
}

// ============================================
// 🎨 UI: 시작/끝 화면
// ============================================
function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(80);
  text("SSUMIT", width / 2, height / 2 - 100);
  textSize(20);
  fill(150);
  text("썸썸써밋: 김도경, 김도현, 김도현", width / 2, height / 2 - 40);

  drawButton(uiButtons.start);
  drawButton(uiButtons.help);
  drawButton(uiButtons.full);

  if (isHelpVisible) drawHelpPopup();
}

function drawEndScreen() {
  textAlign(CENTER, CENTER);
  fill(255, 215, 0);
  textSize(60);
  text("STAGE CLEAR", width / 2, height / 2 - 120);

  // 등급 표시 (구현 전 주석)
  /*
  let rank = "A"; // 추후 점수 기반 로직 삽입
  textSize(40);
  fill(255);
  text("RANK: " + rank, width / 2, height / 2 - 50);
  */

  // 제작 크레딧
  fill(200);
  textSize(18);
  text("드럼: 김도경 | 베이스: 김도현 | 건반: 방준혁", width / 2, height / 2 + 10);

  drawButton(uiButtons.replay);
}

function drawButton(btn) {
  let isHovered = (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h);
  fill(isHovered ? 50 : 20);
  stroke(255);
  strokeWeight(2);
  rect(btn.x, btn.y, btn.w, btn.h, 10);
  noStroke();
  fill(255);
  textSize(16);
  text(btn.label, btn.x + btn.w/2, btn.y + btn.h/2);
}

// ============================================
// 📊 오버레이 및 팝업
// ============================================
function drawHelpPopup() {
  fill(0, 0, 0, 230);
  rect(0, 0, width, height);
  fill(20, 20, 30);
  stroke(0, 230, 255);
  rect(width/2 - 300, height/2 - 200, 600, 400, 20);
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(15);
  let desc = "이 게임은 한 곡 안에서 밴드의 세가지 세션(베이스, 건반, 드럼)을 모두 플레이 할 수 있는 리듬게임입니다.\n\n" +
             "베이스: 마우스를 위 아래로 움직여 조준점을 줄 위에 위치시키고 타이밍을 맞춰 스페이스바/클릭 합니다.\n\n" +
             "건반: 블럭이 떨어지는 타이밍에 맞추어 지정된 키보드를 누릅니다.\n\n" +
             "드럼: 드럼 악보 위 지정된 키를 타이밍에 맞추어 누릅니다. 심벌 타이밍에는 카메라 화면 속 원에 손을 올립니다.\n\n" +
             "악기별 전환을 위해 타이밍에 맞추어 카메라에 악보 넘기는 모션을 취합니다.";
  text(desc, width/2 - 270, height/2 - 170, 540, 350);
  textAlign(CENTER, CENTER);
  text("[클릭하여 닫기]", width/2, height/2 + 170);
}

function drawSessionIndicator(sessionName) {
  push();
  rectMode(CENTER);
  fill(0, 0, 0, 150);
  stroke(0, 230, 255, 100);
  strokeWeight(1);
  rect(width / 2, 50, 280, 35, 8);
  noStroke();
  fill(0, 230, 255);
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text(sessionName, width / 2, 50);
  pop();
}

function drawMasterOverlay() {
  fill(255, 255, 255, 120);
  textAlign(RIGHT, TOP);
  textSize(14);
  text(`현재 시간: ${(globalSongTime / 1000).toFixed(1)} 초`, width - 30, 20);
}

// ============================================
// 🖱️ 입력 및 조작
// ============================================
function mousePressed() {
  if (isHelpVisible) { isHelpVisible = false; return; }

  // 풀스크린
  if (mouseX > uiButtons.full.x && mouseX < uiButtons.full.x + uiButtons.full.w && mouseY > uiButtons.full.y && mouseY < uiButtons.full.y + uiButtons.full.h) {
    fullscreen(!fullscreen()); return;
  }

  // 시작 버튼
  if (!isSongPlaying && !isGameEnded && mouseX > uiButtons.start.x && mouseX < uiButtons.start.x + uiButtons.start.w && mouseY > uiButtons.start.y && mouseY < uiButtons.start.y + uiButtons.start.h) {
    startEnsembleGame();
  }

  // 설명 버튼
  if (!isSongPlaying && !isGameEnded && mouseX > uiButtons.help.x && mouseX < uiButtons.help.x + uiButtons.help.w && mouseY > uiButtons.help.y && mouseY < uiButtons.help.y + uiButtons.help.h) {
    isHelpVisible = true;
  }

  // 다시 플레이 버튼
  if (isGameEnded && mouseX > uiButtons.replay.x && mouseX < uiButtons.replay.x + uiButtons.replay.w && mouseY > uiButtons.replay.y && mouseY < uiButtons.replay.y + uiButtons.replay.h) {
    isGameEnded = false;
    startEnsembleGame();
  }
}

function startEnsembleGame() {
  if (masterBgm) {
    masterBgm.stop();
    masterBgm.play();
  }
  isSongPlaying = true;
  globalSongTime = 0;
}

function keyPressed() {
  if (!isSongPlaying) return;
  if (globalSongTime >= SESSION_TIMELINE.KEYBOARD.start && globalSongTime < SESSION_TIMELINE.KEYBOARD.end) {
    if (typeof keyboardKeyPressed === 'function') keyboardKeyPressed();
  } else if (globalSongTime >= SESSION_TIMELINE.BASS.start && globalSongTime < SESSION_TIMELINE.BASS.end) {
    if (typeof bassKeyPressed === 'function') bassKeyPressed();
  } else if (globalSongTime >= SESSION_TIMELINE.DRUM.start && globalSongTime < SESSION_TIMELINE.DRUM.end) {
    if (typeof drumKeyPressed === 'function') drumKeyPressed();
  }
}

function keyReleased() {
  if (!isSongPlaying) return;
  if (globalSongTime >= SESSION_TIMELINE.KEYBOARD.start && globalSongTime < SESSION_TIMELINE.KEYBOARD.end) {
    if (typeof keyboardKeyReleased === 'function') keyboardKeyReleased();
  } else if (globalSongTime >= SESSION_TIMELINE.BASS.start && globalSongTime < SESSION_TIMELINE.BASS.end) {
    if (typeof bassKeyReleased === 'function') bassKeyReleased();
  } else if (globalSongTime >= SESSION_TIMELINE.DRUM.start && globalSongTime < SESSION_TIMELINE.DRUM.end) {
    if (typeof drumKeyReleased === 'function') drumKeyReleased();
  }
}
