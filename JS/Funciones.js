const botones = document.querySelectorAll('.nav-btn');
const secciones = document.querySelectorAll('.seccion');
const hora = document.getElementById('hora');
const imagen = document.getElementById('imagenCumple');
const audio = document.getElementById('audioPerrito');




imagen.addEventListener('click', () => {

    audio.currentTime = 0; // reinicia el audio
    audio.play();

});

// Cambiar de sección
botones.forEach(btn => {

    btn.addEventListener('click', () => {

        // quitar activo de botones
        botones.forEach(b => b.classList.remove('activo'));

        // activar botón actual
        btn.classList.add('activo');

        // ocultar secciones
        secciones.forEach(sec => sec.classList.remove('activa'));

        // mostrar sección correspondiente
        const destino = btn.dataset.target;

        document.getElementById(destino).classList.add('activa');

    });

});


// Reloj holográfico
function actualizarHora(){

    const ahora = new Date();

    hora.textContent = ahora.toLocaleTimeString('es-AR');

}

setInterval(actualizarHora,1000);

actualizarHora();

// ======================================================
// FUNCIÓN: activarPulsoNeonEnTiempoReal(audio)
// Analiza el audio y hace que el neón siga el volumen.
// ======================================================

const audioPerrito = document.getElementById('audioPerrito');

// Activar análisis en tiempo real
activarPulsoNeonEnTiempoReal(audioPerrito);
function activarPulsoNeonEnTiempoReal(audio){

    if(!audio) return;

    let contexto;
    let analizador;
    let datos;
    let iniciado = false;

    async function iniciarAnalisis(){

        if(iniciado) return;

        iniciado = true;

        contexto = new (window.AudioContext || window.webkitAudioContext)();

        // Necesario por políticas del navegador
        if(contexto.state === 'suspended'){
            await contexto.resume();
        }

        const fuente = contexto.createMediaElementSource(audio);

        analizador = contexto.createAnalyser();

        analizador.fftSize = 256;

        fuente.connect(analizador);
        analizador.connect(contexto.destination);

        datos = new Uint8Array(analizador.frequencyBinCount);

        analizar();

    }

    function analizar(){

        if(audio.paused || audio.ended){

            // Vuelve el neón a cero suavemente
            document.documentElement.style.setProperty('--nivel-neon', '0');
            return;

        }

        analizador.getByteFrequencyData(datos);

        // Promedio de energía
        let suma = 0;

        for(let i = 0; i < datos.length; i++){
            suma += datos[i];
        }

        const promedio = suma / datos.length;

        // Normalizar 0 → 1
        let nivel = promedio / 255;

        // Amplificar un poco para que se note más
        nivel = Math.min(1, nivel * 2.2);

        // Suavizado (evita parpadeos)
        const actual = parseFloat(
            getComputedStyle(document.documentElement)
                .getPropertyValue('--nivel-neon')
        ) || 0;

        const suavizado = actual + (nivel - actual) * 0.15;

        document.documentElement.style.setProperty(
            '--nivel-neon',
            suavizado.toFixed(3)
        );

        requestAnimationFrame(analizar);

    }

    // Arranca cuando el usuario reproduce el audio
    audio.addEventListener('play', iniciarAnalisis);

}