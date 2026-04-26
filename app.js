(function () {
  const config = window.giftConfig || {};

  const heroEyebrow = document.getElementById("heroEyebrow");
  const heroTitle = document.getElementById("heroTitle");
  const heroMessage = document.getElementById("heroMessage");
  const entryGate = document.getElementById("entryGate");
  const entryPlayButton = document.getElementById("entryPlayButton");
  const previewPhoto = document.getElementById("previewPhoto");
  const previewWordTop = document.getElementById("previewWordTop");
  const previewWordCenter = document.getElementById("previewWordCenter");
  const previewWordBottom = document.getElementById("previewWordBottom");
  const bookEyebrow = document.getElementById("bookEyebrow");
  const bookTitle = document.getElementById("bookTitle");
  const bookIntro = document.getElementById("bookIntro");
  const stageVisual = document.getElementById("stageVisual");
  const stagePhoto = document.getElementById("stagePhoto");

  const heroSection = document.getElementById("heroSection");
  const sequencePanel = document.getElementById("sequencePanel");
  const countdownText = document.getElementById("countdownText");
  const sequenceWord = document.getElementById("sequenceWord");
  const letterStage = document.getElementById("letterStage");
  const bookShell = document.getElementById("bookShell");

  const startButton = document.getElementById("startButton");
  const openBookButton = document.getElementById("openBookButton");
  const musicButton = document.getElementById("musicButton");
  const musicDock = document.getElementById("musicDock");
  const musicDockLabel = document.getElementById("musicDockLabel");
  const musicPlayerFrame = document.getElementById("musicPlayerFrame");
  const youtubePlayer = document.getElementById("youtubePlayer");
  const musicLink = document.getElementById("musicLink");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

  const memoryKicker = document.getElementById("memoryKicker");
  const memoryTitle = document.getElementById("memoryTitle");
  const memoryText = document.getElementById("memoryText");
  const memoryImage = document.getElementById("memoryImage");
  const memoryPlaceholder = document.getElementById("memoryPlaceholder");
  const memoryPlaceholderText = document.getElementById("memoryPlaceholderText");
  const pageIndicator = document.getElementById("pageIndicator");

  const finalStage = document.getElementById("finalStage");
  const finalButton = document.getElementById("finalButton");
  const cakeStage = document.getElementById("cakeStage");

  const bgAudio = document.getElementById("bgAudio");
  const skyCanvas = document.getElementById("skyCanvas");
  const rainCanvas = document.getElementById("rainCanvas");

  const memories = Array.isArray(config.memories) && config.memories.length
    ? config.memories
    : [{ kicker: "Capitulo unico", title: "Nosso amor", text: "Eu te amo.", image: "" }];

  let currentMemoryIndex = 0;
  let audioEnabled = false;
  let sequenceStarted = false;
  applyTheme();
  hydrateText();
  resizeCanvases();
  animateSky();
  animateRain();
  renderMemory(0);

  entryPlayButton.addEventListener("click", enterGiftExperience);
  startButton.addEventListener("click", startExperience);
  openBookButton.addEventListener("click", () => {
    document.body.classList.add("book-open");
    bookShell.classList.remove("hidden");
    bookShell.classList.add("fade-up");
    openBookButton.classList.add("hidden");
  });

  musicButton.addEventListener("click", toggleMusic);
  prevButton.addEventListener("click", () => renderMemory(currentMemoryIndex - 1));
  nextButton.addEventListener("click", () => renderMemory(currentMemoryIndex + 1));
  finalButton.addEventListener("click", showCakeStage);

  window.addEventListener("resize", resizeCanvases);

  function applyTheme() {
    const root = document.documentElement;
    const accent = config.accentColor || "#ff5f91";
    const accentSoft = config.accentColorSoft || "#ffc6d7";
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-soft", accentSoft);

    if (config.audioSrc) {
      bgAudio.src = config.audioSrc;
      bgAudio.load();
      musicButton.disabled = false;
      musicButton.textContent = "Musica";
    } else if (config.youtubeVideoId) {
      musicButton.disabled = false;
      musicButton.textContent = "Tocar " + (config.youtubeTrackLabel || "musica");
      musicDock.classList.remove("hidden");
      musicDockLabel.textContent = config.youtubeTrackLabel || "Trilha romantica";
      musicLink.href = "https://www.youtube.com/watch?v=" + config.youtubeVideoId;
    } else {
      musicButton.disabled = true;
      musicButton.textContent = "Sem musica";
    }
  }

  function hydrateText() {
    document.title = "Um Presente Para " + (config.recipientName || "Voce");
    heroEyebrow.textContent = config.heroEyebrow || "Para o amor da minha vida";
    heroTitle.textContent = config.heroTitle || "Um presente feito com amor";
    heroMessage.textContent = config.heroMessage || "";
    bookEyebrow.textContent = config.bookEyebrow || "Feito com carinho";
    bookTitle.textContent = config.bookTitle || "Nosso livro";
    bookIntro.textContent = config.bookIntro || "";

    if (config.stageImage) {
      stagePhoto.src = config.stageImage;
      stagePhoto.style.objectPosition = config.stageImagePosition || "center center";
      stageVisual.classList.remove("hidden");
      stagePhoto.onerror = () => {
        stageVisual.classList.add("hidden");
      };
    }

    const previewWords = Array.isArray(config.previewWords) ? config.previewWords : [];
    previewWordTop.textContent = previewWords[0] || "AMOR";
    previewWordCenter.textContent = previewWords[1] || "LOVE";
    previewWordBottom.textContent = previewWords[2] || "SEMPRE";

    if (config.previewImage) {
      previewPhoto.src = config.previewImage;
      previewPhoto.style.objectPosition = config.previewImagePosition || "center center";
      previewPhoto.hidden = false;
      previewPhoto.classList.remove("hidden");
      previewPhoto.onerror = () => {
        previewPhoto.hidden = true;
        previewPhoto.classList.add("hidden");
      };
      previewWordTop.classList.add("hidden");
      previewWordCenter.classList.add("hidden");
      previewWordBottom.classList.add("hidden");
    }

    const initials = getInitials(config.senderName, config.recipientName);
    memoryPlaceholderText.textContent = initials;
  }

  async function enterGiftExperience() {
    try {
      if (config.audioSrc || config.youtubeVideoId) {
        await startMusicPlayback();
        audioEnabled = true;
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.textContent = "Pausar musica";
      }
    } catch (error) {
      audioEnabled = false;
    }

    entryGate.classList.add("hidden");
    heroSection.classList.remove("hidden");
    heroSection.classList.add("fade-up");
  }

  async function startExperience() {
    if (sequenceStarted) return;
    sequenceStarted = true;

    if ((config.audioSrc || config.youtubeVideoId) && !audioEnabled) {
      try {
        await startMusicPlayback();
        audioEnabled = true;
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.textContent = "Pausar musica";
      } catch (error) {
        audioEnabled = false;
      }
    }

    heroSection.classList.add("hidden");
    sequencePanel.classList.remove("hidden");

    await runCountdown();
    await runWordSequence();

    sequencePanel.classList.add("hidden");
    letterStage.classList.remove("hidden");
    letterStage.classList.add("fade-up");
  }

  async function runCountdown() {
    const countdownValues = ["3", "2", "1"];
    for (const value of countdownValues) {
      countdownText.textContent = value;
      countdownText.classList.remove("visible");
      void countdownText.offsetWidth;
      countdownText.classList.add("visible");
      await wait(850);
    }
    countdownText.classList.remove("visible");
    await wait(180);
  }

  async function runWordSequence() {
    const words = Array.isArray(config.sequenceWords) && config.sequenceWords.length
      ? config.sequenceWords
      : ["EU", "TE", "AMO"];

    for (const word of words) {
      sequenceWord.textContent = word;
      sequenceWord.classList.remove("visible");
      void sequenceWord.offsetWidth;
      sequenceWord.classList.add("visible");
      await wait(1150);
      sequenceWord.classList.remove("visible");
      await wait(160);
    }
  }

  async function toggleMusic() {
    if (!config.audioSrc && !config.youtubeVideoId) return;

    if (!audioEnabled) {
      try {
        await startMusicPlayback();
        audioEnabled = true;
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.textContent = "Pausar musica";
      } catch (error) {
        audioEnabled = false;
      }
      return;
    }

    stopMusicPlayback();
    audioEnabled = false;
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.textContent = config.youtubeVideoId
      ? "Tocar " + (config.youtubeTrackLabel || "musica")
      : "Musica";
  }

  async function startMusicPlayback() {
    if (config.audioSrc) {
      await bgAudio.play();
      return;
    }

    if (!config.youtubeVideoId) return;

    musicPlayerFrame.classList.remove("hidden");
    youtubePlayer.src =
      "https://www.youtube-nocookie.com/embed/" +
      config.youtubeVideoId +
      "?autoplay=1&loop=1&playlist=" +
      config.youtubeVideoId +
      "&controls=1&rel=0";
  }

  function stopMusicPlayback() {
    if (config.audioSrc) {
      bgAudio.pause();
      return;
    }

    youtubePlayer.src = "";
    musicPlayerFrame.classList.add("hidden");
  }

  function renderMemory(index) {
    currentMemoryIndex = (index + memories.length) % memories.length;
    const memory = memories[currentMemoryIndex];

    memoryKicker.textContent = memory.kicker || "";
    memoryTitle.textContent = memory.title || "";
    memoryText.textContent = memory.text || "";
    pageIndicator.textContent = (currentMemoryIndex + 1) + " / " + memories.length;

    const initials = getInitials(config.senderName, config.recipientName);
    memoryPlaceholderText.textContent = initials;

    if (memory.image) {
      memoryImage.src = memory.image;
      memoryImage.alt = memory.title || "Memoria especial";
      memoryImage.style.objectPosition = memory.imagePosition || "center center";
      memoryImage.hidden = false;
      memoryPlaceholder.classList.add("hidden");
      memoryImage.onerror = handleBrokenImage;
    } else {
      handleBrokenImage();
    }

    // Show final stage when on last page
    if (currentMemoryIndex === memories.length - 1) {
      nextButton.textContent = "Final";
      nextButton.onclick = showFinalStage;
    } else {
      nextButton.textContent = "Proxima";
      nextButton.onclick = () => renderMemory(currentMemoryIndex + 1);
    }
  }

  function showFinalStage() {
    letterStage.classList.add("hidden");
    finalStage.classList.remove("hidden");
    finalStage.classList.add("fade-up");
  }

  function showCakeStage() {
    finalStage.classList.add("hidden");
    cakeStage.classList.remove("hidden");
    cakeStage.classList.add("fade-up");
  }

  function handleBrokenImage() {
    memoryImage.hidden = true;
    memoryImage.removeAttribute("src");
    memoryPlaceholder.classList.remove("hidden");
  }

  function getInitials(senderName, recipientName) {
    const names = [senderName || "M", recipientName || "V"]
      .map((value) => String(value).trim())
      .filter(Boolean);

    return names
      .map((value) => value.charAt(0).toUpperCase())
      .join(" & ");
  }

  function resizeCanvases() {
    [skyCanvas, rainCanvas].forEach((canvas) => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    });
  }

  function animateSky() {
    const ctx = skyCanvas.getContext("2d");
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.8 + 0.2,
      alpha: Math.random() * 0.9 + 0.1,
      drift: Math.random() * 0.3 + 0.05
    }));

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const star of stars) {
        star.y += star.drift;
        if (star.y > window.innerHeight) {
          star.y = -4;
          star.x = Math.random() * window.innerWidth;
        }

        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 244, 248," + star.alpha.toFixed(3) + ")";
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    tick();
  }

  function animateRain() {
    const ctx = rainCanvas.getContext("2d");
    const words = Array.isArray(config.matrixWords) && config.matrixWords.length
      ? config.matrixWords
      : ["LOVE", "AMOR", "SEMPRE"];

    const fontSize = window.innerWidth < 720 ? 16 : 22;
    const columns = Math.ceil(window.innerWidth / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -40);

    function draw() {
      ctx.fillStyle = "rgba(8, 9, 14, 0.08)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.font = "600 " + fontSize + "px Manrope";

      for (let i = 0; i < drops.length; i += 1) {
        const word = words[(Math.floor(drops[i]) + i) % words.length];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = i % 2 === 0 ? "rgba(255, 95, 145, 0.48)" : "rgba(255, 198, 215, 0.42)";
        ctx.fillText(word, x, y);

        if (y > window.innerHeight && Math.random() > 0.985) {
          drops[i] = Math.random() * -16;
        }
        drops[i] += 0.14;
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
})();
