// ============================================
// 🎵 곡 정보 및 BPM 설정
// ============================================
const SONG_BPM = 126; 

// ============================================
// 📝 직관적인 채보 작성을 위한 음표/쉼표 단위 정의 (4분음표 = 1.0)
// ============================================
const NOTE_1   = 4.0;   // 온음표 (4박자)
const NOTE_2   = 2.0;   // 2분음표 (2박자)
const NOTE_4   = 1.0;   // 4분음표 (1박자) - 기본 정박
const NOTE_8   = 0.5;   // 8분음표 (0.5박자)
const NOTE_16  = 0.25;  // 16분음표 (0.25박자)

const NOTE_D4  = 1.5;   // 점4분음표 (1.5박자)
const NOTE_D8  = 0.75;  // 점8분음표 (0.75박자)
const NOTE_TR  = 1 / 3; // 셋잇단음표 (약 0.33박자)

// --- 🥁 누적 박자 기반 채보 시스템 변수 ---
let currentBeatTracker = 0; // 누적 박자(Beat) 카운터

/**
 * 🎸 채보 초기화 및 악보 작성 구역
 * sketch.js의 setup() 단계에서 자동으로 호출됩니다.
 */
function createChart() {
  setGameBPM(SONG_BPM); 
  
  // 데이터 초기화
  notes = [];
  currentBeatTracker = 0; 
  
  // =============================================================
  // 🎸 [시퀀서 방식] 누적 박자 기반 베이스 채보 작성 구역
  // =============================================================
  // [규칙]
  // bass(줄번호);             -> 단타 노트를 찍음 (타임라인 안 밀림)
  // bass(줄번호, 지속박자);    -> 롱노트를 찍음 (타임라인 안 밀림)
  // rest(음표상수);           -> 입력한 박자만큼 타임라인을 우측으로 밀어냄
  // =============================================================
  
  // 0마디 대기: 곡 시작 후 1마디(4박자) 동안은 아무 노트도 나오지 않고 쉼
  rest(NOTE_1);
  
  bass(4, NOTE_8); rest(NOTE_4);
  bass(4); rest(NOTE_4);
  
  bass(4); rest(NOTE_8);
  bass(4); rest(NOTE_8);
  rest(NOTE_8)
  bass(3, NOTE_4+NOTE_8); rest(NOTE_4+NOTE_8);
  rest(NOTE_8);
  bass(3); rest(NOTE_8);
  rest(NOTE_8);
  bass(3,NOTE_4+NOTE_8); rest(NOTE_4+NOTE_8);
  
  rest(NOTE_1);
  rest(NOTE_1);
  rest(NOTE_1);
  rest(NOTE_1);
  rest(NOTE_1);
  rest(NOTE_1);
  
  //9마디
  bass(4, NOTE_4); rest(NOTE_4);
  rest(NOTE_8);
  bass(4); rest(NOTE_8);
  rest(NOTE_2);
  
  //10마디
  rest(NOTE_8);
  bass(3); rest(NOTE_8);
  rest(NOTE_8);
  bass(3); rest(NOTE_8);
  rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(4); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  
  //11마디
  bass(3, NOTE_4); rest(NOTE_4);
  rest(NOTE_8);
  bass(3); rest(NOTE_8);
  rest(NOTE_2);
  
  //12마디
  rest(NOTE_8);
  bass(4); rest(NOTE_8);
  rest(NOTE_8);
  bass(4); rest(NOTE_8);
  rest(NOTE_8);
  bass(4); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(4); rest(NOTE_8);
  
  //13마디
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  
  //14마디
  bass(3, NOTE_4); rest(NOTE_4);
  rest(NOTE_8);
  bass(3, NOTE_4); rest(NOTE_4+NOTE_8);
  bass(3); rest(NOTE_4);
  
  //15마디
  bass(3, NOTE_4); rest(NOTE_4+NOTE_8);
  bass(2, NOTE_4); rest(NOTE_4+NOTE_8);
  bass(1); rest(NOTE_4);
  
  //16마디
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  bass(3); rest(NOTE_8);
  bass(1); rest(NOTE_8);
  

  // =============================================================
}

// ============================================
// ⚙️ 누적 박자 계산식 내부 시스템 함수
// ============================================

/**
 * 베이스 노트를 생성하는 함수 (단타/롱노트 통합)
 * @param {number} stringNum - 베이스 줄 번호 (1번 줄 ~ 4번 줄)
 * @param {number} holdBeat - 롱노트 지속 박자 (생략하거나 0이면 단타 노트가 됨)
 */
function bass(stringNum, holdBeat = 0) {
  // 1~4번 줄을 시스템 배열 인덱스 0~3으로 안전하게 치환
  let laneIndex = constrain(stringNum - 1, 0, CONFIG.LANE_COUNT - 1);
  
  // 현재까지 쌓인 박자 카운터를 밀리초(ms) 타임라인 시간으로 정밀하게 변환
  let startTimeMs = beatToTime(currentBeatTracker) * 1000;
  
  if (holdBeat <= 0) {
    // [단타 노트 추가]
    notes.push({
      type: 'short',
      time: startTimeMs,
      lane: laneIndex,
      active: true,
      missed: false
    });
  } else {
    // [롱노트 추가]
    let endTimeMs = beatToTime(currentBeatTracker + holdBeat) * 1000;
    notes.push({
      type: 'hold',
      time: startTimeMs,
      endTime: endTimeMs,
      lane: laneIndex,
      active: true,
      missed: false,
      headHit: false,
      holding: false
    });
  }
}

/**
 * 다음 노트가 찍힐 위치까지 타임라인 박자를 누적하며 밀어주는 함수
 * @param {number} restType - 쉼표 종류 (NOTE_4, NOTE_8 등)
 */
function rest(restType) {
  currentBeatTracker += restType;
}

// ============================================
// 🎨 UI 및 게임 색상/크기 커스텀 설정
// ============================================
const CONFIG = {
  LANE_COUNT: 4,
  TARGET_X: 150,               
  POINTER_SIZE: 43.2,          
};

const COLOR_CONFIG = {
  BACKGROUND: 20,              
  LANE_BASE: 80,               
  LANE_ACTIVE: 140,            
  TARGET_LINE: [255, 50, 50, 150], 
  
  // 🌟 판정 피드백 및 이펙트 색상 (BAD 제거)
  PERFECT: [0, 255, 200],      
  GREAT: [255, 220, 0],         
  BREAK: [255, 100, 100],      
  MISS: [255, 50, 50],         
  
  // 노트 색상
  NOTE_NORMAL: [255, 220, 0],  
  NOTE_LONG: [255, 150, 0],    
};

// 🌟 [수정] 시간 기반 판정 기준 오차 정의 (PERFECT, GREAT, MISS 3단계)
const JUDGE_WINDOW = {
  // 1. 일찍 치는 경우 (Early) 허용 범위 - 노트가 판정선에 오기 전
  EARLY_PERFECT: 90,   // 판정선 전 45ms 이내
  EARLY_GREAT: 220,     // 🌟 판정선 전 220ms까지 너그럽게 인정 (일찍 쳐도 입력 허용!)

  // 2. 늦게 치는 경우 (Late) 허용 범위 - 노트가 판정선을 지나간 후
  LATE_PERFECT: 90,    // 판정선 지난 후 45ms 이내
  LATE_GREAT: 100       // 판정선 지난 후 100ms까지만 인정 (늦게 치는 건 칼판정)
};

// ============================================
// 게임 시스템 변수
// ============================================
let lanesY = [];
let laneSpacing = 0;       
let targetPointerY = 0;   
let laneHitZones = [];    

let NOTE_HEIGHT = 24;
let SCROLL_SPEED = 500;        
let AUDIO_OFFSET = 0; 

let notes = [];
let currentTime = 0;
let myFont; 
let bgm;
let isGameStarted = false; 
let isInputPressed = false;    

// BPM 및 판정 시스템
let gameBPM = 126;
let lastJudgment = null;
let judgmentTime = 0;
let score = 0;
let combo = 0;

// 이펙트 파편 시스템
let hitEffects = [];

function setGameBPM(bpm) {
  gameBPM = bpm;
}

function beatToTime(beat) {
  return (beat * 60) / gameBPM;
}

function calcNoteX(noteTime) {
  let timeDiff = noteTime - (currentTime + AUDIO_OFFSET);
  return CONFIG.TARGET_X + (timeDiff / 1000) * SCROLL_SPEED;
}

// ============================================
// 초기화 및 스케일 제어
// ============================================
function preload() {
  try {
    myFont = loadFont('Paperlogy-7Bold.ttf');
  } catch(e) {
    console.log("기본 폰트로 대체합니다.");
  }
  bgm = loadSound('126.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateGameScale();
  if (myFont) textFont(myFont);
  
  targetPointerY = height / 2;
  createChart(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateGameScale();
}

function updateGameScale() {
  lanesY = [];
  laneHitZones = [];
  
  let baseSpacing = height / (CONFIG.LANE_COUNT + 1);
  laneSpacing = baseSpacing * 0.6; 
  
  let totalHeight = laneSpacing * (CONFIG.LANE_COUNT - 1);
  let startY = (height - totalHeight) / 2;
  let zoneHeight = laneSpacing / 2; 

  for (let i = 0; i < CONFIG.LANE_COUNT; i++) {
    let y = startY + (laneSpacing * i);
    lanesY.push(y);
    laneHitZones.push({
      upper: y - zoneHeight,
      lower: y + zoneHeight
    });
  }
  
  SCROLL_SPEED = width * 0.55; 
}

// ============================================
// 게임 메인 루프
// ============================================
function draw() {
  background(COLOR_CONFIG.BACKGROUND);
  
  if (!isGameStarted) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(max(16, width * 0.02));
    text("화면을 클릭하면 음악과 함께 게임이 시작됩니다.", width / 2, height / 2);
    return;
  }
  
  currentTime = bgm.currentTime() * 1000;
  
  targetPointerY = lerp(targetPointerY, mouseY, 0.8);
  let activeLane = getCurrentHitLane();
  
  drawBeatLines();
  drawLanes(activeLane);
  drawNotes();
  checkMissedNotes(activeLane);
  drawHitEffects();      
  drawUI();
}

function getCurrentHitLane() {
  for (let i = 0; i < CONFIG.LANE_COUNT; i++) {
    if (targetPointerY >= laneHitZones[i].upper && targetPointerY < laneHitZones[i].lower) {
      return i;
    }
  }
  return -1; 
}

function drawBeatLines() {
  let beatDuration = (60 / gameBPM);  
  let currentSec = (currentTime + AUDIO_OFFSET) / 1000;
  let startBeat = Math.floor(currentSec / beatDuration) - 2;
  
  for (let i = startBeat; i < startBeat + 12; i++) {
    let beatTime = i * beatDuration * 1000;
    let x = calcNoteX(beatTime);
    
    if (x > 0 && x < width) {
      if (i % 4 === 0) {
        stroke(150, 150, 200, 120);
        strokeWeight(3);
      } else {
        stroke(100, 100, 150, 50);
        strokeWeight(1.5);
      }
      line(x, lanesY[0] - 30, x, lanesY[CONFIG.LANE_COUNT - 1] + 30);
    }
  }
}

function drawLanes(activeLane) {
  for (let i = 0; i < CONFIG.LANE_COUNT; i++) {
    stroke(i === activeLane ? COLOR_CONFIG.LANE_ACTIVE : COLOR_CONFIG.LANE_BASE);
    strokeWeight(6 - i * 1.2);
    line(0, lanesY[i], width, lanesY[i]);
  }
  
  stroke(COLOR_CONFIG.TARGET_LINE[0], COLOR_CONFIG.TARGET_LINE[1], COLOR_CONFIG.TARGET_LINE[2], COLOR_CONFIG.TARGET_LINE[3]);
  strokeWeight(4);
  line(CONFIG.TARGET_X, 0, CONFIG.TARGET_X, height);
  
  noStroke();
  fill(COLOR_CONFIG.PERFECT[0], COLOR_CONFIG.PERFECT[1], COLOR_CONFIG.PERFECT[2], 200);
  ellipse(CONFIG.TARGET_X, targetPointerY, CONFIG.POINTER_SIZE, CONFIG.POINTER_SIZE);
  
  if (isInputPressed) {
    fill(COLOR_CONFIG.PERFECT[0], COLOR_CONFIG.PERFECT[1], COLOR_CONFIG.PERFECT[2], 60);
    ellipse(CONFIG.TARGET_X, targetPointerY, CONFIG.POINTER_SIZE * 1.8, CONFIG.POINTER_SIZE * 1.8);
  }
}

function drawNotes() {
  for (let note of notes) {
    if (!note.active) continue;
    
    let y = lanesY[note.lane];
    
    if (note.type === 'short') {
      let x = calcNoteX(note.time);
      if (x < -50 || x > width + 50) continue;
      
      fill(0, 0, 0, 100);
      rect(x - 13, y - 13, 30, 30, 6); 
      
      fill(COLOR_CONFIG.NOTE_NORMAL);
      stroke(255);
      strokeWeight(1.5);
      rect(x - 15, y - 15, 30, 30, 6);
    } 
    else if (note.type === 'hold') {
      let xStart = calcNoteX(note.time);
      let xEnd = calcNoteX(note.endTime);
      
      if (xStart > width + 50 && xEnd > width + 50) continue;
      if (xEnd < -50 && xStart < -50) continue;
      
      let xLeft = note.holding ? CONFIG.TARGET_X : xStart;
      let xRight = xEnd;
      
      if (xRight > xLeft) {
        fill(COLOR_CONFIG.NOTE_LONG[0], COLOR_CONFIG.NOTE_LONG[1], COLOR_CONFIG.NOTE_LONG[2], 130);
        stroke(COLOR_CONFIG.NOTE_LONG);
        strokeWeight(2);
        rect(xLeft, y - 12, xRight - xLeft, NOTE_HEIGHT, 8);
      }
      
      if (!note.headHit) {
        fill(255);
        stroke(COLOR_CONFIG.NOTE_LONG);
        strokeWeight(2);
        rect(xStart - 15, y - 15, 30, 30, 6);
      }
      
      fill(255, 255, 255, 220);
      noStroke();
      rect(xEnd - 2, y - 12, 4, NOTE_HEIGHT, 1);
    }
  }
}

function checkMissedNotes(activeLane) {
  let playTime = currentTime + AUDIO_OFFSET;

  for (let note of notes) {
    if (note.active && !note.missed) {
      
      if (note.type === 'short') {
        // 🌟 GREAT 범위를 넘어가면 가차없이 MISS 처리
        if (playTime > note.time + JUDGE_WINDOW.GREAT) {  
          triggerMiss(note, 'MISS (OVER)');
        }
      } 
      else if (note.type === 'hold') {
        if (!note.headHit && playTime > note.time + JUDGE_WINDOW.GREAT) {
          triggerMiss(note, 'MISS (OVER)');
        }
        else if (note.holding) {
          if (!isInputPressed || activeLane !== note.lane) {
            note.active = false;
            note.holding = false;
            note.missed = true;
            triggerFeedback('BREAK', 'RELEASED');
            combo = 0;
            continue;
          }
          
          if (frameCount % 4 === 0) {
            hitEffects.push({
              x: CONFIG.TARGET_X, y: lanesY[note.lane],
              time: millis(), color: COLOR_CONFIG.NOTE_LONG, sizeFactor: 0.6
            });
          }
          
          if (playTime > note.endTime + JUDGE_WINDOW.GREAT) {
            note.active = false;
            note.holding = false;
            triggerFeedback('MISS', 'HOLD OVER');
            combo = 0;
          }
        }
      }
    }
  }
}

function triggerMiss(note, reason) {
  note.active = false;
  note.missed = true;
  note.holding = false;
  triggerFeedback('MISS', reason);
  combo = 0;
}

// ============================================
// 🌟 3단계(PERFECT, GREAT, MISS) 판정 엔진
// ============================================
function handleInput(activeLane) {
  if (activeLane === -1) return;
  
  let closestNote = null;
  let minTimeDiff = Infinity; 
  let playTime = currentTime + AUDIO_OFFSET;
  let isEarly = false; // 일찍 쳤는지 늦게 쳤는지 기억할 변수
  
  for (let note of notes) {
    if (note.lane === activeLane && note.active) {
      if (note.type === 'hold' && note.headHit) continue; 
      
      // timeDiff가 음수면 Early(일찍 침), 양수면 Late(늦게 침)
      let timeDiff = note.time - playTime; 
      let absDiff = Math.abs(timeDiff);
      
      // 판정 범위 내에 들어왔는지 검사 (Early와 Late의 기준을 다르게 적용)
      if (timeDiff >= 0 && absDiff <= JUDGE_WINDOW.EARLY_GREAT) {
        // [Early 조건 만족] 노트가 아직 도달 안 했고, 얼리 굿 범위 안일 때
        if (absDiff < minTimeDiff) {
          minTimeDiff = absDiff;
          closestNote = note;
          isEarly = true;
        }
      } 
      else if (timeDiff < 0 && absDiff <= JUDGE_WINDOW.LATE_GREAT) {
        // [Late 조건 만족] 노트가 판정선을 지나쳤고, 레이트 굿 범위 안일 때
        if (absDiff < minTimeDiff) {
          minTimeDiff = absDiff;
          closestNote = note;
          isEarly = false;
        }
      }
    }
  }
  
  // 🌟 최종 판정 및 UI 피드백 설정
  if (closestNote) {
    let judgment = '';
    let effectColor = [255, 255, 255];
    
    // 퍼펙트 범위 검사 (퍼펙트는 앞뒤 똑같이 45ms)
    let maxPerfectWindow = isEarly ? JUDGE_WINDOW.EARLY_PERFECT : JUDGE_WINDOW.LATE_PERFECT;
    
    if (minTimeDiff <= maxPerfectWindow) {
      judgment = 'PERFECT';
      effectColor = COLOR_CONFIG.PERFECT;
      score += 100; combo++;
    } else {
      judgment = 'GREAT';
      effectColor = COLOR_CONFIG.GREAT;
      score += 50; combo++;
    }
    
    if (closestNote.type === 'short') {
      closestNote.active = false; 
    } else if (closestNote.type === 'hold') {
      closestNote.headHit = true; 
      closestNote.holding = true; 
    }
    
    // UI에 일찍 쳤는지(FAST), 늦게 쳤는지(SLOW) 체감 가이드 표시 추가
    let directionLabel = isEarly ? "FAST" : "SLOW";
    triggerFeedback(judgment, `${minTimeDiff.toFixed(1)}ms (${directionLabel})`);
    
    hitEffects.push({
      x: CONFIG.TARGET_X, y: lanesY[activeLane],
      time: millis(), color: effectColor, sizeFactor: 1.5
    });
  }
}

function handleRelease(activeLane) {
  let playTime = currentTime + AUDIO_OFFSET;

  for (let i = notes.length - 1; i >= 0; i--) {
    let note = notes[i];
    
    if (note.active && note.type === 'hold' && note.holding) {
      // timeDiff = 꼬리 예정시간 - 내가 뗀 시간 
      // (양수면 일찍 뗌, 음수면 늦게 뗌)
      let timeDiff = note.endTime - playTime; 
      let absDiff = Math.abs(timeDiff);
      
      // 🌟 [릴리즈 꿀팁] 꼬리가 도달하기 전 최대 250ms(0.25초) 일찍 떼는 것까지 인정!
      if ((timeDiff >= 0 && absDiff <= 250) || (timeDiff < 0 && absDiff <= JUDGE_WINDOW.LATE_GREAT)) {
        note.active = false;
        note.holding = false;
        triggerFeedback('PERFECT', 'HOLD CLEAR');
        score += 100; combo++;
        
        hitEffects.push({
          x: CONFIG.TARGET_X, y: lanesY[note.lane],
          time: millis(), color: COLOR_CONFIG.PERFECT, sizeFactor: 2.0
        });
        notes.splice(i, 1);
      } else {
        // 너무 대놓고 일찍 뗐을 때만 콤보 브레이크
        note.active = false;
        note.holding = false;
        note.missed = true;
        triggerFeedback('BREAK', 'EARLY RELEASE');
        combo = 0;
      }
      break;
    }
  }
}

// ============================================
// 입력 및 UI
// ============================================
function mousePressed() {
  if (!isGameStarted) {
    userStartAudio(); 
    isGameStarted = true;
    bgm.play();       
    return;
  }
  if (mouseButton === LEFT) {
    isInputPressed = true;
    let activeLane = getCurrentHitLane();
    handleInput(activeLane);
  }
}

function mouseReleased() {
  if (mouseButton === LEFT) {
    isInputPressed = false;
    let activeLane = getCurrentHitLane();
    handleRelease(activeLane);
  }
}

function keyPressed() {
  if (key === ' ') {
    isInputPressed = true;
    let activeLane = getCurrentHitLane();
    handleInput(activeLane);
  }
  if (key === "`") {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function keyReleased() {
  if (key === ' ') {
    isInputPressed = false;
    let activeLane = getCurrentHitLane();
    handleRelease(activeLane);
  }
}

function triggerFeedback(status, detail = '') {
  lastJudgment = {
    text: status,
    timing: detail,
    startScale: status === 'MISS' || status === 'BREAK' ? 1.4 : 1.2
  };
  judgmentTime = millis();
}

function drawHitEffects() {
  for (let i = hitEffects.length - 1; i >= 0; i--) {
    let effect = hitEffects[i];
    let age = millis() - effect.time;
    let maxAge = 400;
    
    if (age > maxAge) {
      hitEffects.splice(i, 1);
      continue;
    }
    
    let progress = age / maxAge;
    let alpha = 255 * (1 - progress);
    let size = (CONFIG.POINTER_SIZE * effect.sizeFactor) * (0.4 + progress * 1.4);
    
    noFill();
    stroke(effect.color[0], effect.color[1], effect.color[2], alpha);
    strokeWeight(3 - progress * 2);
    circle(effect.x, effect.y, size);
    
    fill(effect.color[0], effect.color[1], effect.color[2], alpha * 0.5);
    noStroke();
    circle(effect.x, effect.y, size * 0.3);
  }
}

function drawUI() {
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(18);
  text(`SCORE: ${score}`, 30, 30);
  text(`COMBO: ${combo}`, 30, 60);
  
  textSize(14);
  fill(150);
  text(`Time: ${(currentTime / 1000).toFixed(2)}s  |  FPS: ${Math.round(frameRate())}`, 30, height - 40);

  if (lastJudgment && millis() - judgmentTime < 800) {
    let elapsed = millis() - judgmentTime;
    let currentScale = 1.0;
    
    let t = elapsed / 800;
    let easeOutExp = (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
    currentScale = 1.0 + (lastJudgment.startScale - 1.0) * (1 - easeOutExp);
    
    push();
    translate(width / 2 + 100, height / 2 - 40); 
    scale(currentScale);
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.038);
    
    let col = COLOR_CONFIG[lastJudgment.text] || [255, 255, 255];
    fill(col[0], col[1], col[2]);
    
    text(lastJudgment.text, 0, 0);
    pop();
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.016);
    fill(255, 255, 255, 120);
    text(lastJudgment.timing, width / 2 + 100, height / 2 + 15);
  }
}

export function playBass() {
    console.log("베이스 연주 시작!");
}
