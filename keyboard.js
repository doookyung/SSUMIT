// ===================================================
// [키보드 세션 모듈] js/keyboard.js
// ===================================================

// 🎛️ 게임 설정 (키보드 고유 변수로 분리)
const KEYBOARD_CONFIG = {
  LANE_COUNT: 8,
  LANE_WIDTH: 80,
  TRACK_X_OFFSET: -100,      // 트랙을 중앙에 배치하기 위한 좌측 오프셋
  JUDGE_LINE_Y_OFFSET: 120,
  NOTE_HEIGHT: 15,
  NOTE_WIDTH: 70,
  SCROLL_SPEED: 200,
  AUDIO_OFFSET: -100
};

// 🎨 판정 피드백 및 이펙트 색상 설정
const KEYBOARD_COLOR = {
  BACKGROUND: [15, 15, 25],
  PERFECT: [255, 255, 100],
  GOOD: [100, 255, 100],
  BAD: [255, 150, 100],
  NOTE_NORMAL: [0, 230, 255], // 키보드만의 청량한 네온 블루 색상
};

// 인게임 전역 변수
let keyboardNotes = [];
let keyboardCurrentTime = 0; // main.js의 globalSongTime과 동기화
let keyboardJudgeLine;
let keyboardScore = 0;
let keyboardCombo = 0;
let keyboardMaxCombo = 0;
let keyboardComboScale = 1.0;

let keyboardLastJudgment = null;
let keyboardJudgmentTime = 0;
let keyboardHitEffects = [];
let keyboardKeyPressEffects = [];

// 외부 폰트/에셋 연동을 위한 함수
function keyboardPreload() {
  // 메인 main.js의 preload 단계에서 호출됩니다.
  // 만약 키보드 고유의 폰트나 리소스가 필요하다면 여기에 작성합니다.
}

// ============================================
// ⚙️ 1. 메인 세업에서 호출될 키보드 초기화 함수
// ============================================
function keyboardSetup() {
  // 판정선 Y축 위치 계산
  keyboardJudgeLine = height - KEYBOARD_CONFIG.JUDGE_LINE_Y_OFFSET;
  
  // 키 프레스 효과 배열 초기화
  for (let i = 0; i < KEYBOARD_CONFIG.LANE_COUNT; i++) {
    keyboardKeyPressEffects.push(false);
  }
  
  // 📝 [임시 테스트용] 샘플 노트 생성 로직 
  // 실제 채보 파일이 완성되면 이 부분을 채보 생성 함수로 대체하면 됩니다.
  generateKeyboardSampleNotes();
}

// ============================================
// 🎨 2. 메인 draw()에서 반복 호출될 루프 함수
// ============================================
function keyboardDraw() {
  // 메인 마스터 시계 동기화
  keyboardCurrentTime = globalSongTime + KEYBOARD_CONFIG.AUDIO_OFFSET;
  
  // 판정선 위치 화면 리사이즈 대응
  keyboardJudgeLine = height - KEYBOARD_CONFIG.JUDGE_LINE_Y_OFFSET;

  // 그래픽 렌더링 시작
  drawKeyboardLanes();
  drawKeyboardNotes();
  drawKeyboardEffects();
  drawKeyboardUI();
}

// ============================================
// 🖼️ UI 및 그래픽 렌더링 함수들
// ============================================
function drawKeyboardLanes() {
  let totalWidth = KEYBOARD_CONFIG.LANE_COUNT * KEYBOARD_CONFIG.LANE_WIDTH;
  let startX = width / 2 - totalWidth / 2 + KEYBOARD_CONFIG.TRACK_X_OFFSET;
  
  // 8개 레인 그리기
  for (let i = 0; i < KEYBOARD_CONFIG.LANE_COUNT; i++) {
    let x = startX + i * KEYBOARD_CONFIG.LANE_WIDTH;
    
    // 키를 누르고 있을 때의 레인 하이라이트 이펙트
    if (keyboardKeyPressEffects[i]) {
      fill(255, 255, 255, 35);
      noStroke();
      rect(x, 0, KEYBOARD_CONFIG.LANE_WIDTH, keyboardJudgeLine);
    }
    
    // 레인 경계선
    stroke(255, 255, 255, 30);
    strokeWeight(1);
    line(x, 0, x, keyboardJudgeLine);
    line(x + KEYBOARD_CONFIG.LANE_WIDTH, 0, x + KEYBOARD_CONFIG.LANE_WIDTH, keyboardJudgeLine);
  }
  
  // 판정선 (Judge Line)
  stroke(255, 50, 100, 200);
  strokeWeight(4);
  line(startX, keyboardJudgeLine, startX + totalWidth, keyboardJudgeLine);
}

function drawKeyboardNotes() {
  let totalWidth = KEYBOARD_CONFIG.LANE_COUNT * KEYBOARD_CONFIG.LANE_WIDTH;
  let startX = width / 2 - totalWidth / 2 + KEYBOARD_CONFIG.TRACK_X_OFFSET;
  
  for (let note of keyboardNotes) {
    if (!note.active) continue;
    
    // 노트의 Y 좌표 계산 (시간의 흐름에 따라 위에서 아래로 내려옴)
    let noteY = keyboardJudgeLine - (note.time - keyboardCurrentTime) * (KEYBOARD_CONFIG.SCROLL_SPEED / 1000);
    let noteX = startX + note.lane * KEYBOARD_CONFIG.LANE_WIDTH + (KEYBOARD_CONFIG.LANE_WIDTH - KEYBOARD_CONFIG.NOTE_WIDTH) / 2;
    
    // 화면 위쪽 밖으로 너무 멀리 있는 노트는 렌더링 패스
    if (noteY < -50) continue;
    
    // 판정선을 너무 지나쳐서 완전히 놓친 경우 (MISS 처리 오차범위 250ms)
    if (keyboardCurrentTime - note.time > 250) {
      note.active = false;
      keyboardCombo = 0;
      keyboardLastJudgment = 'MISS';
      keyboardJudgmentTime = millis();
      continue;
    }
    
    // 정상 범위 내의 노트 그리기
    if (noteY < keyboardJudgeLine + 20) {
      fill(KEYBOARD_COLOR.NOTE_NORMAL);
      stroke(255);
      strokeWeight(1);
      rect(noteX, noteY - KEYBOARD_CONFIG.NOTE_HEIGHT / 2, KEYBOARD_CONFIG.NOTE_WIDTH, KEYBOARD_CONFIG.NOTE_HEIGHT, 4);
    }
  }
}

function drawKeyboardEffects() {
  // 폭발 이펙트 등 애니메이션 처리
  for (let i = keyboardHitEffects.length - 1; i >= 0; i--) {
    let effect = keyboardHitEffects[i];
    let elapsed = millis() - effect.startTime;
    
    if (elapsed > 300) {
      keyboardHitEffects.splice(i, 1);
      continue;
    }
    
    let progress = elapsed / 300;
    let alpha = lerp(255, 0, progress);
    
    fill(effect.color[0], effect.color[1], effect.color[2], alpha * 0.6);
    noStroke();
    circle(effect.x, effect.y, KEYBOARD_CONFIG.LANE_WIDTH * (0.5 + progress));
  }
}

function drawKeyboardUI() {
  // 스코어 및 콤보 렌더링
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(18);
  text(`KEYBOARD SCORE: ${keyboardScore}`, width - 250, 30);
  text(`KEYBOARD COMBO: ${keyboardCombo}`, width - 250, 60);
  
  // 판정 팝업 연출 (0.8초간 유지)
  if (keyboardLastJudgment && millis() - keyboardJudgmentTime < 800) {
    textAlign(CENTER, CENTER);
    
    if (keyboardLastJudgment === 'PERFECT') fill(KEYBOARD_COLOR.PERFECT);
    else if (keyboardLastJudgment === 'GOOD') fill(KEYBOARD_COLOR.GOOD);
    else if (keyboardLastJudgment === 'BAD') fill(KEYBOARD_COLOR.BAD);
    else fill(255, 50, 50); // MISS
    
    // 콤보가 늘어날 때 살짝 튕기는 커지는 효과 적용
    if (keyboardCombo > 0) {
      keyboardComboScale = lerp(keyboardComboScale, 1.0, 0.1);
      textSize(40 * keyboardComboScale);
      text(`${keyboardLastJudgment}\n${keyboardCombo} COMBO`, width / 2 + KEYBOARD_CONFIG.TRACK_X_OFFSET, keyboardJudgeLine - 150);
    } else {
      textSize(40);
      text(keyboardLastJudgment, width / 2 + KEYBOARD_CONFIG.TRACK_X_OFFSET, keyboardJudgeLine - 150);
    }
  }
}

// ============================================
// ⌨️ 3. 키보드 입력 연동 함수 (메인 타워 중계)
// ============================================
function keyboardKeyPressed() {
  let lane = -1;
  // 건반형 게임에 매핑할 키 (예시: A, S, D, F, J, K, L, ;)
  if (key === 'a' || key === 'A') lane = 0;
  if (key === 's' || key === 'S') lane = 1;
  if (key === 'd' || key === 'D') lane = 2;
  if (key === 'f' || key === 'F') lane = 3;
  if (key === 'j' || key === 'J') lane = 4;
  if (key === 'k' || key === 'K') lane = 5;
  if (key === 'l' || key === 'L') lane = 6;
  if (key === ';')                lane = 7;
  
  if (lane !== -1) {
    keyboardKeyPressEffects[lane] = true;
    judgeKeyboardInput(lane);
  }
}

function keyboardKeyReleased() {
  let lane = -1;
  if (key === 'a' || key === 'A') lane = 0;
  if (key === 's' || key === 'S') lane = 1;
  if (key === 'd' || key === 'D') lane = 2;
  if (key === 'f' || key === 'F') lane = 3;
  if (key === 'j' || key === 'J') lane = 4;
  if (key === 'k' || key === 'K') lane = 5;
  if (key === 'l' || key === 'L') lane = 6;
  if (key === ';')                lane = 7;
  
  if (lane !== -1) {
    keyboardKeyPressEffects[lane] = false;
  }
}

function judgeKeyboardInput(lane) {
  let closestNote = null;
  let minTimeDiff = Infinity;
  
  for (let note of keyboardNotes) {
    if (note.active && note.lane === lane) {
      let timeDiff = Math.abs(keyboardCurrentTime - note.time);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestNote = note;
      }
    }
  }
  
  // 기존 코드의 거리 비례 판정을 시간 오차(ms) 기반 판정으로 표준화
  if (closestNote && minTimeDiff < 220) { 
    closestNote.active = false;
    let scoreGain = 0;
    let effectColor = [255, 255, 255];
    
    if (minTimeDiff <= 70) {
      keyboardLastJudgment = 'PERFECT';
      effectColor = KEYBOARD_COLOR.PERFECT;
      scoreGain = 1000;
      keyboardCombo++;
      keyboardComboScale = 1.3;
    } else if (minTimeDiff <= 140) {
      keyboardLastJudgment = 'GOOD';
      effectColor = KEYBOARD_COLOR.GOOD;
      scoreGain = 500;
      keyboardCombo++;
      keyboardComboScale = 1.1;
    } else {
      keyboardLastJudgment = 'BAD';
      effectColor = KEYBOARD_COLOR.BAD;
      scoreGain = 200;
      keyboardCombo = 0;
    }
    
    keyboardScore += scoreGain;
    if (keyboardCombo > keyboardMaxCombo) keyboardMaxCombo = keyboardCombo;
    keyboardJudgmentTime = millis();
    
    // 판정선 폭발 이펙트 추가
    let totalWidth = KEYBOARD_CONFIG.LANE_COUNT * KEYBOARD_CONFIG.LANE_WIDTH;
    let startX = width / 2 - totalWidth / 2 + KEYBOARD_CONFIG.TRACK_X_OFFSET;
    let hitX = startX + lane * KEYBOARD_CONFIG.LANE_WIDTH + KEYBOARD_CONFIG.LANE_WIDTH / 2;
    
    keyboardHitEffects.push({
      x: hitX,
      y: keyboardJudgeLine,
      color: effectColor,
      startTime: millis()
    });
  }
}

// 📐 창 크기 변경 시 대응할 스케일 업데이트 함수
function updateKeyboardGameScale() {
  keyboardJudgeLine = height - KEYBOARD_CONFIG.JUDGE_LINE_Y_OFFSET;
}

// 📝 [테스트용] 임시 4마디 무한 반복 스타일 샘플 채보 빌더
function generateKeyboardSampleNotes() {
  let baseTime = 2000; // 2초 뒤부터 등장 시작
  for (let m = 0; m < 16; m++) { // 16마디 분량 예시 생성
    for (let i = 0; i < 4; i++) {
      keyboardNotes.push({ time: baseTime, lane: (i * 2) % 8, active: true });
      baseTime += 476; // 126 BPM 기준 Quarter note 간격 (약 476ms)
    }
  }
}