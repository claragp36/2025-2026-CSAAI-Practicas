const pairsData = {
    "casa-cama": { words: ["CASA", "CAMA"], emojis: ["🏠", "🛏️"] },
    "sol-sal": { words: ["SOL", "SAL"], emojis: ["☀️", "🧂"] },
    "perro-pato": { words: ["PERRO", "PATO"], emojis: ["🐶", "🦆"] },
    "frente-diente": { words: ["FRENTE", "DIENTE"], emojis: ["👦", "🦷"] }
};

const levelsPattern = [
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
];

let state = {
    currentLevel: 1,
    seconds: 0,
    isMusicOn: false,
    timerInterval: null,
    gameTimeout: null,
    isStopping: false
};

const ui = {
    btnStart: document.getElementById('btn-start'),
    btnStop: document.getElementById('btn-stop'),
    btnMusic: document.getElementById('btn-music'),
    activeWord: document.getElementById('active-word'),
    levelLabel: document.getElementById('current-level'),
    timerLabel: document.getElementById('timer'),
    cells: document.querySelectorAll('.cell'),
    audioMenu: document.getElementById('audio-menu'),
    audioGame: document.getElementById('audio-game'),
    selectPair: document.getElementById('select-pair'),
    selectLevel: document.getElementById('select-start-level')
};

function toggleMusic() {
    state.isMusicOn = !state.isMusicOn;
    ui.btnMusic.textContent = `Música: ${state.isMusicOn ? 'ON' : 'OFF'}`;
    
    if (state.isMusicOn) {
        if (!ui.btnStop.disabled) ui.audioGame.play();
        else ui.audioMenu.play();
    } else {
        ui.audioMenu.pause();
        ui.audioGame.pause();
    }
}

function updateTimer() {
    state.seconds++;
    const m = Math.floor(state.seconds / 60).toString().padStart(2, '0');
    const s = (state.seconds % 60).toString().padStart(2, '0');
    ui.timerLabel.textContent = `${m}:${s}`;
}

async function playRound(lvl) {
    if (state.isStopping) return;
    
    const pair = pairsData[ui.selectPair.value];
    const pattern = levelsPattern[lvl - 1];
    const speed = 1000 - (lvl * 150);

    ui.levelLabel.textContent = lvl;
    
    // Rellenar cuadrícula
    ui.cells.forEach((cell, i) => {
        cell.textContent = pair.emojis[pattern[i]];
        cell.classList.remove('active');
    });

    ui.activeWord.textContent = `PREPARA EL NIVEL ${lvl}...`;
    await new Promise(r => state.gameTimeout = setTimeout(r, 1500));

    for (let i = 0; i < 8; i++) {
        if (state.isStopping) return;
        const cell = ui.cells[i];
        cell.classList.add('active');
        ui.activeWord.textContent = pair.words[pattern[i]];
        ui.activeWord.style.color = "var(--highlight)";

        await new Promise(r => state.gameTimeout = setTimeout(r, speed));
        cell.classList.remove('active');
    }
}

async function startGame() {
    state.isStopping = false;
    ui.btnStart.disabled = true;
    ui.btnStop.disabled = false;
    ui.selectPair.disabled = true;
    ui.selectLevel.disabled = true;

    state.seconds = 0;
    ui.timerLabel.textContent = "00:00";
    state.timerInterval = setInterval(updateTimer, 1000);

    if (state.isMusicOn) {
        ui.audioMenu.pause();
        ui.audioGame.play();
    }

    const startLvl = parseInt(ui.selectLevel.value);
    for (let l = startLvl; l <= 5; l++) {
        if (state.isStopping) break;
        await playRound(l);
    }

    if (!state.isStopping) {
        ui.activeWord.textContent = "¡COMPLETADO!";
        setTimeout(stopGame, 2000);
    }
}

function stopGame() {
    state.isStopping = true;
    clearInterval(state.timerInterval);
    clearTimeout(state.gameTimeout);

    ui.btnStart.disabled = false;
    ui.btnStop.disabled = true;
    ui.selectPair.disabled = false;
    ui.selectLevel.disabled = false;

    ui.audioGame.pause();
    ui.audioGame.currentTime = 0;
    if (state.isMusicOn) ui.audioMenu.play();

    ui.cells.forEach(c => {
        c.classList.remove('active');
        c.textContent = "";
    });
    ui.activeWord.style.color = "#ffffff";
}

ui.btnStart.addEventListener('click', startGame);
ui.btnStop.addEventListener('click', stopGame);
ui.btnMusic.addEventListener('click', toggleMusic);