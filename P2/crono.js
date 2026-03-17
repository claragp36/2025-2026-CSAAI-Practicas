// VARIABLES GLOBALES
let claveSecreta = [];
let partidaActiva = true;
let segundos = 0;
let intervalo;
let intentos = 7;

// Botones números
let btn0 = document.getElementById("btn0");
let btn1 = document.getElementById("btn1");
let btn2 = document.getElementById("btn2");
let btn3 = document.getElementById("btn3");
let btn4 = document.getElementById("btn4");
let btn5 = document.getElementById("btn5");
let btn6 = document.getElementById("btn6");
let btn7 = document.getElementById("btn7");
let btn8 = document.getElementById("btn8");
let btn9 = document.getElementById("btn9");

// Casillas
let casillas = [
    document.getElementById("casilla1"),
    document.getElementById("casilla2"),
    document.getElementById("casilla3"),
    document.getElementById("casilla4")
];

// Contadores
let intentosHTML = document.getElementById("intentos");
let intentos_consumidos = 0;
let intentosterxtoHTML = document.getElementById("texto_intentos");
let contadorHTML = document.getElementById("contador");
let texto_info = document.getElementById("info");

// Botones control
let start = document.getElementById("start");
let stop = document.getElementById("stop");
let reset = document.getElementById("reset");

// ------------------------------------------------------------
// FUNCIONES

// Generar clave aleatoria sin numeros repetidos
function generarClave() {
    claveSecreta = [];
    while (claveSecreta.length < 4) {
        let num = Math.floor(Math.random() * 10);
        if (!claveSecreta.includes(num)) {
            claveSecreta.push(num);
        }
    }
    console.log("Clave secreta:", claveSecreta);
}

// Bloquear todos los botones numéricos
function bloquearBotones() {
    let botones = document.querySelectorAll("#teclado button");
    botones.forEach(b => b.disabled = true);
}

// Activar todos los botones numéricos
function activarBotones() {
    let botones = document.querySelectorAll("#teclado button");
    botones.forEach(b => b.disabled = false);
}

// Mostrar casillas
function mostrarCasillas() {
    for (let i = 0; i < 4; i++) {
        casillas[i].textContent = casillas[i].textContent || "*";
    }
}

// Cronómetro
function actualizarCrono() {
    segundos++;
    let h = Math.floor(segundos / 3600);
    let m = Math.floor((segundos % 3600) / 60);
    let s = segundos % 60;
    contadorHTML.textContent =
        String(h).padStart(2, "0") + ":" +
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
}

// Bloquear todos los botones (Reset)
function activarBotones() {
    let botones = document.querySelectorAll("#teclado button");
    botones.forEach(b => {
        b.classList.remove("bloqueado");
        b.disabled = false;
        b.style.border = "1px solid rgb(10, 224, 10)";
        b.style.color = "rgb(10, 224, 10)";
    });
}
// Comprobar si ganaste o perdiste
function comprobarVictoria() {
    let completado = true;
    for (let i = 0; i < 4; i++) {
        if (casillas[i].textContent == "*") {
            completado = false;
        }
    }

    if (completado) {
        document.getElementById("info").innerText = "👏🏼 ¡VICTORIA! Tiempo: " + document.getElementById("contador").innerText + ". Intentos consumidos: " + intentos_consumidos + ". Intentos restantes: " + intentosHTML.textContent + " 👏🏼";
        document.getElementById("info").style.color = "green"
        partidaActiva = false;
        clearInterval(intervalo);
    }

    if (intentos == 0 && !completado) {
        document.getElementById("info").innerText = "💥 ¡DERROTA! Tiempo: " + document.getElementById("contador").innerText + ". Intentos restantes: 0" + ". La clave era: " + claveSecreta.join("") + " 💥";
        document.getElementById("info").style.color = "red"
        partidaActiva = false;
        clearInterval(intervalo);
    }
    if (intentos < 0) {
        document.getElementById("info").innerText = "💥 ¡DERROTA! Tiempo: " + document.getElementById("contador").innerText + ". Intentos restantes: 0" + ". La clave era: " + claveSecreta.join("") + " 💥";
        document.getElementById("info").style.color = "red"
        partidaActiva = false;
        clearInterval(intervalo);
    }
}

// Pulsar un número
function agregarNumero(num, boton) {
    if (!partidaActiva) return;

    // bloquear botón
    boton.disabled = true;
    boton.style.border = "1px solid rgb(100, 100, 100)";
    boton.style.color = "rgb(100, 100, 100)";
    boton.classList.add("bloqueado");

    let encontrado = false;

    for (let i = 0; i < 4; i++) {
        if (claveSecreta[i] === num) {
            casillas[i].textContent = num;
            casillas[i].style.color = "green";
            encontrado = true;
            intentos_consumidos++;
            intentos--;
            intentosHTML.textContent = intentos;
        }
    }

    if (!encontrado) {
        intentos_consumidos++;
        intentos--;
        intentosHTML.textContent = intentos;
    }
    comprobarVictoria();
}

// ------------------------------------------------------------
// EVENTOS

btn0.onclick = () => agregarNumero(0, btn0);
btn1.onclick = () => agregarNumero(1, btn1);
btn2.onclick = () => agregarNumero(2, btn2);
btn3.onclick = () => agregarNumero(3, btn3);
btn4.onclick = () => agregarNumero(4, btn4);
btn5.onclick = () => agregarNumero(5, btn5);
btn6.onclick = () => agregarNumero(6, btn6);
btn7.onclick = () => agregarNumero(7, btn7);
btn8.onclick = () => agregarNumero(8, btn8);
btn9.onclick = () => agregarNumero(9, btn9);

start.onclick = () => {
    if (!partidaActiva) return; // no hace nada si la partida terminó
    clearInterval(intervalo);    // por si estaba corriendo
    intervalo = setInterval(actualizarCrono, 1000);
};

stop.onclick = () => {
    clearInterval(intervalo);
};

reset.onclick = () => {
    document.getElementById("info").innerText = "💣 Nueva partida comenzada ¡Suerte para desactivar la bomba! 💣"
    document.getElementById("info").style.color = "green"
    activarBotones()
    clearInterval(intervalo);
    generarClave();
    partidaActiva = true;
    segundos = 0;
    contadorHTML.textContent = "00:00:00";
    intentos = 7;
    intentosHTML.textContent = intentos;
    casillas.forEach(c => {
        c.textContent = "*";
        c.style.color = "red"; // el asterisco se muestra en rojo
    });
    intervalo = setInterval(actualizarCrono, 1000);
};

// ------------------------------------------------------------
// Inicializar al cargar la página
window.onload = function () {
    generarClave();
    partidaActiva = true;
    segundos = 0;
    contadorHTML.textContent = "00:00:00";
    texto_intentos = "Intentos restantes: "
    intentosterxtoHTML.textContent = texto_intentos;
    intentos = 7;
    intentosHTML.textContent = intentos;
    intervalo = setInterval(actualizarCrono, 1000);
};