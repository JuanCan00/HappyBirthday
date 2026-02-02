// ------------------------------------
// CONFIGURACIÓN DE CUMPLEAÑOS
// ------------------------------------
const DIA_CUMPLE = 7;   // cambia aquí el día
const MES_CUMPLE = 2;   // cambia aquí el mes (2 = febrero)

// Paleta de colores para los fuegos
const COLORES = [
    "#ff0043", // rojo
    "#00eaff", // azul
    "#ffe600", // amarillo
    "#00ff6a", // verde
    "#ff7b00", // naranja
    "#b400ff", // morado
    "#ffffff"  // blanco
];

// ------------------------------------
// REFERENCIAS AL DOM
// ------------------------------------
const mensaje = document.getElementById("mensaje");
const btnCelebrar = document.getElementById("btnCelebrar");
const canvas = document.getElementById("canvasFuegos");
const ctx = canvas.getContext("2d");
const audioFuegos = document.getElementById("audioFuegos");
const audioPregunta = document.getElementById("audioPregunta");
const cintaWrapper = document.querySelector(".cinta-wrapper");

// ------------------------------------
// FUNCIÓN PRINCIPAL: VERIFICAR CUMPLE
// ------------------------------------
function verificarCumple() {
    const dia = parseInt(document.getElementById("dia").value, 10);
    const mes = parseInt(document.getElementById("mes").value, 10);

    // Limpiamos mensaje y clases previas
    mensaje.innerHTML = "";
    mensaje.className = "";

    // Por defecto, ocultamos la cinta
    if (cintaWrapper) {
        cintaWrapper.classList.remove("cinta-activa");
    }

    // Detenemos audios antes de cualquier nueva acción
    audioFuegos.pause();
    audioFuegos.currentTime = 0;

    if (audioPregunta) {
        audioPregunta.pause();
        audioPregunta.currentTime = 0;
    }

    if (isNaN(dia) || isNaN(mes)) {
        mensaje.textContent = "Por favor, escribe un día y mes válidos.";
        detenerFuegos();
        return;
    }

    if (dia === DIA_CUMPLE && mes === MES_CUMPLE) {
        // Mensaje de cumpleaños

        document.body.classList.add("modo-cumple");

        mensaje.className = "mensaje-cumple";
        mensaje.innerHTML =
            "<strong>🎉 ¡Feliz cumpleaños!🎂</strong>" +
            "<p>Este nuevo año celebra todo lo que has aprendido, lo que has construido con esfuerzo y la fortaleza que te ha llevado a crecer cada día..😄</p>" +
             "Que la vida te siga abriendo caminos y que nunca falten razones para sentirte orgulloso de ti.</p>"+ "¡Lo mejor está en camino!</p>";
             

            


        // Activamos la cinta de imágenes
        if (cintaWrapper) {
            cintaWrapper.classList.add("cinta-activa");
        }

        // SONIDOS AL MISMO TIEMPO
        if (audioPregunta) {
            audioPregunta.currentTime = 0;
            audioPregunta.play().catch(() => {});
        }

        audioFuegos.currentTime = 0;
        audioFuegos.play().catch(() => {});

        // FUEGOS
        iniciarFuegos();
    } else {

        document.body.classList.remove("modo-cumple");

        mensaje.innerHTML =
            "<strong>Hoy no es tu cumpleaños...</strong>" +
            "<p>No es hoy, pero tranquilo que facebook avisa 😄</p>";

        // Ocultamos cinta y fuegos
        if (cintaWrapper) {
            cintaWrapper.classList.remove("cinta-activa");
        }
        detenerFuegos();
    }
}


// Click en el botón
btnCelebrar.addEventListener("click", verificarCumple);

// ENTER en el teclado
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        verificarCumple();
    }
});

// ------------------------------------
// FUEGOS ARTIFICIALES (CANVAS)
// ------------------------------------
let fuegosActivos = false;
let particulas = [];
let animacionId = null;

function redimensionarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", redimensionarCanvas);
redimensionarCanvas();

class Particula {
    constructor(x, y, velX, velY, vida, color) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.vida = vida;
        this.vidaMax = vida;
        this.color = color;
    }

    actualizar() {
        this.x += this.velX;
        this.y += this.velY;
        this.velY += 0.02; // “gravedad”
        this.vida--;
    }

    dibujar(ctx) {
        const opacidad = this.vida / this.vidaMax;
        ctx.globalAlpha = opacidad;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Explosión circular clásica
function crearExplosion(x, y) {
    const cantidad = 60;
    const color = COLORES[Math.floor(Math.random() * COLORES.length)];

    for (let i = 0; i < cantidad; i++) {
        const angulo = (Math.PI * 2 * i) / cantidad;
        const velocidad = Math.random() * 3 + 1;
        const velX = Math.cos(angulo) * velocidad;
        const velY = Math.sin(angulo) * velocidad;
        const vida = Math.floor(Math.random() * 50) + 40;

        particulas.push(
            new Particula(x, y, velX, velY, vida, color)
        );
    }
}

// Explosión en forma de corazón
function crearExplosionCorazon(x, y) {
    const puntos = 80;
    const color = COLORES[Math.floor(Math.random() * COLORES.length)];

    for (let i = 0; i < puntos; i++) {
        const t = (Math.PI * 2 * i) / puntos;

        const posX = 16 * Math.pow(Math.sin(t), 3);
        const posY =
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t);

        const velX = posX * 0.15;
        const velY = -posY * 0.15;

        particulas.push(
            new Particula(x, y, velX, velY, 70, color)
        );
    }
}

// Explosión tipo fuente hacia arriba
function crearExplosionFuente(x, y) {
    const cantidad = 150;
    const color = COLORES[Math.floor(Math.random() * COLORES.length)];

    for (let i = 0; i < cantidad; i++) {
        const velX = (Math.random() - 0.5) * 2;
        const velY = -Math.random() * 4 - 2;

        particulas.push(
            new Particula(x, y, velX, velY, 60, color)
        );
    }
}

// Elegir estilo aleatorio en cada lanzamiento
function lanzarFuegoArtificial() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    const tipo = Math.floor(Math.random() * 3);

    if (tipo === 0) {
        crearExplosion(x, y);           // circular
    } else if (tipo === 1) {
        crearExplosionCorazon(x, y);    // corazón
    } else {
        crearExplosionFuente(x, y);     // fuente
    }
}

// Bucle de animación
function loopFuegos() {
    if (!fuegosActivos) return;

    // Importante: no pintamos fondo negro, limpiamos y dejamos transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particulas = particulas.filter(p => p.vida > 0);

    particulas.forEach(p => {
        p.actualizar();
        p.dibujar(ctx);
    });

    if (Math.random() < 0.25) {
        for (let i = 0; i < 3; i++) {
            lanzarFuegoArtificial();
        }
    }

    animacionId = requestAnimationFrame(loopFuegos);
}

function iniciarFuegos() {
    if (fuegosActivos) return;
    fuegosActivos = true;
    particulas = [];
    loopFuegos();
}

function detenerFuegos() {
    fuegosActivos = false;
    particulas = [];
    if (animacionId) {
        cancelAnimationFrame(animacionId);
        animacionId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
