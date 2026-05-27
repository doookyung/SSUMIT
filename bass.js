// ===================================================
// [베이스 세션 모듈] js/bass.js (sketch.js + chart.js 통합본)
// ===================================================

// 🎵 곡 정보 및 BPM 설정
const BASS_SONG_BPM = 126; 

// 📝 직관적인 채보 작성을 위한 음표/쉼표 단위 정의
const BASS_NOTE_1   = 4.0;   // 온음표 (4박자)
const BASS_NOTE_2   = 2.0;   // 2분음표 (2박자)
const BASS_NOTE_4   = 1.0;   // 4분음표 (1박자) - 기본 정박
const BASS_NOTE_8   = 0.5;   // 8분음표 (0.5박자)
const BASS_NOTE_16  = 0.25;  // 16분음표 (0.25박자)

const BASS_NOTE_D4  = 1.5;   // 점4분음표 (1.5박자)
const BASS_NOTE_D8  = 0.75;  // 점8분음표 (0.75박자)
const BASS_NOTE_TR  = 1 / 3; // 셋잇단음표 (약 0.33박자)

// --- 🥁 누적 박자 기반 채보 시스템 변수 ---
let bassCurrentBeatTracker = 0; 

// 🎨 UI 및 게임 색상/크기 설정
const BASS_CONFIG = {
  LANE_COUNT: 4,
  TARGET_X: 150,               
  POINTER_SIZE: 43.2,          
};

const BASS_COLOR_CONFIG = {
  BACKGROUND: 20,              
  LANE_BASE: 80,               
  LANE_ACTIVE: 140,            
  TARGET_LINE: [255, 50, 50, 150], 
  PERFECT: [0, 255, 200],      
  GREAT: [255, 220, 0],         
  BREAK: [255, 100, 100],      
  MISS: [255, 50, 50],         
  NOTE_NORMAL: [255, 220, 0],  
  NOTE_LONG: [255, 150, 0],    
};

// 시간 기반 판정 기준 오차 정의
const BASS_JUDGE_WINDOW = {
  EARLY_PERFECT: 90,   
  EARLY_GREAT: 220,     
};

// 인게임 전역 변수
let bassNotes = [];
let bassCurrentTime = 0; // main.js의 globalSongTime과 동기화
let bassScore = 0;
let bassCombo = 0;
let bassMaxCombo = 0;
let bassComboScale = 1.0;

let bassLastJudgment = null;
let bassJudgmentTime = 0;
let bassHitEffects = [];
let bassKeyPressEffects = [];

// ============================================
// ⚙️ 1. 메인 세업에서 호출될 베이스 초기화 함수
// ============================================
function bassSetup() {
  // 원래의 createChart() 역할을 실행하여 노트를 생성합니다.
  createBassChart();
  
  // 키 프레스 효과 배열 초기화
  for (let i = 0; i < BASS_CONFIG.LANE_COUNT; i++) {
    bassKeyPressEffects.push({ active: false, opacity: 0 });
  }
}

// ============================================
// 📝 4줄 베이스 채보 영역 (기존 chart.js 내용 100% 보존)
// ============================================
function createBassChart() {
  bassCurrentBeatTracker = 0; // 초기화
  
  // 1~4마디 전주 (쉼표)
  bassRest(BASS_NOTE_1); bassRest(BASS_NOTE_1); bassRest(BASS_NOTE_1); bassRest(BASS_NOTE_1);
  
  // 5마디
  bassPlay(3); bassRest(BASS_NOTE_4);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  
  // 6마디
  bassPlay(3); bassRest(BASS_NOTE_4);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  
  // 7마디
  bassPlay(4); bassRest(BASS_NOTE_4);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_4);
  bassPlay(2); bassRest(BASS_NOTE_4);
  
  // 8마디
  bassPlay(4); bassRest(BASS_NOTE_4);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_4);
  bassPlay(2); bassRest(BASS_NOTE_4);
  
  // 9마디
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  
  // 10마디
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  
  // 11마디
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_8);
  
  // 12마디
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(4); bassRest(BASS_NOTE_8);
  bassPlay(2); bassRest(BASS_NOTE_4);
  bassPlay(2); bassRest(BASS_NOTE_4);
  
  // 13마디
  bassPlay(3); bassRest(BASS_NOTE_4);
  bassPlay(3); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  
  // 14마디
  bassPlay(3); bassRest(BASS_NOTE_4);
  bassPlay(3); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  
  // 15마디
  bassPlay(4); bassRest(BASS_NOTE_4);
  bassPlay(4); bassRest(BASS_NOTE_4);
  bassPlay(1); bassRest(BASS_NOTE_4);
  
  // 16마디
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
  bassPlay(3); bassRest(BASS_NOTE_8);
  bassPlay(1); bassRest(BASS_NOTE_8);
}

// ⚙️ 내부 노트 빌드 함수들 (기존 chart.js 시스템 통합)
function bassBeatToTime(beat) {
  return (beat * 60) / BASS_SONG_BPM;
}

function bassPlay(stringNum, holdBeat = 0) {
  let laneIndex = constrain(stringNum - 1, 0, BASS_CONFIG.LANE_COUNT - 1);
  let startTimeMs = bassBeatToTime(bassCurrentBeatTracker) * 1000;
  
  if (holdBeat <= 0) {
    bassNotes.push({
      type: 'short', time: startTimeMs, lane: laneIndex, active: true, missed: false
    });
  } else {
    let endTimeMs = bassBeatToTime(bassCurrentBeatTracker + holdBeat) * 1000;
    bassNotes.push({
      type: 'hold', time: startTimeMs, endTime: endTimeMs, lane: laneIndex,
      active: true, missed: false, headHit: false, holding: false
    });
  }
}

function bassRest(restType) {
  bassCurrentBeatTracker += restType;
}

// ============================================
// 🎨 2. 메인 draw()에서 반복 호출될 루프 함수
// ============================================
function bassDraw() {
  // 메인 마스터 시계 동기화
  bassCurrentTime = globalSongTime;

  // 그래픽 그리기 프로세스
  drawBassLanes();
  drawBassNotes();
  updateBassEffects();
  drawBassUI();
}

// ============================================
// 🖼️ UI 및 그래픽 렌더링 함수들
// ============================================
function drawBassLanes() {
  let laneHeight = height / BASS_CONFIG.LANE_COUNT;
  
  for (let i = 0; i < BASS_CONFIG.LANE_COUNT; i++) {
    let y = i * laneHeight;
    
    // 레인 배경 및 이펙트
    if (bassKeyPressEffects[i].active) {
      fill(BASS_COLOR_CONFIG.LANE_ACTIVE, bassKeyPressEffects[i].opacity);
    } else {
      fill(BASS_COLOR_CONFIG.LANE_BASE, bassKeyPressEffects[i].opacity);
    }
    noStroke();
    rect(0, y, width, laneHeight);
    
    // 격자 구분선
    stroke(50);
    strokeWeight(1);
    line(0, y, width, y);
    
    // 줄(String) 시각화
    stroke(180, 180, 180, 150);
    strokeWeight(2);
    line(0, y + laneHeight / 2, width, y + laneHeight / 2);
  }
  
  // 판정선 (TARGET_X)
  stroke(BASS_COLOR_CONFIG.TARGET_LINE);
  strokeWeight(4);
  line(BASS_CONFIG.TARGET_X, 0, BASS_CONFIG.TARGET_X, height);
}

function drawBassNotes() {
  let laneHeight = height / BASS_CONFIG.LANE_COUNT;
  
  for (let note of bassNotes) {
    if (!note.active) continue;
    
    // 노트의 실시간 X 좌표 계산 (오른쪽에서 왼쪽으로 이동)
    // 픽셀 이동 속도 계수: 0.4
    let noteX = BASS_CONFIG.TARGET_X + (note.time - bassCurrentTime) * 0.4;
    let noteY = note.lane * laneHeight + laneHeight / 2;
    
    // 화면 밖에 너무 멀리 벗어난 노트 패스
    if (noteX > width + 50) continue;
    
    // 판정선을 지나쳐서 완전히 놓친 경우 (MISS 처리 오차범위 250ms)
    if (bassCurrentTime - note.time > 250) {
      note.active = false;
      note.missed = true;
      bassCombo = 0;
      bassLastJudgment = 'MISS';
      bassJudgmentTime = millis();
      continue;
    }
    
    // 노트 그리기
    if (noteX > BASS_CONFIG.TARGET_X - 20) {
      fill(BASS_COLOR_CONFIG.NOTE_NORMAL);
      stroke(255);
      strokeWeight(1);
      circle(noteX, noteY, BASS_CONFIG.POINTER_SIZE);
    }
  }
}

function updateBassEffects() {
  for (let i = 0; i < BASS_CONFIG.LANE_COUNT; i++) {
    if (!bassKeyPressEffects[i].active) {
      bassKeyPressEffects[i].opacity = lerp(bassKeyPressEffects[i].opacity, 0, 0.1);
    }
  }
}

function drawBassUI() {
  // 스코어 및 콤보 렌더링
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(18);
  text(`BASS SCORE: ${bassScore}`, 30, 30);
  text(`BASS COMBO: ${bassCombo}`, 30, 60);
  
  // 판정 피드백 출력 (0.8초 동안 유지)
  if (bassLastJudgment && millis() - bassJudgmentTime < 800) {
    textAlign(CENTER, CENTER);
    textSize(40);
    
    if (bassLastJudgment === 'PERFECT') fill(BASS_COLOR_CONFIG.PERFECT);
    else if (bassLastJudgment === 'GREAT') fill(BASS_COLOR_CONFIG.GREAT);
    else fill(BASS_COLOR_CONFIG.MISS);
    
    text(bassLastJudgment, width / 2, height / 2 - 50);
  }
}

// ============================================
// ⌨️ 3. 키보드 입력 연동 함수 (메인 타워 중계)
// ============================================
function bassKeyPressed() {
  let lane = -1;
  if (key === '1') lane = 0;
  if (key === '2') lane = 1;
  if (key === '3') lane = 2;
  if (key === '4') lane = 3;
  
  if (lane !== -1) {
    bassKeyPressEffects[lane].active = true;
    bassKeyPressEffects[lane].opacity = 180;
    judgeBassInput(lane);
  }
}

function bassKeyReleased() {
  let lane = -1;
  if (key === '1') lane = 0;
  if (key === '2') lane = 1;
  if (key === '3') lane = 2;
  if (key === '4') lane = 3;
  
  if (lane !== -1) {
    bassKeyPressEffects[lane].active = false;
  }
}

function judgeBassInput(lane) {
  let closestNote = null;
  let minTimeDiff = Infinity;
  
  for (let note of bassNotes) {
    if (note.active && note.lane === lane) {
      let timeDiff = Math.abs(bassCurrentTime - note.time);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestNote = note;
      }
    }
  }
  
  // 판정 범위 조건 처리
  if (closestNote && minTimeDiff < BASS_JUDGE_WINDOW.EARLY_GREAT) {
    closestNote.active = false;
    let scoreGain = 0;
    
    if (minTimeDiff <= BASS_JUDGE_WINDOW.EARLY_PERFECT) {
      bassLastJudgment = 'PERFECT';
      scoreGain = 1000;
      bassCombo++;
    } else {
      bassLastJudgment = 'GREAT';
      scoreGain = 500;
      bassCombo++;
    }
    
    bassScore += scoreGain;
    if (bassCombo > bassMaxCombo) bassMaxCombo = bassCombo;
    bassJudgmentTime = millis();
  }
}