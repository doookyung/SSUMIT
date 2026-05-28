// ============================================
// 게임 설정 (공통)
// ============================================
const LANE_COUNT = 8;
let LANE_WIDTH = 80;
let TRACK_X_OFFSET = -100; // 트랙을 중앙에 배치하기 위한 좌측 오프셋
let JUDGE_LINE_Y_OFFSET = 120;
let NOTE_HEIGHT = 15;
let NOTE_WIDTH = 70;
let SCROLL_SPEED = 200;

let AUDIO_OFFSET = -100; 

let notes = [];
let currentTime = 0;
let judgeLine;
let myFont; 
let bgm;
let isGameStarted = false; // 게임 시작 여부

// [신규 수정] 시간 보정 및 채보 테스트용 변수
let jumpStartTime = 0;       // 점프한 시점의 실제 컴퓨터 시간 기록
let targetStartTimeSec = 0;  // 시작할 음악 시간(초) 저장

//==========================================BPM
let gameBPM = 126;

// 판정 피드백 시스템
let lastJudgment = null;
let judgmentTime = 0;

// 이펙트 시스템
let hitEffects = [];
let keyPressEffects = [];

// ============================================
// [신규] 스코어, 콤보 및 웹캠 변수
// ============================================
let score = 0;
let combo = 0;
let maxCombo = 0;
let comboScale = 1.0; // 콤보 달성 시 커지는 애니메이션용
let video; // 카메라 영상을 담을 변수

// BPM 설정
function setGameBPM(bpm) {
  gameBPM = bpm;
}

// 비트를 시간(초)으로 변환 
function beatToTime(beat) {
  return (beat * 60) / gameBPM;
}

// ============================================
// 초기화 및 채보 제작
// ============================================
function preload() {
  myFont = loadFont('Paperlogy-7Bold.ttf');
  bgm = loadSound('126.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateGameScale();
  textFont(myFont);
  
  createChart();

  // 카메라 초기화 및 캔버스 뒤 DOM 숨김 처리
  video = createCapture(VIDEO);
  video.hide(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateGameScale();
}

function updateGameScale() {
  let trackWidth = min(windowWidth * 0.75, 800); 
  if (trackWidth < 450) trackWidth = windowWidth; 
  
  LANE_WIDTH = trackWidth / LANE_COUNT;
  NOTE_WIDTH = LANE_WIDTH * 0.85;
  
  TRACK_X_OFFSET = (windowWidth - trackWidth) / 2; 
  
  JUDGE_LINE_Y_OFFSET = windowHeight * 0.2;
  judgeLine = windowHeight - JUDGE_LINE_Y_OFFSET;
  NOTE_HEIGHT = windowHeight * 0.02;
  SCROLL_SPEED = windowHeight * 0.6; // 초당 이동 픽셀 수
}

function mousePressed() {
  if (!isGameStarted) {
    userStartAudio(); // 브라우저 사운드 락 해제
    isGameStarted = true;
    
    // ============================================
    // [채보 테스트용] 원하는 마디부터 시작하기
    // ============================================
    let startMeasure = 40; // 시작하고 싶은 마디 입력 (40마디)
    let startBeat = startMeasure * 4.0; // 마디를 박자로 변환 (160.0)
    targetStartTimeSec = beatToTime(startBeat); // 박자를 시간(초)으로 변환 후 전역변수에 저장
    
    // 시작 지점 이전의 노트들은 Miss 처리되지 않도록 미리 비활성화
    for (let note of notes) {
      if (note.time < targetStartTimeSec * 1000) {
        note.active = false;
      }
    }
    
    // [버그 수정] play와 jump를 따로 쓰지 않고 오디오 로딩 씹힘을 방지하기 위해 play 인자에서 시작 시간 지정
    // 인자 순서: play(지연시간, 재생속도, 볼륨, 시작시간_초)
    bgm.play(0, 1, 1, targetStartTimeSec); 
    jumpStartTime = millis(); // 음악이 시작된 딱 그 순간의 실제 컴퓨터 시간 기록
    
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
function createChart() {
  setGameBPM(126); // 실제 음원의 BPM 설정
  
  n(5, 4.0);
  n(5, 5.0);
  n(5, 6.0);
  n(6, 6.5);
  n(5, 7.0);
  h(4, 7.5, 0.5);
  h(4, 8.5, 0.5);
  h(4, 9.5, 0.5);
  n(6, 10.5);
  n(5, 12.0);
  n(5, 13.0);
  n(5, 14.0);
  n(6, 14.5);
  n(5, 15.0);
  h(4, 15.5, 1.5);
  h(3, 17.0, 1.0);
  h(2, 18.0, 1.0);
  h(1, 19.0, 1.0);
  h(2, 20.0, 2.0);
  n(1, 23.0);
  n(2, 24.0);
  n(3, 24.5);
  n(4, 25.0);
  n(1, 25.5);
  h(2, 28.0, 1.0);
  h(3, 29.0, 1.0);
  h(4, 30.0, 1.0);
  h(5, 31.0, 1.0);
  h(6, 32.0, 2.0);
  
  // 41마디 이후 채보 영역
  n(2, 166.0);
  n(4, 166.5);
  n(5, 167.0);
  n(6, 167.5);
  n(5, 168.5);
  n(4, 169.5);
  n(3, 170.0);
  n(4, 170.5);
  n(4, 174.0);
  n(4, 174.5);
  n(4, 175.0);
  n(4, 175.5);
  n(4, 176.5);
  n(5, 177.5);
  n(4, 178.0);
  n(2, 178.5);
  n(2, 181.0);
  n(3, 181.5);
  n(4, 182.0);
  n(7, 183.0);
  n(7, 183.5);
  n(6, 184.5);
}

// 단노트 생성 함수 (1박자 = 1.0 기준)
function n(lane, beat) {
  notes.push({
    type: 'short',
    time: beatToTime(beat) * 1000, // 박자를 밀리초(ms) 단위로 변환
    lane: lane,
    active: true,
    missed: false
  });
}

// 롱노트 생성 함수 (시작 박자 위치, 지속될 박자 길이 입력)
function h(lane, startBeat, lengthBeat) {
  let endBeat = startBeat + lengthBeat;
  notes.push({
    type: 'hold',
    time: beatToTime(startBeat) * 1000,
    endTime: beatToTime(endBeat) * 1000,
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
function draw() {
  background(20);
  
  if (!isGameStarted) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(max(16, width * 0.02));
    text("화면을 클릭하면 음악과 함께 게임이 시작됩니다.", width / 2, height / 2);
    return;
  }
  
  // ============================================
  // [깜빡임 방지 수정] 오디오 시간과 실제 흘러간 정밀 시간을 보정 계산
  // ============================================
  let audioTime = bgm.currentTime() * 1000;
  let realElapsedTime = millis() - jumpStartTime;
  let calculatedTime = (targetStartTimeSec * 1000) + realElapsedTime;
  
  // 오디오 타이머 오차 범위(150ms) 안쪽이라면 부드러운 계산값(calculatedTime)을 사용하여 떨림을 완전히 방지
  if (abs(audioTime - calculatedTime) < 150 && audioTime > 0) {
    currentTime = calculatedTime;
  } else {
    currentTime = audioTime; // 싱크 오차가 너무 벌어지면 실제 오디오 타임을 강제 추적
  }
  // ============================================
  
  // 1. 사이드 배경 UI 렌더링
  drawCustomLeftUI();  
  drawCustomRightUI(); 
  
  // 2. 게임 플레이 영역 배경 (마디선 및 레인 격자)
  drawBeatLines();
  drawLanes();
  
  // 3. 게임 노트 렌더링
  drawNotes();
  
  // 4. 피아노 건반 및 키 입력 이펙트
  drawWhiteKeys();       
  drawKeyPressEffects(); 
  drawBlackKeys();       
  
  // 5. 판정선 및 상위 이펙트 시스템
  drawJudgmentLine();
  checkMissedNotes();
  drawHitEffects();      
  drawInfo();
}

// ============================================
// 화려하게 꾸민 좌측 UI (Score & Combo 블록)
// ============================================
function drawCustomLeftUI() {
  let uiWidth = TRACK_X_OFFSET - 10;
  if (uiWidth <= 0) return;

  // 네온 테두리가 있는 그라데이션 사이드 바 배경
  fill(15, 15, 25);
  noStroke();
  rect(0, 0, uiWidth, height);
  
  stroke(0, 230, 255, 40);
  weight = 2;
  strokeWeight(2);
  line(uiWidth, 0, uiWidth, height);

  // 컨텐츠 배치를 위한 중앙 정렬 설정
  textAlign(CENTER, CENTER);
  
  // 1. SCORE 세션
  fill(0, 230, 255, 150);
  textSize(max(12, uiWidth * 0.1));
  text("SCORE", uiWidth / 2, height * 0.2);
  
  fill(255);
  textSize(max(18, uiWidth * 0.14));
  // 숫자를 6자리 포맷(000120)으로 출력
  text(nf(score, 6), uiWidth / 2, height * 0.25);

  // 2. COMBO 세션 (콤보가 있을 때만 튕기는 애니메이션)
  if (combo > 0) {
    comboScale = lerp(comboScale, 1.0, 0.1); // 원래 크기로 서서히 복귀
    
    push();
    translate(uiWidth / 2, height * 0.45);
    scale(comboScale);
    
    // 외곽 불빛 효과 (글씨 번짐 효과 대용)
    fill(255, 200, 0, 30);
    textSize(max(24, uiWidth * 0.28));
    text(combo, 0, 0);
    
    fill(255, 215, 0);
    textSize(max(22, uiWidth * 0.25));
    text(combo, 0, -2);
    pop();

    fill(200, 200, 200);
    textSize(max(11, uiWidth * 0.09));
    text("COMBO", uiWidth / 2, height * 0.53);
  }

  // 3. MAX COMBO 세션
  fill(120, 120, 130);
  textSize(max(10, uiWidth * 0.08));
  text(`MAX COMBO  ${maxCombo}`, uiWidth / 2, height * 0.75);
}

// ============================================
// 우측 UI (카메라 피드 및 정보창)
// ============================================
function drawCustomRightUI() {
  let trackRightEdge = TRACK_X_OFFSET + LANE_WIDTH * LANE_COUNT;
  let uiWidth = width - trackRightEdge - 10;
  if (uiWidth <= 0) return;

  // 사이드 바 배경
  fill(15, 15, 25);
  noStroke();
  rect(trackRightEdge + 10, 0, uiWidth, height);
  
  stroke(255, 0, 128, 40);
  strokeWeight(2);
  line(trackRightEdge + 10, 0, trackRightEdge + 10, height);

  let startX = trackRightEdge + 25;
  let containerWidth = width - startX - 25;

  // 1. 패널 타이틀
  fill(255, 0, 128, 150);
  textSize(max(12, uiWidth * 0.1));
  textAlign(LEFT, TOP);
  text("PLAYER CAM", startX, height * 0.08);

  // 2. 비주얼라이저 대신 카메라 화면 렌더링
  let camY = height * 0.13; // 카메라가 그려질 Y 위치
  
  if (video && video.loadedmetadata) {
    // 카메라 원본 비율 계산
    let camAspect = video.height / video.width;
    let camHeight = containerWidth * camAspect;
    
    // 네온 스타일 카메라 테두리
    stroke(0, 230, 255, 150);
    strokeWeight(2);
    fill(0, 50);
    rect(startX - 2, camY - 2, containerWidth + 4, camHeight + 4, 4);
    
    // 카메라 영상 출력
    image(video, startX, camY, containerWidth, camHeight);
  } else {
    // 카메라 권한 대기 혹은 로딩 중일 때 보여줄 화면
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

  // 3. 플레이 정보 텍스트 가독성 배치
  fill(140, 140, 150);
  textSize(max(11, uiWidth * 0.08));
  textAlign(LEFT, TOP);
  
  // 카메라 영역 아래에 정보 텍스트 배치
  let infoY = height * 0.65;
  text(`SPEED : ${(SCROLL_SPEED/100).toFixed(1)}x`, startX, infoY);
  text(`SYNC  : ${AUDIO_OFFSET}ms`, startX, infoY + 25);
  text(`SONG  : Neon Beats (126)`, startX, infoY + 50);
}

function drawBeatLines() {
  stroke(100, 100, 150, 100);
  strokeWeight(2);
  
  let beatDuration = (60 / gameBPM) * 4;  
  let currentMeasure = (currentTime + AUDIO_OFFSET) / 1000 / beatDuration;
  let startMeasure = Math.floor(currentMeasure) - 2;
  
  let trackWidth = LANE_WIDTH * LANE_COUNT;
  
  for (let i = startMeasure; i < startMeasure + 15; i++) {
    let beatTime = i * beatDuration * 1000;
    let y = calcNoteY(beatTime);
    
    if (y > -50 && y < judgeLine + 100) {
      if (i % 4 === 0) {
        stroke(150, 150, 200, 150);
        strokeWeight(3);
      } else {
        stroke(100, 100, 150, 80);
        strokeWeight(1.5);
      }
      line(TRACK_X_OFFSET, y, TRACK_X_OFFSET + trackWidth, y);
    }
  }
}

function drawLanes() {
  stroke(80);
  strokeWeight(2);
  for (let i = 0; i <= LANE_COUNT; i++) {
    let x = TRACK_X_OFFSET + i * LANE_WIDTH;
    line(x, 0, x, judgeLine);
  }
}

function drawJudgmentLine() {
  let trackWidth = LANE_WIDTH * LANE_COUNT;
  stroke(255, 50, 50);
  strokeWeight(4);
  line(TRACK_X_OFFSET, judgeLine, TRACK_X_OFFSET + trackWidth, judgeLine);
  
  noStroke();
  fill(255, 50, 50, 30);
  rect(TRACK_X_OFFSET, judgeLine - 2, trackWidth, 4);
}

// [싱크 수정] 오디오 오프셋을 반영하여 스크롤 위치 보정
function calcNoteY(noteTime) {
  let timeDiff = noteTime - (currentTime + AUDIO_OFFSET);
  return judgeLine - (timeDiff / 1000) * SCROLL_SPEED;
}

function drawNotes() {
  for (let note of notes) {
    if (!note.active) continue;
    
    let x = TRACK_X_OFFSET + note.lane * LANE_WIDTH + (LANE_WIDTH - NOTE_WIDTH) / 2;
    
    if (note.type === 'short') {
      let y = calcNoteY(note.time);
      if (y < -50 || y > height + 50) continue;
      
      fill(0, 0, 0, 100);
      noStroke();
      rect(x + 2, y + 2, NOTE_WIDTH, NOTE_HEIGHT, 3);
      
      fill(100, 200, 255);
      stroke(150, 220, 255);
      strokeWeight(2);
      rect(x, y, NOTE_WIDTH, NOTE_HEIGHT, 3);
    } 
    else if (note.type === 'hold') {
      let yStart = calcNoteY(note.time);
      let yEnd = calcNoteY(note.endTime);
      
      if (yStart < -50 && yEnd < -50) continue;
      if (yEnd > height + 50 && yStart > height + 50) continue;
      
      let yBottom = note.holding ? judgeLine : yStart;
      let yTop = yEnd;
      
      if (yBottom > yTop) {
        fill(100, 200, 255, 100);
        stroke(150, 220, 255, 180);
        strokeWeight(2);
        rect(x, yTop, NOTE_WIDTH, yBottom - yTop, 5);
      }
      
      if (!note.headHit) {
        fill(50, 150, 255);
        stroke(200, 240, 255);
        strokeWeight(2);
        rect(x, yStart, NOTE_WIDTH, NOTE_HEIGHT, 3);
      }
      
      fill(255, 255, 255, 200);
      noStroke();
      rect(x, yEnd, NOTE_WIDTH, 4, 1);
    }
  }
}

function checkMissedNotes() {
  for (let note of notes) {
    if (note.active && !note.missed) {
      
      if (note.type === 'short') {
        let noteY = calcNoteY(note.time);
        if (noteY > judgeLine + 80) {  
          triggerMiss(note, 'MISS (OVER)');
        }
      } else if (note.type === 'hold') {
        let noteY = calcNoteY(note.time);
        if (!note.headHit && noteY > judgeLine + 80) {
          triggerMiss(note, 'MISS (OVER)');
        }
        // [싱크 수정] 롱노트 처리 타임라인 보정
        else if (note.holding && (currentTime + AUDIO_OFFSET) >= note.endTime) {
          note.active = false;
          note.holding = false;
          
          // 롱노트 완주 점수 부여 및 콤보 누적
          score += 1000;
          combo++;
          if (combo > maxCombo) maxCombo = combo;
          comboScale = 1.3;

          lastJudgment = {
            text: 'PERFECT',
            note: getNoteName(note.lane),
            key: getKeyLabel(note.lane),
            timing: 'HOLD CLEAR',
            startScale: 1.2
          };
          judgmentTime = millis();
          
          hitEffects.push({
            lane: note.lane,
            time: millis(),
            color: [255, 255, 100]
          });
        }
      }
    }
  }
}

function triggerMiss(note, reason) {
  note.active = false;
  note.missed = true;
  note.holding = false;
  
  combo = 0; // 미스 시 콤보 리셋
  
  lastJudgment = {
    text: 'MISS',
    note: getNoteName(note.lane),
    key: getKeyLabel(note.lane),
    timing: reason,
    startScale: 1.4 
  };
  judgmentTime = millis();
}

function drawKeyPressEffects() {
  for (let i = keyPressEffects.length - 1; i >= 0; i--) {
    let effect = keyPressEffects[i];
    let age = millis() - effect.time;
    let maxAge = 200;
    
    if (age > maxAge) {
      keyPressEffects.splice(i, 1);
      continue;
    }
    
    let progress = age / maxAge;
    let alpha = 120 * (1 - progress);
    
    fill(100, 200, 255, alpha);
    noStroke();
    let pianoY = judgeLine;
    let whiteKeyHeight = JUDGE_LINE_Y_OFFSET * 0.65;
    let x = TRACK_X_OFFSET + effect.lane * LANE_WIDTH; 
    rect(x + 2, pianoY, LANE_WIDTH - 4, whiteKeyHeight);
  }
}

function drawHitEffects() {
  for (let i = hitEffects.length - 1; i >= 0; i--) {
    let effect = hitEffects[i];
    let age = millis() - effect.time;
    let maxAge = 500;
    
    if (age > maxAge) {
      hitEffects.splice(i, 1);
      continue;
    }
    
    let progress = age / maxAge;
    let alpha = 255 * (1 - progress);
    let size = LANE_WIDTH * (0.5 + progress * 1.5);
    
    let x = TRACK_X_OFFSET + effect.lane * LANE_WIDTH + LANE_WIDTH / 2; 
    noFill();
    stroke(effect.color[0], effect.color[1], effect.color[2], alpha);
    strokeWeight(3);
    circle(x, judgeLine, size);
  }
}

function drawWhiteKeys() {
  let pianoY = judgeLine;
  let whiteKeyHeight = JUDGE_LINE_Y_OFFSET * 0.65;
  
  for (let i = 0; i < LANE_COUNT; i++) {
    let x = TRACK_X_OFFSET + i * LANE_WIDTH;
    
    fill(250);
    stroke(50);
    strokeWeight(2);
    rect(x + 2, pianoY, LANE_WIDTH - 4, whiteKeyHeight);
    
    fill(80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(LANE_WIDTH * 0.18);
    text(getKeyLabel(i), x + LANE_WIDTH / 2, pianoY + whiteKeyHeight - whiteKeyHeight * 0.25); 
    
    textSize(LANE_WIDTH * 0.14);
    fill(120);
    text(getNoteName(i), x + LANE_WIDTH / 2, pianoY + whiteKeyHeight * 0.2);
  }
}

function drawBlackKeys() {
  let pianoY = judgeLine;
  let whiteKeyHeight = JUDGE_LINE_Y_OFFSET * 0.65;
  let blackKeyHeight = whiteKeyHeight * 0.6;
  
  drawBlackKey(0, pianoY, blackKeyHeight);
  drawBlackKey(1, pianoY, blackKeyHeight);
  drawBlackKey(3, pianoY, blackKeyHeight);
  drawBlackKey(4, pianoY, blackKeyHeight);
  drawBlackKey(5, pianoY, blackKeyHeight);
}

function drawBlackKey(whiteKeyIndex, pianoY, blackKeyHeight) {
  let x = TRACK_X_OFFSET + (whiteKeyIndex + 1) * LANE_WIDTH - LANE_WIDTH * 0.25;
  
  fill(40);
  stroke(20);
  strokeWeight(2);
  rect(x, pianoY, LANE_WIDTH * 0.5, blackKeyHeight);
}

function getKeyLabel(lane) {
  const keys = ['W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'];
  return keys[lane];
}

function getNoteName(lane) {
  const noteNames = ['도', '레', '미', '파', '솔', '라', '시', '도'];
  return noteNames[lane];
}

function drawInfo() {
  fill(255, 150);
  noStroke();
  textAlign(LEFT, TOP);
  let fontSize = 12;
  textSize(fontSize);
  
  // 가독성을 위해 좌측 상단 구석에 작게 디버그 정보 배치
  text(`FPS: ${Math.round(frameRate())}  |  Time: ${(currentTime / 1000).toFixed(2)}s`, 15, 15);
  
  if (lastJudgment && millis() - judgmentTime < 1000) {
    let elapsed = millis() - judgmentTime;
    let duration = 1000; 
    let currentScale = 1.0;
    
    if (elapsed < duration) {
      let t = elapsed / duration;
      let easeOutExp = (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
      currentScale = 1.0 + (lastJudgment.startScale - 1.0) * (1 - easeOutExp);
    }
    
    push();
    translate(width / 2, height / 2 - height * 0.15);
    scale(currentScale);
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.035);
    
    if (lastJudgment.text === 'PERFECT') fill(255, 255, 100);
    else if (lastJudgment.text === 'GOOD') fill(100, 255, 100);
    else if (lastJudgment.text === 'BAD') fill(255, 150, 100);
    else fill(255, 50, 50);
    
    text(lastJudgment.text, 0, 0);
    pop();
    
    textAlign(CENTER, CENTER);
    textSize(width * 0.018);
    fill(255, 255, 255, 100);
    text(`${lastJudgment.note} (${lastJudgment.key}) - ${lastJudgment.timing}`, 
         width / 2, height / 2 - height * 0.1);
  }
}

function getLaneFromKey(k) {
  const upperKey = k.toUpperCase();
  const keys = ['W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'];
  return keys.indexOf(upperKey);
}

function keyPressed() {
  let lane = getLaneFromKey(key);
  
  if (lane !== -1) {
    handleInput(lane);
    keyPressEffects.push({
      lane: lane,
      time: millis()
    });
  }
}

function keyReleased() {
  let lane = getLaneFromKey(key);
  
  if (lane !== -1) {
    for (let note of notes) {
      if (note.lane === lane && note.active && note.type === 'hold' && note.holding) {
        let noteYEnd = calcNoteY(note.endTime);
        let distFromJudge = Math.abs(judgeLine - noteYEnd);
        
        // [싱크 수정] 롱노트 해제 판정 타임라인 보정
        if (distFromJudge > 80 && note.endTime > (currentTime + AUDIO_OFFSET)) {
          note.active = false;
          note.holding = false;
          note.missed = true;
          
          combo = 0; // 롱노트 중간 방치 시 콤보 브레이크
          
          lastJudgment = {
            text: 'MISS',
            note: getNoteName(lane),
            key: getKeyLabel(lane),
            timing: 'EARLY RELEASE',
            startScale: 1.4
          };
          judgmentTime = millis();
        } else {
          note.active = false;
          note.holding = false;
        }
      }
    }
  }
}

// ============================================
// 화면 거리(Pixel) 기반 판정 및 스코어 연동 로직
// ============================================
function handleInput(lane) {
  let closestNote = null;
  let minDistDiff = Infinity;
  
  for (let note of notes) {
    if (note.lane === lane && note.active) {
      if (note.type === 'hold' && note.headHit) continue;
      
      let noteY = calcNoteY(note.time);
      let distDiff = Math.abs(judgeLine - noteY); 
      
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
      combo++;
    } else if (minDistDiff < 40) {
      judgment = 'GOOD';
      effectColor = [100, 255, 100];
      scoreGain = 500;
      combo++;
    } else {
      judgment = 'BAD';
      effectColor = [255, 150, 100];
      scoreGain = 200;
      combo = 0;
    }
    
    // 스코어 합산 및 애니메이션 트리거
    score += scoreGain;
    if (combo > maxCombo) maxCombo = combo;
    if (scoreGain > 200) comboScale = 1.35; // 콤보 팝업 크기 조절

    if (closestNote.type === 'short') {
      closestNote.active = false; 
    } else if (closestNote.type === 'hold') {
      closestNote.headHit = true; 
      closestNote.holding = true; 
    }
    
    lastJudgment = {
      text: judgment,
      note: getNoteName(lane),
      key: getKeyLabel(lane),
      timing: `${minDistDiff.toFixed(1)}px`, 
      startScale: 1.2
    };
    judgmentTime = millis();
    
    hitEffects.push({
      lane: lane, 
      time: millis(),
      color: effectColor
    });
  }
}

export function playKeyboard() {
    console.log("키보드 연주 시작!");
}
