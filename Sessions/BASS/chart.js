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