// Configuración de parejas
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
    [1, 0, 1, 0, 1, 1, 0, 0]
];

// VARIABLES DE ESTADO (El cerebro del juego sin Promises)
let gameRunning = false;
let currentLevel = 1;
let currentStep = -1; // -1 significa "periodo de preparación"
let seconds = 0;
let isMusicOn = false;

// Relojes (Intervalos)
let masterClock = null; // Controla la secuencia de imágenes
let timerClock = null;  // Controla el tiempo transcurrido

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

// --- MÚSICA ---
function toggleMusic() {
    isMusicOn = !isMusicOn;
    ui.btnMusic.textContent = `Música: ${isMusicOn ? 'ON' : 'OFF'}`;
    ui.btnMusic.style.background = isMusicOn ? "#2e7d32" : "#444";

    if (isMusicOn) {
        if (gameRunning) ui.audioGame.play();
        else ui.audioMenu.play();
    } else {
        ui.audioMenu.pause();
        ui.audioGame.pause();
    }
}

// --- LÓGICA DEL RELOJ DEL JUEGO (LA ALTERNATIVA) ---
function gameTick() {
    const pair = pairsData[ui.selectPair.value];
    const pattern = levelsPattern[currentLevel - 1];

    // Limpiar resaltados anteriores siempre
    ui.cells.forEach(c => c.classList.remove('active'));

    // INCREMENTAR PASO
    currentStep++;

    if (currentStep < 8) {
        // EJECUCIÓN DE LA SECUENCIA (Pasos 0 al 7)
        const cell = ui.cells[currentStep];
        cell.classList.add('active');
        ui.activeWord.textContent = pair.words[pattern[currentStep]];
        ui.activeWord.style.color = "var(--highlight)";
    } 
    else {
        // FIN DE LA RONDA
        clearInterval(masterClock); // Detenemos el reloj actual
        
        if (currentLevel < 5) {
            currentLevel++;
            ui.activeWord.textContent = "¡SIGUIENTE!";
            ui.activeWord.style.color = "var(--secondary)";
            
            // Esperamos un momento y lanzamos el siguiente nivel
            setTimeout(startLevelSequence, 1500);
        } else {
            ui.activeWord.textContent = "¡FIN DEL JUEGO!";
            setTimeout(stopGame, 2000);
        }
    }
}

function startLevelSequence() {
    if (!gameRunning) return;

    const pair = pairsData[ui.selectPair.value];
    const pattern = levelsPattern[currentLevel - 1];
    const speed = 1100 - (currentLevel * 150);

    ui.levelLabel.textContent = currentLevel;
    ui.activeWord.textContent = `NIVEL ${currentLevel}`;
    ui.activeWord.style.color = "#fff";

    // Dibujar todos los emojis en la cuadrícula
    ui.cells.forEach((cell, i) => {
        cell.textContent = pair.emojis[pattern[i]];
    });

    currentStep = -1; // Reiniciamos los pasos para este nivel

    // Iniciamos el intervalo que moverá el resaltado
    // Sustituye al bucle 'for' y al 'await Promise'
    masterClock = setInterval(gameTick, speed);
}

// --- CONTROLES ---
function startGame() {
    gameRunning = true;
    ui.btnStart.disabled = true;
    ui.btnStop.disabled = false;
    ui.selectPair.disabled = true;
    ui.selectLevel.disabled = true;

    // Timer
    seconds = 0;
    ui.timerLabel.textContent = "00:00";
    timerClock = setInterval(() => {
        seconds++;
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        ui.timerLabel.textContent = `${m}:${s}`;
    }, 1000);

    // Música
    if (isMusicOn) {
        ui.audioMenu.pause();
        ui.audioGame.play();
    }

    currentLevel = parseInt(ui.selectLevel.value);
    startLevelSequence();
}

function stopGame() {
    gameRunning = false;
    
    // Limpiar todos los intervalos (crucial sin Promises)
    clearInterval(masterClock);
    clearInterval(timerClock);

    ui.btnStart.disabled = false;
    ui.btnStop.disabled = true;
    ui.selectPair.disabled = false;
    ui.selectLevel.disabled = false;

    // Música
    ui.audioGame.pause();
    ui.audioGame.currentTime = 0;
    if (isMusicOn) ui.audioMenu.play();

    // Reset Visual
    ui.cells.forEach(c => {
        c.classList.remove('active');
        c.textContent = "";
    });
    
    if (ui.activeWord.textContent !== "¡FIN DEL JUEGO!") {
        ui.activeWord.textContent = "DETENIDO";
    }
    ui.activeWord.style.color = "#fff";
}

ui.btnStart.addEventListener('click', startGame);
ui.btnStop.addEventListener('click', stopGame);
ui.btnMusic.addEventListener('click', toggleMusic);