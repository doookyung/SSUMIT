// ============================================
// 게임 설정 (공통)
// ============================================
const keyboardLANE_COUNT = 8;
let keyboardLANE_WIDTH = 80;
let keyboardTRACK_X_OFFSET = -100; 
let keyboardJUDGE_LINE_Y_OFFSET = 120;
let keyboardNOTE_HEIGHT = 15;
let keyboardNOTE_WIDTH = 70;
let keyboardSCROLL_SPEED = 200;

let keyboardAUDIO_OFFSET = -100; 

let keyboardNotes = [];
let keyboardCurrentTime = 0;
let keyboardJudgeLine;
let keyboardFont; 
let keyboardIsGameStarted = false; 

let keyboardJumpStartTime = 0;       
let keyboardTargetStartTimeSec = 0;  

//==========================================BPM
let keyboardGameBPM = 126;

// 판정 피드백 시스템
let keyboardLastJudgment = null;
let keyboardJudgmentTime = 0;

// 이펙트 시스템
let keyboardHitEffects = [];
let keyboardKeyPressEffects = [];

// ============================================
// 스코어, 콤보 및 웹캠 변수
// ============================================
let keyboardScore = 0;
let keyboardCombo = 0;
let keyboardMaxCombo = 0;
let keyboardComboScale = 1.0; 
let keyboardVideo; 

// BPM 설정
function keyboardSetGameBPM(bpm) {
  keyboardGameBPM = bpm;
}

// 비트를 시간(초)으로 변환 
function keyboardBeatToTime(beat) {
  return (beat * 60) / keyboardGameBPM;
}

// ============================================
// 초기화 및 채보 제작
// ============================================
function keyboardPreload() {
  // try {
  //   keyboardFont = loadFont('Paperlogy-7Bold.ttf');
  // } catch(e) {
  //   console.log("기본 폰트로 대체합니다.");
  // }
}

function keyboardSetup() {
  createCanvas(windowWidth, windowHeight);
  keyboardUpdateGameScale();
  if (keyboardFont) textFont(keyboardFont);
  
  keyboardCreateChart();

  // 카메라 초기화 및 캔버스 뒤 DOM 숨김 처리
  keyboardVideo = createCapture(VIDEO);
  keyboardVideo.hide(); 
}

function keyboardWindowResized() {
  resizeCanvas(windowWidth, windowHeight);
  keyboardUpdateGameScale();
}

function keyboardUpdateGameScale() {
  let trackWidth = min(windowWidth * 0.75, 800); 
  if (trackWidth < 450) trackWidth = windowWidth; 
  
  keyboardLANE_WIDTH = trackWidth / keyboardLANE_COUNT;
  keyboardNOTE_WIDTH = keyboardLANE_WIDTH * 0.85;
  
  keyboardTRACK_X_OFFSET = (windowWidth - trackWidth) / 2; 
  
  keyboardJUDGE_LINE_Y_OFFSET = windowHeight * 0.2;
  keyboardJudgeLine = windowHeight - keyboardJUDGE_LINE_Y_OFFSET;
  keyboardNOTE_HEIGHT = windowHeight * 0.02;
  keyboardSCROLL_SPEED = windowHeight * 0.6; 
}

function keyboardMousePressed() {
  if (!keyboardIsGameStarted) {
    keyboardIsGameStarted = true;
    return;
  }

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

// ============================================
// [박자 직관화] 1박자(4분음표) = 1.0 기준 채보 시스템
// ============================================
function keyboardCreateChart() {
  keyboardSetGameBPM(126); 
  
  keyboard_n(5, 4.0);
  keyboard_n(5, 5.0);
  keyboard_n(5, 6.0);
  keyboard_n(6, 6.5);
  keyboard_n(5, 7.0);
  keyboard_h(4, 7.5, 0.5);
  keyboard_h(4, 8.5, 0.5);
  keyboard_h(4, 9.5, 0.5);
  keyboard_n(6, 10.5);
  keyboard_n(5, 12.0);
  keyboard_n(5, 13.0);
  keyboard_n(5, 14.0);
  keyboard_n(6, 14.5);
  keyboard_n(5, 15.0);
  keyboard_h(4, 15.5, 1.5);
  keyboard_h(3, 17.0, 1.0);
  keyboard_h(2, 18.0, 1.0);
  keyboard_h(1, 19.0, 1.0);
  keyboard_h(2, 20.0, 2.0);
  keyboard_n(1, 23.0);
  keyboard_n(2, 24.0);
  keyboard_n(3, 24.5);
  keyboard_n(4, 25.0);
  keyboard_n(1, 25.5);
  keyboard_h(2, 28.0, 1.0);
  keyboard_h(3, 29.0, 1.0);
  keyboard_h(4, 30.0, 1.0);
  keyboard_h(5, 31.0, 1.0);
  keyboard_h(6, 32.0, 2.0);
  
  // 41마디 이후 채보 영역
  keyboard_n(2, 166.0);
  keyboard_n(4, 166.5);
  keyboard_n(5, 167.0);
  keyboard_n(6, 167.5);
  keyboard_n(5, 168.5);
  keyboard_n(4, 169.5);
  keyboard_n(3, 170.0);
  keyboard_n(4, 170.5);
  keyboard_n(4, 174.0);
  keyboard_n(4, 174.5);
  keyboard_n(4, 175.0);
  keyboard_n(4, 175.5);
  keyboard_n(4, 176.5);
  keyboard_n(5, 177.5);
  keyboard_n(4, 178.0);
  keyboard_n(2, 178.5);
  keyboard_n(2, 181.0);
  keyboard_n(3, 181.5);
  keyboard_n(4, 182.0);
  keyboard_n(7, 183.0);
  keyboard_n(7, 183.5);
  keyboard_n(6, 184.5);
}

// 단노트 생성 함수 (1박자 = 1.0 기준)
function keyboard_n(lane, beat) {
  keyboardNotes.push({
    type: 'short',
    time: keyboardBeatToTime(beat) * 1000, 
    lane: lane,
    active: true,
    missed: false
  });
}

// 롱노트 생성 함수
function keyboard_h(lane, startBeat, lengthBeat) {
  let endBeat = startBeat + lengthBeat;
  keyboardNotes.push({
    type: 'hold',
    time: keyboardBeatToTime(startBeat) * 1000,
    endTime: keyboardBeatToTime(endBeat) * 1000,
    lane: lane,
    active: true,
    missed: false,
    headHit: false, 
    holding: false  
  });
}

// ============================================
// 게임 루프 및 렌더링
// ============================================
function keyboardDraw() {
  background(20);
  
  if (!keyboardIsGameStarted) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(max(16, width * 0.02));
    text("화면을 클릭하면 음악과 함께 게임이 시작됩니다.", width / 2, height / 2);
    return;
  }
  
  // 메인 시스템 연동 타이머
  keyboardCurrentTime = globalTime;
  
  // 1. 사이드 배경 UI 렌더링
  keyboardDrawCustomLeftUI();  
  keyboardDrawCustomRightUI(); 
  
  // 2. 게임 플레이 영역 배경
  keyboardDrawBeatLines();
  keyboardDrawLanes();
  
  // 3. 게임 노트 렌더링
  keyboardDrawNotes();
  
  // 4. 피아노 건반 및 키 입력 이펙트
  keyboardDrawWhiteKeys();       
  keyboardDrawKeyPressEffects(); 
  keyboardDrawBlackKeys();       
  
  // 5. 판정선 및 상위 이펙트 시스템
  keyboardDrawJudgmentLine();
  keyboardCheckMissedNotes();
  keyboardDrawHitEffects();      
  keyboardDrawInfo();
}

function keyboardDrawCustomLeftUI() {
  let uiWidth = keyboardTRACK_X_OFFSET - 10;
  if (uiWidth <= 0) return;

  fill(15, 15, 25);
  noStroke();
  rect(0, 0, uiWidth, height);
  
  stroke(0, 230, 255, 40);
  strokeWeight(2);
  line(uiWidth, 0, uiWidth, height);

  textAlign(CENTER, CENTER);
  
  fill(0, 230, 255, 150);
  textSize(max(12, uiWidth * 0.1));
  text("SCORE", uiWidth / 2, height * 0.2);
  
  fill(255);
  textSize(max(18, uiWidth * 0.14));
  text(nf(keyboardScore, 6), uiWidth / 2, height * 0.25);

  if (keyboardCombo > 0) {
    keyboardComboScale = lerp(keyboardComboScale, 1.0, 0.1); 
    
    push();
    translate(uiWidth / 2, height * 0.45);
    scale(keyboardComboScale);
    
    fill(255, 200, 0, 30);
    textSize(max(24, uiWidth * 0.28));
    text(keyboardCombo, 0, 0);
    
    fill(255, 215, 0);
    textSize(max(22, uiWidth * 0.25));
    text(keyboardCombo, 0, -2);
    pop();

    fill(200, 200, 200);
    textSize(max(11, uiWidth * 0.09));
    text("COMBO", uiWidth / 2, height * 0.53);
  }

  fill(120, 120, 130);
  textSize(max(10, uiWidth * 0.08));
  text(`MAX COMBO  ${keyboardMaxCombo}`, uiWidth / 2, height * 0.75);
}

function keyboardDrawCustomRightUI() {
  let trackRightEdge = keyboardTRACK_X_OFFSET + keyboardLANE_WIDTH * keyboardLANE_COUNT;
  let uiWidth = width - trackRightEdge - 10;
  if (uiWidth <= 0) return;

  fill(15, 15, 25);
  noStroke();
  rect(trackRightEdge + 10, 0, uiWidth, height);
  
  stroke(255, 0, 128, 40);
  strokeWeight(2);
  line(trackRightEdge + 10, 0, trackRightEdge + 10, height);

  let startX = trackRightEdge + 25;
  let containerWidth = width - startX - 25;

  fill(255, 0, 128, 150);
  textSize(max(12, uiWidth * 0.1));
  textAlign(LEFT, TOP);
  text("PLAYER CAM", startX, height * 0.08);

  let camY = height * 0.13; 
  
  if (keyboardVideo && keyboardVideo.loadedmetadata) {
    let camAspect = keyboardVideo.height / keyboardVideo.width;
    let camHeight = containerWidth * camAspect;
    
    stroke(0, 230, 255, 150);
    strokeWeight(2);
    fill(0, 50);
    rect(startX - 2, camY - 2, containerWidth + 4, camHeight + 4, 4);
    
    image(keyboardVideo, startX, camY, containerWidth, camHeight);
  } else {
    fill(30);
    stroke(100);
    strokeWeight(1);
    rect(startX, camY, containerWidth, containerWidth * 0.75, 4);
    
    fill(150);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Loading Camera...", startX + containerWidth / 2, camY + (containerWidth * 0.75) / 2);
  }

  fill(140, 140, 150);
  textSize(max(11, uiWidth * 0.08));
  textAlign(LEFT, TOP);
  
  let infoY = height * 0.65;
  text(`SPEED : ${(keyboardSCROLL_SPEED/100).toFixed(1)}x`, startX, infoY);
  text(`SYNC  : ${keyboardAUDIO_OFFSET}ms`, startX, infoY + 25);
  text(`SONG  : Neon Beats (126)`, startX, infoY + 50);
}

function keyboardDrawBeatLines() {
  stroke(100, 100, 150, 100);
  strokeWeight(2);
  
  let beatDuration = (60 / keyboardGameBPM) * 4;  
  let currentMeasure = (keyboardCurrentTime + keyboardAUDIO_OFFSET) / 1000 / beatDuration;
  let startMeasure = Math.floor(currentMeasure) - 2;
  
  let trackWidth = keyboardLANE_WIDTH * keyboardLANE_COUNT;
  
  for (let i = startMeasure; i < startMeasure + 15; i++) {
    let beatTime = i * beatDuration * 1000;
    let y = keyboardCalcNoteY(beatTime);
    
    if (y > -50 && y < keyboardJudgeLine + 100) {
      if (i % 4 === 0) {
        stroke(150, 150, 200, 150);
        strokeWeight(3);
      } else {
        stroke(100, 100, 150, 80);
        strokeWeight(1.5);
      }
      line(keyboardTRACK_X_OFFSET, y, keyboardTRACK_X_OFFSET + trackWidth, y);
    }
  }
}

function keyboardDrawLanes() {
  stroke(80);
  strokeWeight(2);
  for (let i = 0; i <= keyboardLANE_COUNT; i++) {
    let x = keyboardTRACK_X_OFFSET + i * keyboardLANE_WIDTH;
    line(x, 0, x, keyboardJudgeLine);
  }
}

function keyboardDrawJudgmentLine() {
  let trackWidth = keyboardLANE_WIDTH * keyboardLANE_COUNT;
  stroke(255, 50, 50);
  strokeWeight(4);
  line(keyboardTRACK_X_OFFSET, keyboardJudgeLine, keyboardTRACK_X_OFFSET + trackWidth, keyboardJudgeLine);
  
  noStroke();
  fill(255, 50, 50, 30);
  rect(keyboardTRACK_X_OFFSET, keyboardJudgeLine - 2, trackWidth, 4);
}

function keyboardCalcNoteY(noteTime) {
  let timeDiff = noteTime - (keyboardCurrentTime + keyboardAUDIO_OFFSET);
  return keyboardJudgeLine - (timeDiff / 1000) * keyboardSCROLL_SPEED;
}

function keyboardDrawNotes() {
  for (let note of keyboardNotes) {
    if (!note.active) continue;
    
    let x = keyboardTRACK_X_OFFSET + note.lane * keyboardLANE_WIDTH + (keyboardLANE_WIDTH - keyboardNOTE_WIDTH) / 2;
    
    if (note.type === 'short') {
      let y = keyboardCalcNoteY(note.time);
      if (y < -50 || y > height + 50) continue;
      
      fill(0, 0, 0, 100);
      noStroke();
      rect(x + 2, y + 2, keyboardNOTE_WIDTH, keyboardNOTE_HEIGHT, 3);
      
      fill(100, 200, 255);
      stroke(150, 220, 255);
      strokeWeight(2);
      rect(x, y, keyboardNOTE_WIDTH, keyboardNOTE_HEIGHT, 3);
    } 
    else if (note.type === 'hold') {
      let yStart = keyboardCalcNoteY(note.time);
      let yEnd = keyboardCalcNoteY(note.endTime);
      
      if (yStart < -50 && yEnd < -50) continue;
      if (yEnd > height + 50 && yStart > height + 50) continue;
      
      let yBottom = note.holding ? keyboardJudgeLine : yStart;
      let yTop = yEnd;
      
      if (yBottom > yTop) {
        fill(100, 200, 255, 100);
        stroke(150, 220, 255, 180);
        strokeWeight(2);
        rect(x, yTop, keyboardNOTE_WIDTH, yBottom - yTop, 5);
      }
      
      if (!note.headHit) {
        fill(50, 150, 255);
        stroke(200, 240, 255);
        strokeWeight(2);
        rect(x, yStart, keyboardNOTE_WIDTH, keyboardNOTE_HEIGHT, 3);
      }
      
      fill(255, 255, 255, 200);
      noStroke();
      rect(x, yEnd, keyboardNOTE_WIDTH, 4, 1);
    }
  }
}

function keyboardCheckMissedNotes() {
  for (let note of keyboardNotes) {
    if (note.active && !note.missed) {
      
      if (note.type === 'short') {
        let noteY = keyboardCalcNoteY(note.time);
        if (noteY > keyboardJudgeLine + 80) {  
          keyboardTriggerMiss(note, 'MISS (OVER)');
        }
      } else if (note.type === 'hold') {
        let noteY = keyboardCalcNoteY(note.time);
        if (!note.headHit && noteY > keyboardJudgeLine + 80) {
          keyboardTriggerMiss(note, 'MISS (OVER)');
        }
        else if (note.holding && (keyboardCurrentTime + keyboardAUDIO_OFFSET) >= note.endTime) {
          note.active = false;
          note.holding = false;
          
          keyboardScore += 1000;
          keyboardCombo++;
          if (keyboardCombo > keyboardMaxCombo) keyboardMaxCombo = keyboardCombo;
          keyboardComboScale = 1.3;

          keyboardLastJudgment = {
            text: 'PERFECT',
            note: keyboardGetNoteName(note.lane),
            key: keyboardGetKeyLabel(note.lane),
            timing: 'HOLD CLEAR',
            startScale: 1.2
          };
          keyboardJudgmentTime = millis();
          
          keyboardHitEffects.push({
            lane: note.lane,
            time: millis(),
            color: [255, 255, 100]
          });
        }
      }
    }
  }
}

function keyboardTriggerMiss(note, reason) {
  note.active = false;
  note.missed = true;
  note.holding = false;
  
  keyboardCombo = 0; 
  
  keyboardLastJudgment = {
    text: 'MISS',
    note: keyboardGetNoteName(note.lane),
    key: keyboardGetKeyLabel(note.lane),
    timing: reason,
    startScale: 1.4 
  };
  keyboardJudgmentTime = millis();
}

function keyboardDrawKeyPressEffects() {
  for (let i = keyboardKeyPressEffects.length - 1; i >= 0; i--) {
    let effect = keyboardKeyPressEffects[i];
    let age = millis() - effect.time;
    let maxAge = 200;
    
    if (age > maxAge) {
      keyboardKeyPressEffects.splice(i, 1);
      continue;
    }
    
    let progress = age / maxAge;
    let alpha = 120 * (1 - progress);
    
    fill(100, 200, 255, alpha);
    noStroke();
    let pianoY = keyboardJudgeLine;
    let whiteKeyHeight = keyboardJUDGE_LINE_Y_OFFSET * 0.65;
    let x = keyboardTRACK_X_OFFSET + effect.lane * keyboardLANE_WIDTH; 
    rect(x + 2, pianoY, keyboardLANE_WIDTH - 4, whiteKeyHeight);
  }
}

function keyboardDrawHitEffects() {
  for (let i = keyboardHitEffects.length - 1; i >= 0; i--) {
    let effect = keyboardHitEffects[i];
    let age = millis() - effect.time;
    let maxAge = 500;
    
    if (age > maxAge) {
      keyboardHitEffects.splice(i, 1);
      continue;
    }
    
    let progress = age / maxAge;
    let alpha = 255 * (1 - progress);
    let size = keyboardLANE_WIDTH * (0.5 + progress * 1.5);
    
    let x = keyboardTRACK_X_OFFSET + effect.lane * keyboardLANE_WIDTH + keyboardLANE_WIDTH / 2; 
    noFill();
    stroke(effect.color[0], effect.color[1], effect.color[2], alpha);
    strokeWeight(3);
    circle(x, keyboardJudgeLine, size);
  }
}

function keyboardDrawWhiteKeys() {
  let pianoY = keyboardJudgeLine;
  let whiteKeyHeight = keyboardJUDGE_LINE_Y_OFFSET * 0.65;
  
  for (let i = 0; i < keyboardLANE_COUNT; i++) {
    let x = keyboardTRACK_X_OFFSET + i * keyboardLANE_WIDTH;
    
    fill(250);
    stroke(50);
    strokeWeight(2);
    rect(x + 2, pianoY, keyboardLANE_WIDTH - 4, whiteKeyHeight);
    
    fill(80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(keyboardLANE_WIDTH * 0.18);
    text(keyboardGetKeyLabel(i), x + keyboardLANE_WIDTH / 2, pianoY + whiteKeyHeight - whiteKeyHeight * 0.25); 
    
    textSize(keyboardLANE_WIDTH * 0.14);
    fill(120);
    text(keyboardGetNoteName(i), x + keyboardLANE_WIDTH / 2, pianoY + whiteKeyHeight * 0.2);
  }
}

function keyboardDrawBlackKeys() {
  let pianoY = keyboardJudgeLine;
  let whiteKeyHeight = keyboardJUDGE_LINE_Y_OFFSET * 0.65;
  let blackKeyHeight = whiteKeyHeight * 0.6;
  
  keyboardDrawBlackKey(0, pianoY, blackKeyHeight);
  keyboardDrawBlackKey(1, pianoY, blackKeyHeight);
  keyboardDrawBlackKey(3, pianoY, blackKeyHeight);
  keyboardDrawBlackKey(4, pianoY, blackKeyHeight);
  keyboardDrawBlackKey(5, pianoY, blackKeyHeight);
}

function keyboardDrawBlackKey(whiteKeyIndex, pianoY, blackKeyHeight) {
  let x = keyboardTRACK_X_OFFSET + (whiteKeyIndex + 1) * keyboardLANE_WIDTH - keyboardLANE_WIDTH * 0.25;
  
  fill(40);
  stroke(20);
  strokeWeight(2);
  rect(x, pianoY, keyboardLANE_WIDTH * 0.5, blackKeyHeight);
}

function keyboardGetKeyLabel(lane) {
  const keys = ['W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'];
  return keys[lane];
}

function keyboardGetNoteName(lane) {
  const noteNames = ['도', '레', '미', '파', '솔', '라', '시', '도'];
  return noteNames[lane];
}

function keyboardDrawInfo() {
  fill(255, 150);
  noStroke();
  textAlign(LEFT, TOP);
  let fontSize = 12;
  textSize(fontSize);
  
  text(`FPS: ${Math.round(frameRate())}  |  Time: ${(keyboardCurrentTime / 1000).toFixed(2)}s`, 15, 15);
  
  if (keyboardLastJudgment && millis() - keyboardJudgmentTime < 1000) {
    let elapsed = millis() - keyboardJudgmentTime;
    let duration = 1000; 
    let currentScale = 1.0;
    
    if (elapsed < duration) {
      let t = elapsed / duration;
      let easeOutExp = (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
      currentScale = 1.0 + (keyboardLastJudgment.startScale - 1.0) * (1 - easeOutExp);
    }
    
    push();
    translate(width / 2, height / 2 - height * 0.15);
    scale(currentScale);
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.035);
    
    if (keyboardLastJudgment.text === 'PERFECT') fill(255, 255, 100);
    else if (keyboardLastJudgment.text === 'GOOD') fill(100, 255, 100);
    else if (keyboardLastJudgment.text === 'BAD') fill(255, 150, 100);
    else fill(255, 50, 50);
    
    text(keyboardLastJudgment.text, 0, 0);
    pop();
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.018);
    fill(255, 255, 255, 100);
    text(`${keyboardLastJudgment.note} (${keyboardLastJudgment.key}) - ${keyboardLastJudgment.timing}`, 
         width / 2, height / 2 - height * 0.1);
  }
}

function keyboardGetLaneFromKey(k) {
  const upperKey = k.toUpperCase();
  const keys = ['W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'];
  return keys.indexOf(upperKey);
}

function keyboardKeyPressed() {
  let lane = keyboardGetLaneFromKey(key);
  
  if (lane !== -1) {
    keyboardHandleInput(lane);
    keyboardKeyPressEffects.push({
      lane: lane,
      time: millis()
    });
  }
}

function keyboardKeyReleased() {
  let lane = keyboardGetLaneFromKey(key);
  
  if (lane !== -1) {
    for (let note of keyboardNotes) {
      if (note.lane === lane && note.active && note.type === 'hold' && note.holding) {
        let noteYEnd = keyboardCalcNoteY(note.endTime);
        let distFromJudge = Math.abs(keyboardJudgeLine - noteYEnd);
        
        if (distFromJudge > 80 && note.endTime > (keyboardCurrentTime + keyboardAUDIO_OFFSET)) {
          note.active = false;
          note.holding = false;
          note.missed = true;
          
          keyboardCombo = 0; 
          
          keyboardLastJudgment = {
            text: 'MISS',
            note: keyboardGetNoteName(lane),
            key: keyboardGetKeyLabel(lane),
            timing: 'EARLY RELEASE',
            startScale: 1.4
          };
          keyboardJudgmentTime = millis();
        } else {
          note.active = false;
          note.holding = false;
        }
      }
    }
  }
}

function keyboardHandleInput(lane) {
  let closestNote = null;
  let minDistDiff = Infinity;
  
  for (let note of keyboardNotes) {
    if (note.lane === lane && note.active) {
      if (note.type === 'hold' && note.headHit) continue;
      
      let noteY = keyboardCalcNoteY(note.time);
      let distDiff = Math.abs(keyboardJudgeLine - noteY); 
      
      if (distDiff < minDistDiff) {
        minDistDiff = distDiff;
        closestNote = note;
      }
    }
  }
  
  if (closestNote && minDistDiff < 80) {
    let judgment = '';
    let effectColor = [255, 255, 255];
    let scoreGain = 0;
    
    if (minDistDiff < 15) {
      judgment = 'PERFECT';
      effectColor = [255, 255, 100];
      scoreGain = 1000;
      keyboardCombo++;
    } else if (minDistDiff < 40) {
      judgment = 'GOOD';
      effectColor = [100, 255, 100];
      scoreGain = 500;
      keyboardCombo++;
    } else {
      judgment = 'BAD';
      effectColor = [255, 150, 100];
      scoreGain = 200;
      keyboardCombo = 0;
    }
    
    keyboardScore += scoreGain;
    if (keyboardCombo > keyboardMaxCombo) keyboardMaxCombo = keyboardCombo;
    if (scoreGain > 200) keyboardComboScale = 1.35; 

    if (closestNote.type === 'short') {
      closestNote.active = false; 
    } else if (closestNote.type === 'hold') {
      closestNote.headHit = true; 
      closestNote.holding = true; 
    }
    
    keyboardLastJudgment = {
      text: judgment,
      note: keyboardGetNoteName(lane),
      key: keyboardGetKeyLabel(lane),
      timing: `${minDistDiff.toFixed(1)}px`, 
      startScale: 1.2
    };
    keyboardJudgmentTime = millis();
    
    keyboardHitEffects.push({
      lane: lane, 
      time: millis(),
      color: effectColor
    });
  }
}

function keyboardPlayKeyboard() {
    console.log("키보드 연주 시작!");
}
