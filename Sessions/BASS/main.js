// 상대 경로를 이용해 각 폴더의 파일을 가져옵니다.
import { playBass } from './BASS/sketch.js';
import { playKeyboard } from './keyboard/keyboardService.js';

function main() {
    console.log("밴드 합주 시작!");
    playBass();
    playKeyboard();
}

main();
