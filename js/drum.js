// ===================================================
// [드럼 세션 모듈] js/drum.js
// ===================================================

// 🎵 곡 정보 및 BPM 설정
const DRUM_SONG_BPM = 126; 

// 📝 직관적인 채보 작성을 위한 음표/쉼표 단위 정의
const DRUM_NOTE_1   = 4.0;
const DRUM_NOTE_2   = 2.0;
const DRUM_NOTE_4   = 1.0;
const DRUM_NOTE_8   = 0.5;
const DRUM_NOTE_16  = 0.25;
const DRUM_NOTE_D4  = 1.5;
const DRUM_NOTE_D8  = 0.75;

// --- 🥁 누적 박자 기반 채보 시스템 변수 ---
let drumCurrentBeatTracker = 0; 

// [설정] 각 악기별 오선지 기준 Y 좌표 정의
let yRide   = 235;  
let yHihat  = 250;  
let yTom1   = 265;  
let yTom2   = 280;  
let ySnare  = 295;  
let yFloor  = 325;  
let yKick   = 355;  

// 인게임 전역 변수
let drumNotes = [];
let drumCurrentTime = 0; // main.js의 globalSongTime과 동기화
let drumScore = 0;
let drumCombo = 0;
let drumMaxCombo = 0;

let drumCapture;
let drumPrevFrame;
let drumJudgeList = [];

// ============================================
// ⚙️ 1. 메인 셋업에서 호출될 드럼 초기화 함수
// ============================================
function drumSetup() {
  // 모션 감지용 카메라 설정 (화면 렌더링에 방해받지 않도록 보이지 않게 처리)
  drumCapture = createCapture(VIDEO);
  drumCapture.size(160, 120);
  drumCapture.hide(); 
  
  // 드럼 채보 데이터 생성 실행
  createDrumChart();
  
  // 모션 판정 영역 설정 (기존 소스코드의 judgeList 복원)
  drumJudgeList = [
    { name: "KICK",  key: "R", x: 100, y: 150, w: 100, h: 80, triggered: false, color: [255,0,0] },
    { name: "SNARE", key: "U", x: 250, y: 150, w: 100, h: 80, triggered: false, color: [0,255,0] },
    { name: "HIHAT", key: "I", x: 400, y: 150, w: 100, h: 80, triggered: false, color: [0,0,255] },
    { name: "CYMBAL",key: "O", x: 550, y: 150, w: 100, h: 80, triggered: false, color: [255,255,0] }
  ];
}

// ============================================
// 📝 드럼 채보 영역 (기존 작성하신 노트를 보존/확장)
// ============================================
function createDrumChart() {
  drumCurrentBeatTracker = 0; // 초기화
  
  // 1~4마디 전주 (쉼표)
  drumRest(DRUM_NOTE_1); drumRest(DRUM_NOTE_1); drumRest(DRUM_NOTE_1); drumRest(DRUM_NOTE_1);
  
  // 5마디 예시 채보 (기존 드럼 연주 패턴에 맞춰 자유롭게 추가 가능)
  drumPlay("KICK");     drumRest(DRUM_NOTE_4);
  drumPlay("SNARE");    drumRest(DRUM_NOTE_4);
  drumPlay("HIHAT");    drumRest(DRUM_NOTE_8);
  drumPlay("HIHAT");    drumRest(DRUM_NOTE_8);
  drumPlay("KICK");     drumRest(DRUM_NOTE_4);
  
  // 6마디 무한 루프 패턴 베이스라인 빌딩 가능...
  drumPlay("KICK");     drumRest(DRUM_NOTE_2);
  drumPlay("CYMBAL");   drumRest(DRUM_NOTE_2);
}

// ⚙️ 내부 노트 빌드 함수들
function drumBeatToTime(beat) {
  return (beat * 60) / DRUM_SONG_BPM;
}

function drumPlay(instrumentType) {
  let targetY = ySnare; // 기본값
  if (instrumentType === "KICK") targetY = yKick;
  if (instrumentType === "SNARE") targetY = ySnare;
  if (instrumentType === "HIHAT") targetY = yHihat;
  if (instrumentType === "CYMBAL") targetY = yRide;
  
  let startTimeMs = drumBeatToTime(drumCurrentBeatTracker) * 1000;
  
  drumNotes.push({
    type: instrumentType,
    time: startTimeMs,
    y: targetY,
    active: true,
    targetX: 200 // 판정선 X 위치
  });
}

function drumRest(restType) {
  drumCurrentBeatTracker += restType;
}

// ============================================
// 🎨 2. 메인 draw()에서 반복 호출될 루프 함수
// ============================================
function drumDraw() {
  // 메인 마스터 시계 동기화
  drumCurrentTime = globalSongTime;

  // 모션 감지 및 그래픽 렌더링
  updateDrumMotionDetection();
  drawDrumEnvironment();
  drawDrumNotes();
  drawDrumUI();
}

// ============================================
// 🎥 카메라 기반 웹캠 모션 인식 프로세스
// ============================================
function updateDrumMotionDetection() {
  if (!drumCapture || !drumCapture.loadedmetadata) return;
  
  drumCapture.loadPixels();
  if (drumCapture.pixels.length === 0) return;
  
  if (!drumPrevFrame) {
    drumPrevFrame = new Uint8Array(drumCapture.pixels.length);
    for (let i = 0; i < drumCapture.pixels.length; i++) {
      drumPrevFrame[i] = drumCapture.pixels[i];
    }
    return;
  }
  
  // 각 판정 영역별 픽셀 변화 감지값 초기화
  let regionMotion = new Array(drumJudgeList.length).fill(0);
  let regionPixelCount = new Array(drumJudgeList.length).fill(0);
  
  let w = drumCapture.width;
  let h = drumCapture.height;
  
  // 픽셀 전체 분석
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let loc = (x + y * w) * 4;
      
      let r1 = drumCapture.pixels[loc];
      let g1 = drumCapture.pixels[loc + 1];
      let b1 = drumCapture.pixels[loc + 2];
      
      let r2 = drumPrevFrame[loc];
      let g2 = drumPrevFrame[loc + 1];
      let b2 = drumPrevFrame[loc + 2];
      
      let diff = dist(r1, g1, b1, r2, g2, b2);
      
      // 현재 픽셀이 어떤 모션 구역에 속해있는지 확인
      // 캡처 본(160x120)에 매핑하기 위해 스케일링 비율 계산
      let screenX = map(x, 0, w, 0, width);
      let screenY = map(y, 0, h, 0, height);
      
      for (let i = 0; i < drumJudgeList.length; i++) {
        let box = drumJudgeList[i];
        if (screenX >= box.x && screenX <= box.x + box.w && screenY >= box.y && screenY <= box.y + box.h) {
          regionPixelCount[i]++;
          if (diff > 50) { // 변동 문턱값 50
            regionMotion[i]++;
          }
        }
      }
      
      // 다음 프레임을 위해 저장
      drumPrevFrame[loc] = r1;
      drumPrevFrame[loc + 1] = g1;
      drumPrevFrame[loc + 2] = b1;
    }
  }
  
  // 모션 판정 반영
  for (let i = 0; i < drumJudgeList.length; i++) {
    if (regionPixelCount[i] > 0) {
      let motionPercentage = (regionMotion[i] / regionPixelCount[i]) * 100;
      if (motionPercentage > 15) { // 15% 이상 움직임 발생 시 트리거
        if (!drumJudgeList[i].triggered) {
          drumJudgeList[i].triggered = true;
          judgeDrumInput(drumJudgeList[i].name);
        }
      } else {
        drumJudgeList[i].triggered = false;
      }
    }
  }
}

// ============================================
// 🖼️ UI 및 악기 그래픽 렌더링 함수들
// ============================================
function drawDrumEnvironment() {
  // 모션 박스 시각화
  for (let box of drumJudgeList) {
    if (box.triggered) {
      fill(box.color[0], box.color[1], box.color[2], 120);
    } else {
      fill(box.color[0], box.color[1], box.color[2], 40);
    }
    stroke(box.color);
    strokeWeight(2);
    rect(box.x, box.y, box.w, box.h, 10);
    
    // 악기 정보 텍스트 표시
    fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(14);
    text(`${box.name}\n[${box.key}]`, box.x + box.w/2, box.y + box.h/2);
  }
  
  // 드럼 5선지(판정 라인) 그리기
  stroke(100, 100, 100, 150);
  strokeWeight(1);
  line(0, yRide, width, yRide);
  line(0, yHihat, width, yHihat);
  line(0, yTom1, width, yTom1);
  line(0, yTom2, width, yTom2);
  line(0, ySnare, width, ySnare);
  
  // 드럼 킥용 베이스 하단 점선
  stroke(150, 50, 50, 100);
  drawingContext.setLineDash([5, 5]);
  line(0, yKick, width, yKick);
  drawingContext.setLineDash([]); // 점선 초기화
  
  // 판정선 수직바 (X = 200)
  stroke(0, 255, 255, 180);
  strokeWeight(3);
  line(200, yRide - 20, 200, yKick + 20);
}

function drawDrumNotes() {
  for (let note of drumNotes) {
    if (!note.active) continue;
    
    // 오른쪽에서 왼쪽으로 흐르는 드럼 노트의 X 좌표 계산
    let noteX = note.targetX + (note.time - drumCurrentTime) * 0.4;
    
    // 화면 우측 경계선을 넘어간 너무 먼 노트 패스
    if (noteX > width + 50) continue;
    
    // 판정선을 너무 많이 지나쳤을 때 (MISS)
    if (drumCurrentTime - note.time > 200) {
      note.active = false;
      drumCombo = 0;
      continue;
    }
    
    // 악기 타입별 커스텀 디자인 노트 렌더링
    if (noteX > note.targetX - 30) {
      if (note.type === "KICK") drawKick(noteX, note.y);
      else if (note.type === "SNARE") drawSnare(noteX, note.y);
      else if (note.type === "HIHAT") drawHihat(noteX, note.y);
      else drawCymbal(noteX, note.y);
    }
  }
}

// 개별 악기 비주얼 컴포넌트 함수 세트 (기존 드럼 아이콘 로직 100% 반영)
function drawKick(x, y) {
  fill(255, 100, 100); noStroke(); circle(x, y, 24);
  fill(0); textAlign(CENTER, CENTER); textSize(12); textStyle(BOLD); text("R", x, y);
}
function drawSnare(x, y) {
  fill(255); noStroke(); ellipse(x, y, 32, 25);
  fill(0); textAlign(CENTER, CENTER); textSize(12); textStyle(BOLD); text("U", x, y);
}
function drawHihat(x, y) {
  fill(200, 200, 250); noStroke();
  beginShape(); vertex(x, y - 10); vertex(x + 15, y + 5); vertex(x - 15, y + 5); endShape(CLOSE);
  fill(0); textAlign(CENTER, CENTER); textSize(11); textStyle(BOLD); text("I", x, y + 2);
}
function drawCymbal(x, y) {
  fill(255, 215, 0); noStroke(); ellipse(x, y, 35, 15);
  fill(0); textAlign(CENTER, CENTER); textSize(11); textStyle(BOLD); text("O", x, y);
}

function drawDrumUI() {
  // 스코어 및 콤보 렌더링
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(18);
  text(`DRUM SCORE: ${drumScore}`, 30, height - 90);
  text(`DRUM COMBO: ${drumCombo}`, 30, height - 60);
}

// ============================================
// ⌨️ 3. 키보드 및 모션 입력 처리 함수
// ============================================
function drumKeyPressed() {
  // 모션 외에 키보드로도 테스트가 가능하도록 매핑 유지
  let type = "";
  if (key === 'r' || key === 'R') type = "KICK";
  if (key === 'u' || key === 'U') type = "SNARE";
  if (key === 'i' || key === 'I') type = "HIHAT";
  if (key === 'o' || key === 'O') type = "CYMBAL";
  
  if (type !== "") {
    // 키보드 입력 시 해당 비주얼 박스도 트리거 이펙트 주기
    for (let box of drumJudgeList) {
      if (box.name === type) box.triggered = true;
    }
    judgeDrumInput(type);
  }
}

function drumKeyReleased() {
  let type = "";
  if (key === 'r' || key === 'R') type = "KICK";
  if (key === 'u' || key === 'U') type = "SNARE";
  if (key === 'i' || key === 'I') type = "HIHAT";
  if (key === 'o' || key === 'O') type = "CYMBAL";
  
  for (let box of drumJudgeList) {
    if (box.name === type) box.triggered = false;
  }
}

function judgeDrumInput(instrumentType) {
  let closestNote = null;
  let minTimeDiff = Infinity;
  
  for (let note of drumNotes) {
    if (note.active && note.type === instrumentType) {
      let timeDiff = Math.abs(drumCurrentTime - note.time);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestNote = note;
      }
    }
  }
  
  // 판정 시간 윈도우 스케일 (오차범위 180ms 이내 합격)
  if (closestNote && minTimeDiff < 180) {
    closestNote.active = false;
    drumCombo++;
    drumScore += 1000;
    if (drumCombo > drumMaxCombo) drumMaxCombo = drumCombo;
  }
}
