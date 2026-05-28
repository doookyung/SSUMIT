// ============================================
// 🎵 곡 정보 및 BPM 설정
// ============================================
const bassSONG_BPM = 126; 

// ============================================
// 📝 직관적인 채보 작성을 위한 음표/쉼표 단위 정의 (4분음표 = 1.0)
// ============================================
const bassNOTE_1   = 4.0;   // 온음표 (4박자)
const bassNOTE_2   = 2.0;   // 2분음표 (2박자)
const bassNOTE_4   = 1.0;   // 4분음표 (1박자) - 기본 정박
const bassNOTE_8   = 0.5;   // 8분음표 (0.5박자)
const bassNOTE_16  = 0.25;  // 16분음표 (0.25박자)

const bassNOTE_D4  = 1.5;   // 점4분음표 (1.5박자)
const bassNOTE_D8  = 0.75;  // 점8분음표 (0.75박자)
const bassNOTE_TR  = 1 / 3; // 셋잇단음표 (약 0.33박자)

// --- 🥁 누적 박자 기반 채보 시스템 변수 ---
let bassCurrentBeatTracker = 0; // 누적 박자(Beat) 카운터

// ============================================
// 🎨 UI 및 게임 색상/크기 커스텀 설정
// ============================================
const bassCONFIG = {
  LANE_COUNT: 4,
  TARGET_X: 150,               
  POINTER_SIZE: 43.2,          
};

const bassCOLOR_CONFIG = {
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
const bassJUDGE_WINDOW = {
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
let bassLanesY = [];
let bassLaneSpacing = 0;       
let bassTargetPointerY = 0;   
let bassLaneHitZones = [];    

let bassNOTE_HEIGHT = 24;
let bassSCROLL_SPEED = 500;        
let bassAUDIO_OFFSET = 0; 

let bassNotes = [];
let bassCurrentTime = 0;
let bassFont; 
let bassIsGameStarted = false; 
let bassIsInputPressed = false;    

// BPM 및 판정 시스템
let bassGameBPM = 126;
let bassLastJudgment = null;
let bassJudgmentTime = 0;
let bassScore = 0;
let bassCombo = 0;

// 이펙트 파편 시스템
let bassHitEffects = [];

function bassSetGameBPM(bpm) {
  bassGameBPM = bpm;
}

function bassBeatToTime(beat) {
  return (beat * 60) / bassGameBPM;
}

function bassCalcNoteX(noteTime) {
  let timeDiff = noteTime - (bassCurrentTime + bassAUDIO_OFFSET);
  return bassCONFIG.TARGET_X + (timeDiff / 1000) * bassSCROLL_SPEED;
}

// ============================================
// 초기화 및 스케일 제어
// ============================================
function bassPreload() {
  // try {
  //   bassFont = loadFont('Paperlogy-7Bold.ttf');
  // } catch(e) {
  //   console.log("기본 폰트로 대체합니다.");
  // }
}

/**
 * 🎸 채보 초기화 및 악보 작성 구역
 * sketch.js의 setup() 단계에서 자동으로 호출됩니다.
 */
function bassCreateChart() {
  bassSetGameBPM(bassSONG_BPM); 
  
  // 데이터 초기화
  bassNotes = [];
  bassCurrentBeatTracker = 0; 
  
  //9마디
  bassPlay(4, bassNOTE_4); bassRest(bassNOTE_4);
  bassRest(bassNOTE_8);
  bassPlay(4); bassRest(bassNOTE_8);
  bassRest(bassNOTE_2);
  
  //10마디
  bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(4); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  
  //11마디
  bassPlay(3, bassNOTE_4); bassRest(bassNOTE_4);
  bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassRest(bassNOTE_2);
  
  //12마디
  bassRest(bassNOTE_8);
  bassPlay(4); bassRest(bassNOTE_8);
  bassRest(bassNOTE_8);
  bassPlay(4); bassRest(bassNOTE_8);
  bassRest(bassNOTE_8);
  bassPlay(4); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(4); bassRest(bassNOTE_8);
  
  //13마디
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  
  //14마디
  bassPlay(3, bassNOTE_4); bassRest(bassNOTE_4);
  bassRest(bassNOTE_8);
  bassPlay(3, bassNOTE_4); bassRest(bassNOTE_4+bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_4);
  
  //15마디
  bassPlay(3, bassNOTE_4); bassRest(bassNOTE_4+bassNOTE_8);
  bassPlay(2, bassNOTE_4); bassRest(bassNOTE_4+bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_4);
  
  //16마디
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
  bassPlay(3); bassRest(bassNOTE_8);
  bassPlay(1); bassRest(bassNOTE_8);
}

// ============================================
// ⚙️ 누적 박자 계산식 내부 시스템 함수
// ============================================

/**
 * 베이스 노트를 생성하는 함수 (단타/롱노트 통합)
 * @param {number} stringNum - 베이스 줄 번호 (1번 줄 ~ 4번 줄)
 * @param {number} holdBeat - 롱노트 지속 박자 (생략하거나 0이면 단타 노트가 됨)
 */
function bassPlay(stringNum, holdBeat = 0) {
  // 1~4번 줄을 시스템 배열 인덱스 0~3으로 안전하게 치환
  let laneIndex = constrain(stringNum - 1, 0, bassCONFIG.LANE_COUNT - 1);
  
  // 현재까지 쌓인 박자 카운터를 밀리초(ms) 타임라인 시간으로 정밀하게 변환
  let startTimeMs = bassBeatToTime(bassCurrentBeatTracker) * 1000;
  
  if (holdBeat <= 0) {
    // [단타 노트 추가]
    bassNotes.push({
      type: 'short',
      time: startTimeMs,
      lane: laneIndex,
      active: true,
      missed: false
    });
  } else {
    // [롱노트 추가]
    let endTimeMs = bassBeatToTime(bassCurrentBeatTracker + holdBeat) * 1000;
    bassNotes.push({
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
function bassRest(restType) {
  bassCurrentBeatTracker += restType;
}

function bassSetup() {
  // createCanvas(windowWidth, windowHeight);
  bassUpdateGameScale();
  if (bassFont) textFont(bassFont);
  
  bassTargetPointerY = height / 2;
  bassCreateChart(); 
}

function bassWindowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bassUpdateGameScale();
}

function bassUpdateGameScale() {
  bassLanesY = [];
  bassLaneHitZones = [];
  
  let baseSpacing = height / (bassCONFIG.LANE_COUNT + 1);
  bassLaneSpacing = baseSpacing * 0.6; 
  
  let totalHeight = bassLaneSpacing * (bassCONFIG.LANE_COUNT - 1);
  let startY = (height - totalHeight) / 2;
  let zoneHeight = bassLaneSpacing / 2; 

  for (let i = 0; i < bassCONFIG.LANE_COUNT; i++) {
    let y = startY + (bassLaneSpacing * i);
    bassLanesY.push(y);
    bassLaneHitZones.push({
      upper: y - zoneHeight,
      lower: y + zoneHeight
    });
  }
  
  bassSCROLL_SPEED = width * 0.55; 
}

// ============================================
// 게임 메인 루프
// ============================================
function bassDraw() {
  background(bassCOLOR_CONFIG.BACKGROUND);
  
  if (!bassIsGameStarted) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(max(16, width * 0.02));
    text("화면을 클릭하면 음악과 함께 게임이 시작됩니다.", width / 2, height / 2);
    return;
  }
  
  // 메인 타워에서 주는 globalTime 변수로 변경 완료!
  bassCurrentTime = globalTime;
  
  bassTargetPointerY = lerp(bassTargetPointerY, mouseY, 0.8);
  let activeLane = bassGetCurrentHitLane();
  
  bassDrawBeatLines();
  bassDrawLanes(activeLane);
  bassDrawNotes();
  bassCheckMissedNotes(activeLane);
  bassDrawHitEffects();      
  bassDrawUI();
}

function bassGetCurrentHitLane() {
  for (let i = 0; i < bassCONFIG.LANE_COUNT; i++) {
    if (bassTargetPointerY >= bassLaneHitZones[i].upper && bassTargetPointerY < bassLaneHitZones[i].lower) {
      return i;
    }
  }
  return -1; 
}

function bassDrawBeatLines() {
  let beatDuration = (60 / bassGameBPM);  
  let currentSec = (bassCurrentTime + bassAUDIO_OFFSET) / 1000;
  let startBeat = Math.floor(currentSec / beatDuration) - 2;
  
  for (let i = startBeat; i < startBeat + 12; i++) {
    let beatTime = i * beatDuration * 1000;
    let x = bassCalcNoteX(beatTime);
    
    if (x > 0 && x < width) {
      if (i % 4 === 0) {
        stroke(150, 150, 200, 120);
        strokeWeight(3);
      } else {
        stroke(100, 100, 150, 50);
        strokeWeight(1.5);
      }
      line(x, bassLanesY[0] - 30, x, bassLanesY[bassCONFIG.LANE_COUNT - 1] + 30);
    }
  }
}

function bassDrawLanes(activeLane) {
  for (let i = 0; i < bassCONFIG.LANE_COUNT; i++) {
    stroke(i === activeLane ? bassCOLOR_CONFIG.LANE_ACTIVE : bassCOLOR_CONFIG.LANE_BASE);
    strokeWeight(6 - i * 1.2);
    line(0, bassLanesY[i], width, bassLanesY[i]);
  }
  
  stroke(bassCOLOR_CONFIG.TARGET_LINE[0], bassCOLOR_CONFIG.TARGET_LINE[1], bassCOLOR_CONFIG.TARGET_LINE[2], bassCOLOR_CONFIG.TARGET_LINE[3]);
  strokeWeight(4);
  line(bassCONFIG.TARGET_X, 0, bassCONFIG.TARGET_X, height);
  
  noStroke();
  fill(bassCOLOR_CONFIG.PERFECT[0], bassCOLOR_CONFIG.PERFECT[1], bassCOLOR_CONFIG.PERFECT[2], 200);
  ellipse(bassCONFIG.TARGET_X, bassTargetPointerY, bassCONFIG.POINTER_SIZE, bassCONFIG.POINTER_SIZE);
  
  if (bassIsInputPressed) {
    fill(bassCOLOR_CONFIG.PERFECT[0], bassCOLOR_CONFIG.PERFECT[1], bassCOLOR_CONFIG.PERFECT[2], 60);
    ellipse(bassCONFIG.TARGET_X, bassTargetPointerY, bassCONFIG.POINTER_SIZE * 1.8, bassCONFIG.POINTER_SIZE * 1.8);
  }
}

function bassDrawNotes() {
  for (let note of bassNotes) {
    if (!note.active) continue;
    
    let y = bassLanesY[note.lane];
    
    if (note.type === 'short') {
      let x = bassCalcNoteX(note.time);
      if (x < -50 || x > width + 50) continue;
      
      fill(0, 0, 0, 100);
      rect(x - 13, y - 13, 30, 30, 6); 
      
      fill(bassCOLOR_CONFIG.NOTE_NORMAL);
      stroke(255);
      strokeWeight(1.5);
      rect(x - 15, y - 15, 30, 30, 6);
    } 
    else if (note.type === 'hold') {
      let xStart = bassCalcNoteX(note.time);
      let xEnd = bassCalcNoteX(note.endTime);
      
      if (xStart > width + 50 && xEnd > width + 50) continue;
      if (xEnd < -50 && xStart < -50) continue;
      
      let xLeft = note.holding ? bassCONFIG.TARGET_X : xStart;
      let xRight = xEnd;
      
      if (xRight > xLeft) {
        fill(bassCOLOR_CONFIG.NOTE_LONG[0], bassCOLOR_CONFIG.NOTE_LONG[1], bassCOLOR_CONFIG.NOTE_LONG[2], 130);
        stroke(bassCOLOR_CONFIG.NOTE_LONG);
        strokeWeight(2);
        rect(xLeft, y - 12, xRight - xLeft, bassNOTE_HEIGHT, 8);
      }
      
      if (!note.headHit) {
        fill(255);
        stroke(bassCOLOR_CONFIG.NOTE_LONG);
        strokeWeight(2);
        rect(xStart - 15, y - 15, 30, 30, 6);
      }
      
      fill(255, 255, 255, 220);
      noStroke();
      rect(xEnd - 2, y - 12, 4, bassNOTE_HEIGHT, 1);
    }
  }
}

function bassCheckMissedNotes(activeLane) {
  let playTime = bassCurrentTime + bassAUDIO_OFFSET;

  for (let note of bassNotes) {
    if (note.active && !note.missed) {
      
      if (note.type === 'short') {
        if (playTime > note.time + bassJUDGE_WINDOW.GREAT) {  
          bassTriggerMiss(note, 'MISS (OVER)');
        }
      } 
      else if (note.type === 'hold') {
        if (!note.headHit && playTime > note.time + bassJUDGE_WINDOW.GREAT) {
          bassTriggerMiss(note, 'MISS (OVER)');
        }
        else if (note.holding) {
          if (!bassIsInputPressed || activeLane !== note.lane) {
            note.active = false;
            note.holding = false;
            note.missed = true;
            bassTriggerFeedback('BREAK', 'RELEASED');
            bassCombo = 0;
            continue;
          }
          
          if (frameCount % 4 === 0) {
            bassHitEffects.push({
              x: bassCONFIG.TARGET_X, y: bassLanesY[note.lane],
              time: millis(), color: bassCOLOR_CONFIG.NOTE_LONG, sizeFactor: 0.6
            });
          }
          
          if (playTime > note.endTime + bassJUDGE_WINDOW.GREAT) {
            note.active = false;
            note.holding = false;
            bassTriggerFeedback('MISS', 'HOLD OVER');
            bassCombo = 0;
          }
        }
      }
    }
  }
}

function bassTriggerMiss(note, reason) {
  note.active = false;
  note.missed = true;
  note.holding = false;
  bassTriggerFeedback('MISS', reason);
  bassCombo = 0;
}

// ============================================
// 🌟 3단계(PERFECT, GREAT, MISS) 판정 엔진
// ============================================
function bassHandleInput(activeLane) {
  if (activeLane === -1) return;
  
  let closestNote = null;
  let minTimeDiff = Infinity; 
  let playTime = bassCurrentTime + bassAUDIO_OFFSET;
  let isEarly = false; 
  
  for (let note of bassNotes) {
    if (note.lane === activeLane && note.active) {
      if (note.type === 'hold' && note.headHit) continue; 
      
      let timeDiff = note.time - playTime; 
      let absDiff = Math.abs(timeDiff);
      
      if (timeDiff >= 0 && absDiff <= bassJUDGE_WINDOW.EARLY_GREAT) {
        if (absDiff < minTimeDiff) {
          minTimeDiff = absDiff;
          closestNote = note;
          isEarly = true;
        }
      } 
      else if (timeDiff < 0 && absDiff <= bassJUDGE_WINDOW.LATE_GREAT) {
        if (absDiff < minTimeDiff) {
          minTimeDiff = absDiff;
          closestNote = note;
          isEarly = false;
        }
      }
    }
  }
  
  if (closestNote) {
    let judgment = '';
    let effectColor = [255, 255, 255];
    
    let maxPerfectWindow = isEarly ? bassJUDGE_WINDOW.EARLY_PERFECT : bassJUDGE_WINDOW.LATE_PERFECT;
    
    if (minTimeDiff <= maxPerfectWindow) {
      judgment = 'PERFECT';
      effectColor = bassCOLOR_CONFIG.PERFECT;
      bassScore += 100; bassCombo++;
    } else {
      judgment = 'GREAT';
      effectColor = bassCOLOR_CONFIG.GREAT;
      bassScore += 50; bassCombo++;
    }
    
    if (closestNote.type === 'short') {
      closestNote.active = false; 
    } else if (closestNote.type === 'hold') {
      closestNote.headHit = true; 
      closestNote.holding = true; 
    }
    
    let directionLabel = isEarly ? "FAST" : "SLOW";
    bassTriggerFeedback(judgment, `${minTimeDiff.toFixed(1)}ms (${directionLabel})`);
    
    bassHitEffects.push({
      x: bassCONFIG.TARGET_X, y: bassLanesY[activeLane],
      time: millis(), color: effectColor, sizeFactor: 1.5
    });
  }
}

function bassHandleRelease(activeLane) {
  let playTime = bassCurrentTime + bassAUDIO_OFFSET;

  for (let i = bassNotes.length - 1; i >= 0; i--) {
    let note = bassNotes[i];
    
    if (note.active && note.type === 'hold' && note.holding) {
      let timeDiff = note.endTime - playTime; 
      let absDiff = Math.abs(timeDiff);
      
      if ((timeDiff >= 0 && absDiff <= 250) || (timeDiff < 0 && absDiff <= bassJUDGE_WINDOW.LATE_GREAT)) {
        note.active = false;
        note.holding = false;
        bassTriggerFeedback('PERFECT', 'HOLD CLEAR');
        bassScore += 100; bassCombo++;
        
        bassHitEffects.push({
          x: bassCONFIG.TARGET_X, y: bassLanesY[note.lane],
          time: millis(), color: bassCOLOR_CONFIG.PERFECT, sizeFactor: 2.0
        });
        bassNotes.splice(i, 1);
      } else {
        note.active = false;
        note.holding = false;
        note.missed = true;
        bassTriggerFeedback('BREAK', 'EARLY RELEASE');
        bassCombo = 0;
      }
      break;
    }
  }
}

// ============================================
// 입력 및 UI
// ============================================
function bassMousePressed() {
  if (!bassIsGameStarted) {
    bassIsGameStarted = true;
    return;
  }
  if (mouseButton === LEFT) {
    bassIsInputPressed = true;
    let activeLane = bassGetCurrentHitLane();
    bassHandleInput(activeLane);
  }
}

function bassMouseReleased() {
  if (mouseButton === LEFT) {
    bassIsInputPressed = false;
    let activeLane = bassGetCurrentHitLane();
    bassHandleRelease(activeLane);
  }
}

function bassKeyPressed() {
  if (key === ' ') {
    bassIsInputPressed = true;
    let activeLane = bassGetCurrentHitLane();
    bassHandleInput(activeLane);
  }
  if (key === "`") {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function bassKeyReleased() {
  if (key === ' ') {
    bassIsInputPressed = false;
    let activeLane = bassGetCurrentHitLane();
    bassHandleRelease(activeLane);
  }
}

function bassTriggerFeedback(status, detail = '') {
  bassLastJudgment = {
    text: status,
    timing: detail,
    startScale: status === 'MISS' || status === 'BREAK' ? 1.4 : 1.2
  };
  bassJudgmentTime = millis();
}

function bassDrawHitEffects() {
  for (let i = bassHitEffects.length - 1; i >= 0; i--) {
    let effect = bassHitEffects[i];
    let age = millis() - effect.time;
    let maxAge = 400;
    
    if (age > maxAge) {
      bassHitEffects.splice(i, 1);
      continue;
    }
    
    let progress = age / maxAge;
    let alpha = 255 * (1 - progress);
    let size = (bassCONFIG.POINTER_SIZE * effect.sizeFactor) * (0.4 + progress * 1.4);
    
    noFill();
    stroke(effect.color[0], effect.color[1], effect.color[2], alpha);
    strokeWeight(3 - progress * 2);
    circle(effect.x, effect.y, size);
    
    fill(effect.color[0], effect.color[1], effect.color[2], alpha * 0.5);
    noStroke();
    circle(effect.x, effect.y, size * 0.3);
  }
}

function bassDrawUI() {
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(18);
  text(`SCORE: ${bassScore}`, 30, 30);
  text(`COMBO: ${bassCombo}`, 30, 60);
  
  textSize(14);
  fill(150);
  text(`Time: ${(bassCurrentTime / 1000).toFixed(2)}s  |  FPS: ${Math.round(frameRate())}`, 30, height - 40);

  if (bassLastJudgment && millis() - bassJudgmentTime < 800) {
    let elapsed = millis() - bassJudgmentTime;
    let currentScale = 1.0;
    
    let t = elapsed / 800;
    let easeOutExp = (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
    currentScale = 1.0 + (bassLastJudgment.startScale - 1.0) * (1 - easeOutExp);
    
    push();
    translate(width / 2 + 100, height / 2 - 40); 
    scale(currentScale);
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.038);
    
    let col = bassCOLOR_CONFIG[bassLastJudgment.text] || [255, 255, 255];
    fill(col[0], col[1], col[2]);
    
    text(bassLastJudgment.text, 0, 0);
    pop();
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.016);
    fill(255, 255, 255, 120);
    text(bassLastJudgment.timing, width / 2 + 100, height / 2 + 15);
  }
}

function bassPlayBass() {
    console.log("베이스 연주 시작!");
}
