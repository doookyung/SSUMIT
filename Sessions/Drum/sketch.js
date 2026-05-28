let score = 0;
let combo = 0;

// ==========================================
// [설정] 박자/시간 동기화용 변수
// ==========================================
let SONG_BPM = 40;      // 플레이할 음악의 BPM
let songStartTime = 0;   // 음악이 시작된 절대 시간
let isPlaying = false;   // 게임/음악 재생 여부

// 시퀀서 채보 작성용 임시 추적 변수
let currentBeatTracker = 0; 

// 박자 정의 상수 (4분음표 = 1.0 박자 기준)
const NOTE_1  = 4.0;
const NOTE_2  = 2.0;
const NOTE_4  = 1.0;
const NOTE_8  = 0.5;
const NOTE_16 = 0.25;
const NOTE_D4 = 1.5;
const NOTE_D8 = 0.75;

let capture;
let prevFrame; 

// [설정] 각 악기별 오선지 기준 Y 좌표 정의
let yRide   = 235;  
let yHihat  = 250;  
let yTom1   = 265;  
let yTom2   = 280;  
let ySnare  = 295;  
let yFloor  = 325;  
let yKick   = 355;  

let judgeList = []; 
let notes = []; // 채보 함수들이 자동으로 노트를 채워 넣을 배열

function preload(){
  // 웹 iFrame 환경 내에서 미디어 로드 실패 대비 예외 처리 추가
  try {
    bgm = loadSound('music/126.mp3');
  } catch (e) {
    console.log("음악 파일을 불러올 수 없습니다. 웹캠 모션 및 키 입력 테스트 모드로 진행합니다.");
  }
}

// ==========================================
// 🎵 [핵심] 누적 박자 계산식 및 채보 작성 구역
// ==========================================
function beatToTime(beat) {
  // 현재 BPM 기준으로 '몇 번째 박자'를 '밀리초(ms)' 단위 시간으로 변환합니다.
  return (beat * 60 / SONG_BPM) * 1000;
}

// 노트를 찍는 함수
function drum(type) {
  let targetY = ySnare; // 기본값
  if (type === 'Ride') targetY = yRide;
  else if (type === 'Hihat') targetY = yHihat;
  else if (type === 'Tom1') targetY = yTom1;
  else if (type === 'Tom2') targetY = yTom2;
  else if (type === 'Snare') targetY = ySnare;
  else if (type === 'FloorTom') targetY = yFloor;
  else if (type === 'Kick') targetY = yKick;
  else if (type === 'Crash') targetY = yHihat; // 크래시는 하이햇 라인 근처에 생성

  let timeMs = beatToTime(currentBeatTracker);

  notes.push({
    time: timeMs,
    y: targetY,
    type: type
  });
}

// 타임라인을 밀어주는 함수
function rest(beatLength) {
  currentBeatTracker += beatLength;
}

// 실제 채보를 작성하는 공간 (이전 파일 방식과 100% 동일)
function createChart() {
  notes = [];
  currentBeatTracker = 0;

  // 0마디: 곡 시작 후 4박자 동안 대기
  rest(NOTE_1); 

  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Kick'); rest(NOTE_8); 
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat'); drum('Kick'); rest(NOTE_8); 

  drum('Hihat');               rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);

  drum('Hihat'); drum('Kick'); rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat'); drum('Kick'); rest(NOTE_8);

  drum('Hihat');               rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Kick'); rest(NOTE_8); 
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat'); drum('Kick'); rest(NOTE_8); 
  
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat');               rest(NOTE_16);
  drum('Hihat');               rest(NOTE_16);
  
  drum('Crash'); drum('kick'); rest(NOTE_4);
  drum('Hihat'); drum('Snare');drum('Kick'); rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');drum('Kick'); rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);

  drum('Hihat'); drum('Kick'); rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat'); drum('Kick'); rest(NOTE_8);
  
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  
  drum('Crash'); drum('Kick'); rest(NOTE_4);
  drum('Hihat'); drum('Snare');rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Hihat');               rest(NOTE_8);
  drum('Crash'); drum('Kick'); rest(NOTE_8);
  drum('Crash'); drum('Kick'); rest(NOTE_8);
  drum('Crash'); drum('Kick'); rest(NOTE_8);
  
                               rest(NOTE_8);
                 drum('Tom1'); rest(NOTE_16);
                 drum('Tom1'); rest(NOTE_16);
                 drum('Tom2'); rest(NOTE_16);
                 drum('Tom2'); rest(NOTE_16);
                 drum('FloorTom'); rest(NOTE_8);
                 drum('Snare'); drum('FloorTom'); rest(NOTE_4);
                 drum('Snare'); drum('FloorTom'); rest(NOTE_4);

}

function mousePressed(){
  if (!isPlaying) {
    if (bgm && typeof bgm.play === 'function') {
      bgm.play();
    }
    songStartTime = millis(); // 음악이 켜진 시점의 시스템 ms 저장
    isPlaying = true;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(400, 150); 
  capture.hide(); 
  
  prevFrame = createImage(400, 150);

  // 채보 데이터를 자동으로 빌드합니다.
  createChart();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === '1') {
    let fs = fullscreen();
    fullscreen(!fs);
    resizeCanvas(windowWidth, windowHeight);
    return;
  }

  let pressedType = "";
  if (key === ' ') pressedType = "Kick";
  else if (key === 'u' || key === 'U') pressedType = "Snare";
  else if (key === 'i' || key === 'I') pressedType = "Tom1";
  else if (key === 'f' || key === 'F') pressedType = "Tom2";
  else if (key === 'h' || key === 'H') pressedType = "FloorTom";
  else if (key === 'r' || key === 'R') pressedType = "Hihat";
  else if (key === 'e' || key === 'E') pressedType = "Ride";

  if (pressedType !== "") {
    checkHit(pressedType);
  }
}

function checkHit(pressedType) {
  if (!isPlaying) return;
  
  let currentSongTime = millis() - songStartTime; // 현재 음악 재생 소요 시간(ms)
  let hitWindowMs = 120; // 판정 범위 허용 시간 (ms 단위, 약 픽셀 환산 60에 해당)

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];

    if (note.type === pressedType) {
      let timeDiff = abs(note.time - currentSongTime); // 판정선 도달 시간과의 차이 계산

      if (timeDiff <= hitWindowMs) {
        let textResult = "";
        let colorResult = [0, 0, 0];

        // PERFECT (시간 차이 35ms 이하)
        if (timeDiff <= 35) {
          textResult = "PERFECT";
          colorResult = [0, 220, 100]; 
          score += 1000;               
          combo += 1;                  
        } 
        // GREAT (시간 차이 36ms ~ 120ms 사이)
        else {
          textResult = "GREAT";
          colorResult = [255, 180, 0]; 
          score += 500;                
          combo += 1;                  
        }
        
        let offset = (pressedType === "Hihat" || pressedType === "Ride" || pressedType === "Crash") ? -25 : 25;

        judgeList.push({
          text: textResult,
          color: colorResult,
          timer: 12,       
          maxTimer: 12,    
          yOffset: offset  
        });

        notes.splice(i, 1); 
        return; 
      }
    }
  }
}

// ==========================================
// ⚡ [수정] 모션 인식 감지 구간 및 민감도 정밀 제어 함수
// ==========================================
function checkCircleMotion(cx, cy, r) {
  capture.loadPixels();
  prevFrame.loadPixels();
  
  if (!capture.pixels || capture.pixels.length === 0 || !prevFrame.pixels || prevFrame.pixels.length === 0) {
    return false;
  }

  let motionCount = 0; 
  let totalPixelsChecked = 0;

  // 웹캠 영상 전체 픽셀 탐색 (경량화 및 정확도를 위해 간격 조절)
  for (let y = 0; y < capture.height; y += 2) {
    for (let x = 0; x < capture.width; x += 2) {
      // 지정된 중심 좌표(cx, cy)와 반지름(r) 내부의 픽셀인지 체크
      if (dist(x, y, cx, cy) < r) {
        totalPixelsChecked++;
        let index = (x + y * capture.width) * 4;
        
        let r1 = capture.pixels[index];
        let g1 = capture.pixels[index + 1];
        let b1 = capture.pixels[index + 2];
        
        let r2 = prevFrame.pixels[index];
        let g2 = prevFrame.pixels[index + 1];
        let b2 = prevFrame.pixels[index + 2];
        
        let diff = dist(r1, g1, b1, r2, g2, b2);
        
        // 픽셀 변화량 임계치를 50에서 65로 상향 조정 (노이즈로 인한 무인식 최소화)
        if (diff > 65) {
          motionCount++;
        }
      }
    }
  }
  
  // 전체 체크된 픽셀 중 약 20% 이상 확실하게 움직임이 일어났을 때만 "타격"으로 인정
  // 면적(r)이 줄어들었으므로 고정 픽셀 값 대신 비율 분석으로 정밀하게 변경했습니다.
  if (totalPixelsChecked === 0) return false;
  let motionRatio = motionCount / totalPixelsChecked;
  return motionRatio > 0.22; 
}

function draw() {
  background(20); 

  // 현재 음악이 재생된 지 몇 ms가 지났는지 계산 (미재생시 0)
  let currentSongTime = isPlaying ? (millis() - songStartTime) : 0;

  push();
  let scaleX = windowWidth / 1000;
  let scaleY = windowHeight / 800;
  let currentScale = min(scaleX, scaleY); 
  let offsetX = (windowWidth - 1000 * currentScale) / 2;
  let offsetY = (windowHeight - 800 * currentScale) / 2;
  translate(offsetX, offsetY);
  scale(currentScale);

  // [1] 상단: 카메라 화면 및 심벌 영역
  push();
  translate(300 + 400, 20); 
  scale(-1, 1);             
  image(capture, 0, 0, 400, 150); 
  pop(); 

  // ⚡ [수정] 원의 지름(감지폭)을 50에서 30으로 축소하여 좁은 영역의 손 움직임만 정교하게 받아들이게 변경!
  // 좌우 반전 영상 기준 원의 중심 좌표에 타이트하게 매핑
  let leftCircleHit = checkCircleMotion(320, 95, 30);
  let rightCircleHit = checkCircleMotion(80, 95, 30);

  if (leftCircleHit || rightCircleHit) {
    checkHit("Crash");
  }

  prevFrame.copy(capture, 0, 0, 400, 150, 0, 0, 400, 150);

  push();
  stroke(200); strokeWeight(3); noFill(); 
  rect(300, 20, 400, 150); 
  pop();

  // ⚡ [수정] 화면상에 그려지는 드로잉 가이드 파란 원 또한 실제 감지 반지름인 30(지름 60)에 맞추어 축소
  push();
  stroke(100, 150, 255); strokeWeight(4); noFill();               
  circle(380, 95, 60);  // 왼쪽 심벌 영역 (원본 좌표)
  circle(620, 95, 60);  // 오른쪽 심벌 영역 (원본 좌표)
  pop();

  // [2] 중단: 오선지 및 빨간색 타이밍 판정선
  let targetLine = 150; // 판정선 X 좌표 기준 위치
  push();
  stroke(200); strokeWeight(2); 
  let staffStartY = 250;
  let lineSpacing = 30;
  for (let i = 0; i < 5; i++) {
    line(50, staffStartY + lineSpacing * i, 950, staffStartY + lineSpacing * i);
  }
  stroke(255, 0, 0); strokeWeight(5);
  line(targetLine, staffStartY - 20, 150, staffStartY + lineSpacing * 4 + 20);
  pop();

  // [3] 중단 레이어: 시간(ms) 기반 음표 이동 알고리즘
  push();
  let speedMultiplier = 0.4; 

  for (let i = notes.length - 1; i >= 0; i--) {
    let note = notes[i];

    let noteX = targetLine + (note.time - currentSongTime) * speedMultiplier;

    // 플레이어가 치지 못하고 판정선(targetLine) 왼쪽 뒤로 완전히 넘어가 버렸을 때 MISS 처리
    if (noteX < targetLine - 60) {
      judgeList.push({
        text: "MISS",
        color: [255, 50, 50],
        timer: 12,       
        maxTimer: 12,
        yOffset: 0
      });
      notes.splice(i, 1);         
      combo = 0; // 미스 시 콤보 리셋
      continue;
    }

    // 화면 영역 내부에 들어왔을 때만 노트를 그려줍니다.
    if (noteX > 40 && noteX < 960) {
      if (note.type === 'Crash') drawCrashCymbal(noteX, note.y);
      else if (note.type === 'Hihat') drawHihat(noteX, note.y);
      else if (note.type === 'Ride') drawRideCymbal(noteX, note.y);
      else if (note.type === 'Snare') drawSnare(noteX, note.y);
      else if (note.type === 'Tom1') drawTom1(noteX, note.y); 
      else if (note.type === 'Tom2') drawTom2(noteX, note.y); 
      else if (note.type === 'FloorTom') drawFloorTom(noteX, note.y);
      else if (note.type === 'Kick') drawKick(noteX, note.y);
    }
  }
  pop();

  // 판정 글자 연출 드로잉
  push();
  textAlign(CENTER, CENTER); textStyle(BOLD);
  for (let i = judgeList.length - 1; i >= 0; i--) {
    let j = judgeList[i];
    let alphaValue = map(j.timer, 0, j.maxTimer, 0, 255);
    fill(j.color[0], j.color[1], j.color[2], alphaValue);
    let currentTextSize = map(j.timer, 0, j.maxTimer, 38, 48);
    textSize(currentTextSize);
    text(j.text, 500, 200 + j.yOffset); 
    j.yOffset -= 1.2; 
    j.timer--; 
    if (j.timer <= 0) judgeList.splice(i, 1);
  }
  pop();

  // [4] 하단: 드럼 세트 매핑 가이드 및 키 텍스트
  push();
  let drumY = 550; 
  textAlign(CENTER, CENTER); textSize(24); textStyle(BOLD);
  stroke(200); strokeWeight(2); line(250, drumY + 150, 250, drumY + 20); fill(40); ellipse(250, drumY + 20, 100, 20); fill(255, 0, 255); noStroke(); textSize(35); text("R", 250, drumY - 10);
  stroke(200); strokeWeight(2); fill(40); ellipse(350, drumY + 100, 100, 30); line(300, drumY + 100, 300, drumY + 160); line(400, drumY + 100, 400, drumY + 160); arc(350, drumY + 160, 100, 30, 0, PI); fill(255, 0, 0); noStroke(); textSize(24); text("U", 350, drumY + 100);
  stroke(200); strokeWeight(2); fill(40); ellipse(450, drumY, 80, 80); fill(255, 0, 0); noStroke(); text("I", 450, drumY);
  stroke(200); strokeWeight(2); fill(40); ellipse(550, drumY, 80, 80); fill(255, 0, 0); noStroke(); text("F", 550, drumY);
  
  push();
  let pedalX = 480; let pedalY = drumY + 110;
  stroke(200); strokeWeight(2); fill(50); rect(pedalX - 15, pedalY + 30, 30, 40, 5); 
  fill(80); beginShape(); vertex(pedalX - 10, pedalY + 35); vertex(pedalX + 10, pedalY + 35); vertex(pedalX + 13, pedalY + 65); vertex(pedalX - 13, pedalY + 65); endShape(CLOSE);
  stroke(200); strokeWeight(3); line(pedalX, pedalY + 30, pedalX, pedalY - 5); 
  fill(255); noStroke(); circle(pedalX, pedalY - 5, 14); 
  fill(255, 0, 0); textAlign(CENTER, CENTER); textSize(16); textStyle(BOLD); text("space", pedalX, pedalY + 15);
  pop();

  stroke(200); strokeWeight(2); fill(40); ellipse(650, drumY + 110, 120, 40); line(590, drumY + 110, 590, drumY + 180); line(710, drumY + 110, 710, drumY + 180); arc(650, drumY + 180, 120, 40, 0, PI); fill(255, 0, 0); noStroke(); textSize(24); text("H", 650, drumY + 110);
  stroke(200); strokeWeight(2); line(780, drumY + 180, 780, drumY - 10); fill(40); ellipse(780, drumY - 10, 120, 20); fill(255, 0, 255); noStroke(); textSize(35); text("E", 780, drumY - 40);
  pop();
  
  // UI 드로잉 시 현재 경과 시간 넘겨주기
  drawUI(currentSongTime); 
  pop();
}

function drawUI(currentSongTime) {
  fill(255); noStroke(); textAlign(LEFT, TOP); textStyle(BOLD); textSize(22);   
  text(`SCORE: ${score}`, 30, 30);
  text(`COMBO: ${combo}`, 30, 60);
  
  textSize(14); fill(150);
  text(`Time: ${(currentSongTime / 1000).toFixed(2)}s  |  FPS: ${Math.round(frameRate())}`, 30, 800 - 40);
}
  
// ==========================================
// 개별 음표 그래픽 렌더링 함수 세트
// ==========================================
function drawCrashCymbal(x, y) {
  stroke(255); strokeWeight(2); noFill(); circle(x, y, 24); 
  strokeWeight(3); line(x - 8, y - 8, x + 8, y + 8); line(x + 8, y - 8, x - 8, y + 8); 
}
function drawHihat(x, y) {
  stroke(255); strokeWeight(3); noFill(); line(x - 10, y - 10, x + 10, y + 10); line(x + 10, y - 10, x - 10, y + 10); 
}
function drawRideCymbal(x, y) {
  stroke(255); strokeWeight(2); fill(40); beginShape(); vertex(x, y - 12); vertex(x + 12, y); vertex(x, y + 12); vertex(x - 12, y); endShape(CLOSE); 
}
function drawSnare(x, y) {
  fill(255); noStroke(); push(); translate(x, y); rotate(-PI / 6); ellipse(0, 0, 32, 25); pop(); 
  stroke(255); strokeWeight(2); line(x + 12, y, x + 12, y - 50); 
  fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(18); textStyle(BOLD); text("U",x,y); 
}
function drawTom1(x, y) {
  fill(255); noStroke(); push(); translate(x, y); rotate(-PI / 6); ellipse(0, 0, 32, 25); pop(); 
  stroke(255); strokeWeight(2); line(x + 12, y, x + 12, y - 30); 
  fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(18); textStyle(BOLD); text("I", x, y); 
}
function drawTom2(x, y) {
  fill(255); noStroke(); push(); translate(x, y); rotate(-PI / 6); ellipse(0, 0, 32, 25); pop(); 
  stroke(255); strokeWeight(2); line(x + 12, y, x + 12, y - 30); 
  fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(18); textStyle(BOLD); text("F", x, y); 
}
function drawFloorTom(x, y) {
  fill(255); noStroke(); push(); translate(x, y); rotate(-PI / 6); ellipse(0, 0, 32, 25); pop(); 
  stroke(255); strokeWeight(2); line(x + 12, y, x + 12, y - 70); 
  fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(18); textStyle(BOLD); text("H", x, y);
}
function drawKick(x, y) {
  fill(255); noStroke(); push(); translate(x-5, y); rotate(-PI / 6); ellipse(0, 0, 32, 25); pop(); 
  stroke(255); strokeWeight(2); line(x + 12, y, x + 12, y - 90); 
  fill(0); noStroke(); textAlign(CENTER, CENTER); textSize(13); textStyle(BOLD); text("SPC", x-5, y);
}