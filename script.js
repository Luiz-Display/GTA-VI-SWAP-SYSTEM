window.addEventListener("DOMContentLoaded", () => {
  const handleXKey = (event) => {
    if (event.key.toLowerCase() === "x") {
      document.removeEventListener("keydown", handleXKey);

      // Para a música do trailer e inicia a do loading
      trailerTheme.pause();
      trailerTheme.currentTime = 0;

      loadingTheme
        .play()
        .catch((e) => console.warn("Erro ao tocar música de loading:", e));

      // Inicia o slider e depois carrega o personagem
      startLoadingSlider(() => {
        loadingTheme.pause();
        loadingTheme.currentTime = 0;

        loadCharacter();
      });
    }
  };

  document.addEventListener("keydown", handleXKey);
});

let activecharacter = "jason"; // Já começa com o Jason direto
let ambiencesound = new Audio("./assets/sounds/jasonambience.mp3");
ambiencesound.loop = true;
let currentAmbienceSound = ambiencesound;
let pausestatus = false;
let wheelstatus = false;
let pausesoundeffect = new Audio("./assets/sounds/jasonambience.mp3");
let spacerelease = true;
let selectedkeyboard = null;

const trailerTheme = new Audio("./assets/sounds/trailertheme.mp3");
trailerTheme.loop = true;
trailerTheme.volume = 1;

const loadingTheme = new Audio("./assets/sounds/loadingtheme.mp3");
loadingTheme.loop = true;
loadingTheme.volume = 1;

// Inicia trailer automaticamente ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  trailerTheme
    .play()
    .catch((e) => console.warn("Erro ao tocar música de trailer:", e));
});

function startAmbienceSound() {
  let newSrc = "";

  if (activecharacter === "jason") {
    newSrc = "./assets/sounds/jasonambience.mp3";
  } else if (activecharacter === "lucia") {
    newSrc = "./assets/sounds/luciaambience.mp3";
  }

  if (currentAmbienceSound && currentAmbienceSound.src.includes(newSrc)) {
    currentAmbienceSound.play().catch((e) => {
      console.warn("Erro ao retomar som ambiente:", e);
    });
    return;
  }

  if (currentAmbienceSound) {
    currentAmbienceSound.pause();
  }

  currentAmbienceSound = new Audio(newSrc);
  currentAmbienceSound.loop = true;

  if (!pausestatus && !wheelstatus) {
    currentAmbienceSound.play().catch((e) => {
      console.warn("Erro ao tocar novo som ambiente:", e);
    });
  }
}

function pauseambiencesound() {
  if (currentAmbienceSound && !currentAmbienceSound.paused) {
    currentAmbienceSound.pause();
  }
}

function loadcharacterwheel() {
  const switchsound = new Audio("./assets/sounds/switchcharactersound.mp3");
  switchsound.loop = true;

  let barracheck = false;

  const wheel = document.createElement("div");
  wheel.id = "character-wheel";

  const leftSide = document.createElement("div");
  leftSide.className = "side left";
  const leftPortrait = document.createElement("img");
  leftPortrait.src = "./assets/jason-lucia/luciaportrait.png";
  leftPortrait.className = "portrait";
  leftSide.appendChild(leftPortrait);

  const rightSide = document.createElement("div");
  rightSide.className = "side right";
  const rightPortrait = document.createElement("img");
  rightPortrait.src = "./assets/jason-lucia/jasonportrait.png";
  rightPortrait.className = "portrait";
  rightSide.appendChild(rightPortrait);

  const divider = document.createElement("div");
  divider.className = "divider";

  wheel.appendChild(leftSide);
  wheel.appendChild(rightSide);
  wheel.appendChild(divider);
  document.body.appendChild(wheel);

  leftSide.addEventListener("click", () => {
    if (activecharacter !== "lucia") switchcharacter("lucia");
    spacerelease = false;
  });

  rightSide.addEventListener("click", () => {
    if (activecharacter !== "jason") switchcharacter("jason");
    spacerelease = false;
  });

  // Teclado: setas esquerda/direita
  document.addEventListener("keydown", handleArrowKeys);

  function handleArrowKeys(event) {
    if (!wheelstatus) return;

    if (event.code === "ArrowLeft") {
      selectedkeyboard = "left";
      removeswap();
      createswap("left");
    } else if (event.code === "ArrowRight") {
      selectedkeyboard = "right";
      removeswap();
      createswap("right");
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && spacerelease && !barracheck && !pausestatus) {
      barracheck = true;
      spacerelease = false;

      const video = document.getElementById("bg-video");
      if (video) {
        video.classList.add("low-saturation");
        video.playbackRate = 0.4;
      }

      switchsound.currentTime = 0;
      switchsound.play().catch((e) => {
        console.warn("Erro ao tocar som:", e);
      });

      wheel.style.display = "flex";
      wheelstatus = true;

      pauseambiencesound();
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
      barracheck = false;
      spacerelease = true;

      const video = document.getElementById("bg-video");
      if (video) {
        video.classList.remove("low-saturation");
        video.playbackRate = 1;
      }

      switchsound.pause();
      switchsound.currentTime = 0;

      wheel.style.display = "none";
      wheelstatus = false;

      document.removeEventListener("keydown", handleArrowKeys); // limpa evento de setas

      if (selectedkeyboard === "left" && activecharacter !== "lucia") {
        switchcharacter("lucia");
      } else if (selectedkeyboard === "right" && activecharacter !== "jason") {
        switchcharacter("jason");
      }

      selectedkeyboard = null;
      removeswap();

      startAmbienceSound();
    }
  });

  leftSide.addEventListener("mouseenter", () => createswap("left"));
  leftSide.addEventListener("mouseleave", removeswap);
  rightSide.addEventListener("mouseenter", () => createswap("right"));
  rightSide.addEventListener("mouseleave", removeswap);
}

function switchcharacter(character) {
  const video = document.getElementById("bg-video");
  if (!video) return;

  const source = document.createElement("source");
  source.type = "video/mp4";

  if (character === "lucia") {
    source.src = "./assets/jason-lucia/luciaactive.mp4";
    activecharacter = "lucia";
  } else {
    source.src = "./assets/jason-lucia/jasonactive.mp4";
    activecharacter = "jason";
  }

  const newVideo = video.cloneNode();
  newVideo.innerHTML = "";
  newVideo.appendChild(source);
  newVideo.load();
  newVideo.play();

  video.replaceWith(newVideo);
  newVideo.id = "bg-video";

  if (currentAmbienceSound) {
    currentAmbienceSound.pause();
    currentAmbienceSound.currentTime = 0;
  }

  startAmbienceSound();
}

function startLoadingSlider(callbackAfterFinish) {
  const imageCount = 9;
  const displayDuration = 30000; // tempo total do loading
  const imageChangeInterval = 9000; // tempo entre trocas

  const sliderContainer = document.getElementById("loading-slider");
  sliderContainer.style.display = "block";

  // Gera 5 imagens aleatórias únicas
  const usedIndices = new Set();
  while (usedIndices.size < 5) {
    usedIndices.add(Math.floor(Math.random() * imageCount) + 1);
  }

  const imagePaths = Array.from(usedIndices).map(
    (i) => `./assets/wallpapers/bg${i}.jpg`
  );

  // Cria o innerHTML com todas as imagens, incluindo índice e classes
  let innerHTML = "";
  imagePaths.forEach((src, index) => {
    innerHTML += `<img src="${src}" class="slider-img${
      index === 0 ? " active" : ""
    }" data-index="${index}" />`;
  });

  sliderContainer.innerHTML = innerHTML;

  const images = Array.from(sliderContainer.querySelectorAll(".slider-img"));
  let current = 0;

  const interval = setInterval(() => {
    images[current].classList.remove("active");
    current = (current + 1) % images.length;
    images[current].classList.add("active");
  }, imageChangeInterval);

  setTimeout(() => {
    clearInterval(interval);
    sliderContainer.style.display = "none";
    if (typeof callbackAfterFinish === "function") {
      callbackAfterFinish();
    }
  }, displayDuration);
}

function loadCharacter() {
  let pausado = false;
  let pausedTime = 0;

  startAmbienceSound();

  document.body.innerHTML = `
    <video autoplay muted loop id="bg-video">
      <source src="./assets/jason-lucia/jasonactive.mp4" type="video/mp4">
    </video>
    <div id="tutorial-box">
      <p>Pressione <strong>Espaço</strong> para abrir a roda de personagens.</p>
      <p>Pressione <strong>P</strong> para pausar o jogo.</p>
      <p>Use o mouse para trocar de personagem.</p>
    </div>
  `;

  activecharacter = "jason";

  setupTutorialTimer();

  document.addEventListener("keydown", function handleSpace(e) {
    if (e.code === "Space" && !wheelstatus && !pausestatus) {
      e.preventDefault();
      cancelTutorial();
      loadcharacterwheel();
    }
  });

  function pauseui() {
    cancelTutorial();

    if (!pausestatus) {
      const pauseEffectSound = new Audio("./assets/sounds/pauseeffect.mp3");
      pauseEffectSound.play().catch((e) => {
        console.warn("Erro ao tocar efeito sonoro de pause:", e);
      });
    }

    if (pausado || wheelstatus) return;
    pausado = true;
    pausestatus = true;
    pauseambiencesound();

    const video = document.getElementById("bg-video");
    if (video) {
      pausedTime = video.currentTime;
      video.pause();
      video.classList.add("blurred");
    }

    const pauseOverlay = document.createElement("div");
    pauseOverlay.id = "pause-overlay";

    const pausecontent = document.createElement("div");
    pausecontent.className = "content";

    const portrait = document.createElement("img");
    portrait.className = "portrait";
    portrait.src =
      activecharacter === "lucia"
        ? "./assets/jason-lucia/luciaportraitpause.png"
        : "./assets/jason-lucia/jasonportraitpause.png";

    if (activecharacter === "lucia") {
      portrait.classList.add("lucia-selected");
    }

    const timeDisplay = document.createElement("div");
    timeDisplay.className = "time-display";
    const now = new Date();
    timeDisplay.innerText = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const resume = document.createElement("button");
    resume.innerText = "Retomar";
    resume.onclick = function () {
      document.body.removeChild(pauseOverlay);
      if (video) {
        video.currentTime = pausedTime;
        video.play();
        video.classList.remove("blurred");
      }
      pausado = false;
      pausestatus = false;
      startAmbienceSound();
    };

    const menureturn = document.createElement("button");
    menureturn.innerText = "Menu Principal";
    menureturn.onclick = () => window.location.reload();

    const topright = document.createElement("div");
    topright.className = "top-right-info";
    topright.appendChild(timeDisplay);
    topright.appendChild(portrait);

    pausecontent.appendChild(topright);
    pausecontent.appendChild(resume);
    pausecontent.appendChild(menureturn);
    pauseOverlay.appendChild(pausecontent);
    document.body.appendChild(pauseOverlay);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "p" && !wheelstatus) {
      pauseui();
    }
  });
}

let tutorialTimeout = null;
let tutorialCancelled = false;
let tutorialShown = false;

function setupTutorialTimer() {
  if (tutorialCancelled || tutorialShown) return;

  tutorialTimeout = setTimeout(() => {
    if (!tutorialCancelled && !pausestatus && !wheelstatus) {
      showTutorial();
    }
  }, 25000);
}

function cancelTutorial() {
  if (tutorialTimeout) {
    clearTimeout(tutorialTimeout);
    tutorialTimeout = null;
  }
  tutorialCancelled = true;

  const tutorialBox = document.getElementById("tutorial-box");
  if (tutorialBox) {
    tutorialBox.style.display = "none";
  }
}

function showTutorial() {
  const tutorialBox = document.getElementById("tutorial-box");
  if (tutorialBox) {
    const sound = new Audio("./assets/sounds/menueffect.mp3");
    sound
      .play()
      .catch((e) => console.warn("Erro ao tocar som de tutorial:", e));
    tutorialBox.style.display = "block";
    tutorialShown = true;
  }
}

function createswap(side) {
  removeswap(); // Garante que não há duplicatas

  const swap = document.createElement("div");
  swap.classList.add("swap-preview");

  if (side === "left") {
    swap.classList.add("lucia-swap");
    swap.style.backgroundImage = "url('./assets/jason-lucia/luciaswap.png')";
    swap.style.top = "calc(50% - 200px)";
    swap.style.left = "calc(50% - 200px)";
    swap.style.transform = "rotateY(-18deg) scale(1.2)";

    // Adiciona classe visual no wheel
    const leftSide = document.querySelector("#character-wheel .side.left");
    if (leftSide) leftSide.classList.add("keyboard-selected-left");
  }

  if (side === "right") {
    swap.classList.add("jason-swap");
    swap.style.backgroundImage = "url('./assets/jason-lucia/jasonswap.png')";
    swap.style.top = "calc(50% - 200px)";
    swap.style.left = "calc(50% + 40px)";
    swap.style.transform = "rotateY(18deg) scale(1.2)";

    // Adiciona classe visual no wheel
    const rightSide = document.querySelector("#character-wheel .side.right");
    if (rightSide) rightSide.classList.add("keyboard-selected-right");
  }

  swap.dataset.side = side;
  document.body.appendChild(swap);
}

function removeswap() {
  const existing = document.querySelector(".swap-preview");
  if (existing) existing.remove();

  // Remove as classes CSS de destaque
  const leftSide = document.querySelector("#character-wheel .side.left");
  const rightSide = document.querySelector("#character-wheel .side.right");

  if (leftSide) leftSide.classList.remove("keyboard-selected-left");
  if (rightSide) rightSide.classList.remove("keyboard-selected-right");
}
