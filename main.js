// ===================================================
// [정밀 타임라인 세션 체인저] main.js
// ===================================================

let masterBgm;
let globalSongTime = 0;       // 통합 마스터 시계 (ms)
let isSongPlaying = false;    // 게임 시작 플래그
let masterFont;

// 🔘 시작 버튼 설정
let startButton = { x: 0, y: 0, w: 220, h: 65, hovered: false };

// ===================================================
// ⏱️ [핵심] 각 세션별 파트 타임라인 설정 (밀리초 단위)
// 언제 켜지고 언제 꺼질지 마스터 타워에서 통제합니다.
// ===================================================
const SESSION_TIMELINE = {
  KEYBOARD: { start: 0,      end: 16000  }, // 0초 ~ 30초
  BASS:     { start: 16000,  end: 30000  }, // 30초 ~ 60초
  DRUM:     { start: 30000,  end: 46000 }  // 60초 ~ 3분(곡 종료까지)
};

function preload() {
  // 음악 파일 로드 (상대 경로)
  masterBgm = loadSound('126.mp3', 
    () => { console.log("🎵 오디오 로드 성공!"); }, 
    (err) => { console.error("❌ 오디오 로드 실패:", err); }
  );

  // 폰트 에셋 로드 (안전장치 포함)
  try {
    masterFont = loadFont('Paperlogy-7Bold.ttf');
  } catch(e) {
    console.log("기본 시스템 폰트로 대체합니다.");
  }

  // 기존 악기 파일들의 preload 함수가 있다면 안전하게 실행
  if (typeof keyboardPreload === 'function') keyboardPreload();
  if (typeof bassPreload === 'function') bassPreload();
  if (typeof drumPreload === 'function') drumPreload();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (masterFont) textFont(masterFont);
  
  updateStartButtonPosition();

  // ⚙️ 음악이 시작되기 전에 모든 악기 채보/세팅을 백그라운드에서 먼저 셋업
  if (typeof keyboardSetup === 'function') keyboardSetup();
  if (typeof bassSetup === 'function') bassSetup();
  if (typeof drumSetup === 'function') drumSetup();
  
  console.log("🚀 모든 독립 세션 빌드 및 릴레이 준비 완료!");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateStartButtonPosition();
  if (typeof updateKeyboardGameScale === 'function') updateKeyboardGameScale();
}

function draw() {
  background(15, 15, 25); // 기본 무대 배경색
  
  if (!isSongPlaying) {
    // 1. 대기 화면
    drawStartScreen();
  } else {
    // 2. 인게임 재생 중: 오디오 타임라인 실시간 추적 (ms)
    if (masterBgm && masterBgm.isPlaying()) {
      globalSongTime = masterBgm.currentTime() * 1000;
    }
    
    // ===================================================
    // 🔀 [릴레이 시스템] 시간에 매칭되는 단 하나의 draw만 호출!
    // ===================================================
    if (globalSongTime >= SESSION_TIMELINE.KEYBOARD.start && globalSongTime < SESSION_TIMELINE.KEYBOARD.end) {
      // 🎹 1선발: 키보드 타임
      if (typeof keyboardDraw === 'function') keyboardDraw();
      drawSessionIndicator("KEYBOARD SESSION");
      
    } else if (globalSongTime >= SESSION_TIMELINE.BASS.start && globalSongTime < SESSION_TIMELINE.BASS.end) {
      // 🎸 2선발: 베이스 타임
      if (typeof bassDraw === 'function') bassDraw();
      drawSessionIndicator("BASS SESSION");
      
    } else if (globalSongTime >= SESSION_TIMELINE.DRUM.start && globalSongTime < SESSION_TIMELINE.DRUM.end) {
      // 🥁 3선발: 드럼 타임
      if (typeof drumDraw === 'function') drumDraw();
      drawSessionIndicator("DRUM SESSION");
      
    } else {
      // 모든 세션이 끝나면 깔끔하게 스테이지 클리어 연출
      drawStageClear();
    }
    
    // 마스터 정보 오버레이
    drawMasterOverlay();
  }
}

// ===================================================
// ⌨️ [입력 라우터] 내 파트 시간이 아닐 때는 조작이 씹히도록 차단!
// ===================================================
function keyPressed() {
  if (!isSongPlaying && key === ' ') {
    startEnsembleGame();
    return;
  }
  if (!isSongPlaying) return;

  // 현재 시간에 해당하는 악기 파트의 키 입력 함수만 연결해서 버그 방지
  if (globalSongTime >= SESSION_TIMELINE.KEYBOARD.start && globalSongTime < SESSION_TIMELINE.KEYBOARD.end) {
    if (typeof keyboardKeyPressed === 'function') keyboardKeyPressed();
  } 
  else if (globalSongTime >= SESSION_TIMELINE.BASS.start && globalSongTime < SESSION_TIMELINE.BASS.end) {
    if (typeof bassKeyPressed === 'function') bassKeyPressed();
  } 
  else if (globalSongTime >= SESSION_TIMELINE.DRUM.start && globalSongTime < SESSION_TIMELINE.DRUM.end) {
    if (typeof drumKeyPressed === 'function') drumKeyPressed();
  }
}

function keyReleased() {
  if (!isSongPlaying) return;

  if (globalSongTime >= SESSION_TIMELINE.KEYBOARD.start && globalSongTime < SESSION_TIMELINE.KEYBOARD.end) {
    if (typeof keyboardKeyReleased === 'function') keyboardKeyReleased();
  } 
  else if (globalSongTime >= SESSION_TIMELINE.BASS.start && globalSongTime < SESSION_TIMELINE.BASS.end) {
    if (typeof bassKeyReleased === 'function') bassKeyReleased();
  } 
  else if (globalSongTime >= SESSION_TIMELINE.DRUM.start && globalSongTime < SESSION_TIMELINE.DRUM.end) {
    if (typeof drumKeyReleased === 'function') drumKeyReleased();
  }
}

// ============================================
// 🖼️ 릴레이 연출 전용 부가 그래픽 UI 함수들
// ============================================
function updateStartButtonPosition() {
  startButton.x = width / 2 - startButton.w / 2;
  startButton.y = height / 2 + 50;
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(0, 230, 255);
  textSize(50);
  text("NEON RELAY ENSEMBLE", width / 2, height / 2 - 80);
  
  textSize(16);
  fill(140, 140, 160);
  text("키보드(0~30s) → 베이스(30~60s) → 드럼(60s~끝) 순으로 교대합니다.", width / 2, height / 2 - 15);

  startButton.hovered = (mouseX >= startButton.x && mouseX <= startButton.x + startButton.w &&
                         mouseY >= startButton.y && mouseY <= startButton.y + startButton.h);

  if (startButton.hovered) { fill(0, 230, 255); stroke(255); cursor(HAND); } 
  else { fill(20, 20, 35); stroke(0, 230, 255); cursor(ARROW); }
  strokeWeight(2);
  rect(startButton.x, startButton.y, startButton.w, startButton.h, 15);

  noStroke();
  if (startButton.hovered) fill(0); else fill(0, 230, 255);
  textSize(20);
  text("START SHOWTIME", width / 2, startButton.y + startButton.h / 2);
}

function mousePressed() {
  if (!isSongPlaying && startButton.hovered) {
    startEnsembleGame();
  }
}

function startEnsembleGame() {
  if (masterBgm && !masterBgm.isPlaying()) {
    masterBgm.play(); // 릴레이 게임이므로 단판 플레이 권장 루프 대신 play
  }
  isSongPlaying = true;
  globalSongTime = 0;
  cursor(ARROW);
  console.log("🎹 1번 주자 키보드 스타트!");
}

// 🏷️ 현재 누구 차례인지 화면 상단에 띄워주는 연출 배너
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

function drawStageClear() {
  textAlign(CENTER, CENTER);
  fill(255, 215, 0);
  textSize(60);
  text("STAGE CLEAR ✨", width / 2, height / 2 - 30);
  textSize(20);
  fill(255);
  text("완벽한 대연주가 끝났습니다!", width / 2, height / 2 + 40);
}
