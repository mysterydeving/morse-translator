const MORSE_CODE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
    'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', 
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', 
    '9': '----.', '0': '-----',
    ',': '--..--', '.': '.-.-.-', '?': '..--..', '/': '-..-.', 
    '-': '-....-', '(': '-.--.', ')': '-.--.-', ' ': '/'
};

const inputField = document.getElementById('inputText');
const outputField = document.getElementById('outputText');
const modeSelect = document.getElementById('mode');
const playBtn = document.getElementById('playBtn');

function textToMorse(text) {
    return text.toUpperCase().split('')
        .filter(c => c in MORSE_CODE)
        .map(c => MORSE_CODE[c])
        .join(' ');
}

function morseToText(morse) {
    const inverse = Object.fromEntries(Object.entries(MORSE_CODE).map(([k,v]) => [v,k]));
    return morse.split(' ')
        .filter(code => code === '/' || inverse[code])
        .map(code => code === '/' ? ' ' : inverse[code])
        .join('');
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function translateRealTime() {
    let input = inputField.value;

    if(modeSelect.value === 'text_to_morse') {
        input = input.toUpperCase().split('').filter(c => c in MORSE_CODE).join('');
        inputField.value = input;
        outputField.value = textToMorse(input);
    } else {
        input = input.split('').filter(c => ['.', '-', ' ', '/'].includes(c)).join('');
        inputField.value = input;
        outputField.value = morseToText(input);
    }
}

inputField.addEventListener('input', debounce(translateRealTime, 200));
modeSelect.addEventListener('change', translateRealTime);

playBtn.addEventListener('click', () => {
    const morseText = outputField.value.trim();
    if(!morseText) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const unit = 0.15;
    let time = audioCtx.currentTime;

    for(const char of morseText) {
        if(char === '.') {
            playTone(audioCtx, time, unit);
            time += unit + unit;
        } else if(char === '-') {
            playTone(audioCtx, time, unit*3);
            time += unit*3 + unit;
        } else if(char === ' ') {
            time += unit*2;
        } else if(char === '/') {
            time += unit*4;
        }
    }

    function playTone(ctx, startTime, duration) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'quad';
        oscillator.frequency.setValueAtTime(500, ctx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNode.gain.setValueAtTime(0.2, startTime);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
});
