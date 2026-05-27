let restartBtn;
let canvas;

// [추후 연동용] 임시 최종 점수 변수 (main.js 등 외부에서 받아올 값)
let finalScore = 8500; 
let gameGrade = "A"; 

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  
  // 등급 계산 함수 실행 (아래 주석 해제하여 사용)
  // calculateGrade(finalScore);

  // 다시 플레이 버튼 생성 및 초기화
  initRestartButton();
}

function draw() {
  // 시작 화면과 통일된 세련된 다크 모드 배경
  background(15, 23, 42); 
  
  // 은은한 그리드 효과 유지
  drawBackgroundGrid();

  // 버튼 위치 동적 업데이트 (화면 크기 변경 대응)
  updateButtonPosition();

  // 1. 상단 타이틀 (GAME OVER / RESULT)
  push();
  textAlign(CENTER, CENTER);
  textFont('Helvetica');
  textStyle(BOLD);
  textSize(width * 0.05);
  fill('#FF4655'); // 끝화면 느낌을 주는 강렬한 레드 포인트
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 70, 85, 0.6)';
  text("GAME OVER", width / 2, height * 0.2);
  pop();

  // 2. 점수 및 등급 표시 구역
  push();
  textAlign(CENTER, CENTER);
  
  // 점수 텍스트
  textSize(width * 0.025);
  fill(241, 245, 249);
  text("FINAL SCORE : " + finalScore, width / 2, height * 0.35);
  
  // 등급 텍스트 (네온 효과 강조)
  textSize(width * 0.07);
  textStyle(BOLD);
  fill('#00E5FF'); // 사이언 블루로 등급 강조
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = 'rgba(0, 229, 255, 0.7)';
  text(gameGrade, width / 2, height * 0.48); 
  pop();

  // 3. 하단 제작 크레딧 (CREDITS)
  drawCredits();
}

// 버튼 생성 및 스타일링
function initRestartButton() {
  restartBtn = createButton('PLAY AGAIN');
  
  // 시작 화면과 통일된 버튼 스타일 적용
  restartBtn.style('background-color', '#00E5FF');
  restartBtn.style('color', '#000000');
  restartBtn.style('font-family', 'Helvetica');
  restartBtn.style('font-weight', 'bold');
  restartBtn.style('border', 'none');
  restartBtn.style('border-radius', '8px');
  restartBtn.style('cursor', 'pointer');
  restartBtn.style('transition', 'all 0.2s ease');
  
  // 마우스 오버 효과
  restartBtn.mouseOver(() => {
    restartBtn.style('transform', 'scale(1.05)');
    restartBtn.style('box-shadow', '0px 0px 15px rgba(0, 229, 255, 0.5)');
  });
  restartBtn.mouseOut(() => {
    restartBtn.style('transform', 'scale(1)');
    restartBtn.style('box-shadow', 'none');
  });

  // 버튼 클릭 시 이벤트 (시작 화면으로 이동하는 로직 등 추가 가능)
  restartBtn.mousePressed(() => {
    alert("게임을 다시 시작합니다! (메인 화면 전환 로직 필요)");
  });
}

// 반응형 버튼 위치 조정
function updateButtonPosition() {
  let btnWidth = max(220, width * 0.16);
  let btnHeight = 55;
  restartBtn.size(btnWidth, btnHeight);
  // 점수판 하단, 크레딧 상단 사이에 배치
  restartBtn.position(width / 2 - btnWidth / 2, height * 0.62);
}

// 제작 크레딧 렌더링 함수
function drawCredits() {
  let creditY = height * 0.78;
  let boxW = min(500, width * 0.8);
  
  // 크레딧을 감싸는 은은한 박스 선
  push();
  rectMode(CENTER);
  noFill();
  stroke(30, 41, 59);
  strokeWeight(1.5);
  rect(width / 2, creditY + 30, boxW, 100, 10);
  pop();

  // 크레딧 타이틀
  push();
  textAlign(CENTER, TOP);
  textSize(13);
  textStyle(BOLD);
  fill(148, 163, 184); // 톤다운된 회색
  text("— PRODUCTION CREDITS —", width / 2, creditY);
  pop();

  // 세션별 이름 (가로 정렬 구조)
  push();
  textAlign(CENTER, TOP);
  textSize(14);
  fill(218, 223, 230);
  
  let spacing = boxW / 4; // 가로 균등 분할 간격
  let startX = width / 2;

  // 드럼
  text("🥁 드럼\n김도경", startX - spacing, creditY + 25);
  // 베이스
  text("🎸 베이스\n김도현", startX, creditY + 25);
  // 건반
  text("🎹 건반\n방준혁", startX + spacing, creditY + 25);
  pop();
}

// 배경 그리드선 (시작화면과 동일)
function drawBackgroundGrid() {
  stroke(30, 41, 59, 100);
  strokeWeight(1);
  for (let i = 0; i < width; i += 60) { line(i, 0, i, height); }
  for (let j = 0; j < height; j += 60) { line(0, j, width, j); }
}

// 창 크기 변경 시 실시간 대응
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// F키 풀스크린 토글 유지
function keyPressed() {
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

/* ==============================================================
   [추후 main.js 통합용 주석 처리 구역]
   최종 점수를 기반으로 등급을 계산하여 gameGrade 변수에 대입하는 함수입니다.
   main.js에서 이 함수를 호출하거나 점수를 넘겨받을 때 주석을 풀고 사용하세요.

function calculateGrade(score) {
  if (score >= 9000) {
    gameGrade = "A";
  } else if (score >= 7500) {
    gameGrade = "B";
  } else if (score >= 6000) {
    gameGrade = "C";
  } else {
    gameGrade = "F";
  }
}
============================================================== */