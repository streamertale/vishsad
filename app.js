const screens = [...document.querySelectorAll('.screen')];
const $ = (selector) => document.querySelector(selector);
const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const TREE_DEPTH = 17;
const CUT_SPIN = .11;
const quoteBank = [
  { text: '«О, мой милый, мой нежный, прекрасный сад!.. Моя жизнь, моя молодость, счастье моё, прощай!..»', author: 'Раневская Любовь Андреевна' },
  { text: '«Вся Россия наш сад. Земля велика и прекрасна, есть на ней много чудесных мест.»', author: 'Петя Трофимов' },
  { text: '… судьба относится ко мне без сожаления, как буря к небольшому кораблю', author: 'Семен Пантелеевич Епиходов' },
  { text: 'Ведь так ясно, чтобы начать жить в настоящем, надо сначала искупить наше прошлое, покончить с ним', author: 'Петя Трофимов' },
  { text: '… куда только судьба не гоняла меня, где я только не был!', author: 'Петя Трофимов' },
  { text: 'Я развитой человек, читаю разные замечательные книги, но никак не могу понять направления, чего мне собственно хочется, жить мне или застрелиться, собственно говоря, но тем не менее я всегда ношу при себе револьвер.', author: 'Семен Пантелеевич Епиходов' },
  { text: 'Я знаю свою фортуну, каждый день со мной случается какое-нибудь несчастье, и к этому я давно уже привык, так что с улыбкой гляжу на свою судьбу.', author: 'Семен Пантелеевич Епиходов' },
  { text: 'Каждый день случается со мной какое-нибудь несчастье. И я не ропщу, привык и даже улыбаюсь.', author: 'Семен Пантелеевич Епиходов' },
  { text: 'Эти умники все такие глупые, что не с кем поговорить.', author: 'Шарлотта Ивановна' },
  { text: 'Обойти то мелкое и призрачное, что мешает быть свободным и счастливым, — вот цель и смысл нашей жизни.', author: 'Петр Сергеевич Трофимов' },
  { text: 'Надо только начать делать что-нибудь, чтобы понять, как мало честных, порядочных людей.', author: 'Ермолай Алексеевич Лопахин' },
  { text: 'Ведь так ясно, чтобы начать жить в настоящем, надо сначала искупить наше прошлое, покончить с ним, а искупить его можно только страданием, только необычайным, непрерывным трудом.', author: 'Петр Сергеевич Трофимов' },
  { text: 'Когда я работаю подолгу, без устали, тогда мысли полегче, и кажется, будто мне тоже известно, для чего я существую. А сколько, брат, в России людей, которые существуют неизвестно для чего.', author: 'Ермолай Алексеевич Лопахин' },
  { text: 'Вам не пьесы смотреть, а смотреть бы почаще на самих себя. Как вы все серо живете, как много говорите ненужного.', author: 'Любовь Андреевна Раневская' },
  { text: 'Будьте свободны, как ветер!', author: 'Петр Сергеевич Трофимов' },
  { text: 'Господи, ты дал нам громадные леса, необъятные поля, глубочайшие горизонты и, живя тут, мы сами должны бы по-настоящему быть великанами.', author: 'Ермолай Алексеевич Лопахин' },
  { text: 'Если во всей губернии есть что-нибудь интересное, даже замечательное, так это только наш вишневый сад.', author: 'Ермолай Алексеевич Лопахин' },
  { text: 'Дойду, или укажу другим путь, как дойти.', author: 'Петр Сергеевич Трофимов' },
  { text: 'И, очевидно, все хорошие разговоры у нас для того только, чтобы отвести глаза себе и другим.', author: 'Петр Сергеевич Трофимов' },
  { text: 'Мы идем неудержимо к яркой звезде, которая горит там вдали! Вперед!', author: 'Петр Сергеевич Трофимов' },
].map(({ text, author }) => {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  return {
    text: cleanText.startsWith('«') ? cleanText : `«${cleanText}»`,
    author: author.trim(),
  };
});

const state = {
  act: 'grow',
  samples: [],
  params: {
    lean: 0,
    height: 1,
    depth: 15,
    amplitude: 1,
    sideBias: 0,
    wind: 0,
    void: .08,
    irregularity: .12,
    growth: .45,
    seed: 1,
  },
  cut: { frequency: 2, rotation: 0, level: .56, phase: 1, charges: 1 },
  saved: safeSavedCards(),
  capture: null,
  animation: null,
  pointer: null,
  motionPermission: null,
  orientation: { beta: 0, gamma: 0 },
  liveEnergy: 0,
  starting: false,
  seed: Math.random() * 1000,
  sourceImage: null,
  sourceLabel: '',
  selectedSeconds: 0,
  selectedQuote: null,
  ritualStartedAt: 0,
};

function safeSavedCards() {
  try { return JSON.parse(localStorage.getItem('vsad-cards') || '[]'); }
  catch { return []; }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function seededUnit(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function selectQuote() {
  const previousText = state.selectedQuote?.text;
  const available = quoteBank.filter((quote) => quote.text !== previousText);
  const pool = available.length ? available : quoteBank;
  state.selectedQuote = pool[Math.floor(Math.random() * pool.length)];
  return state.selectedQuote;
}

function upperCutAngle(angle) {
  return ((angle % Math.PI) + Math.PI) % Math.PI - Math.PI;
}

function show(name) {
  stopAnimation();
  screens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === name));
  if (name === 'acts') renderSavedField();
  if (name === 'ritual') requestAnimationFrame(drawRitualStage);
  if (name === 'result') requestAnimationFrame(drawResult);
}

document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => show(button.dataset.go));
});
$('#introEnter').addEventListener('click', () => show('acts'));
$('#openReader').addEventListener('click', () => {
  $('#readerScroll').scrollTop = 0;
  show('reader');
});
document.querySelectorAll('[data-act]').forEach((button) => {
  button.addEventListener('click', () => beginAct(button.dataset.act));
});

const readerSpeakers = [
  'Любовь Андреевна', 'Голос Любови Андреевны', 'Голос Ани', 'Голос Трофимова',
  'Лопахин', 'Дуняша', 'Епиходов', 'Аня', 'Варя', 'Гаев', 'Шарлотта',
  'Пищик', 'Трофимов', 'Фирс', 'Яша', 'Прохожий',
];

function appendReaderParagraph(element, text) {
  const speaker = readerSpeakers.find((name) => text.startsWith(name));
  const rest = speaker ? text.slice(speaker.length) : '';
  if (speaker && /^\s*(?:\([^)]*\))?\s*\./.test(rest)) {
    element.classList.add('reader-dialogue');
    const strong = document.createElement('strong');
    strong.textContent = speaker;
    element.append(strong, document.createTextNode(rest));
    return;
  }
  if (/^(Пауза\.|Входит|Входят|Уходит|Уходят|Слышно|Слышатся|Сцена пуста|Все уходят|Занавес)/.test(text)) {
    element.classList.add('reader-stage');
  }
  element.textContent = text;
}

function renderReader() {
  const root = $('#readerText');
  const content = window.VSAD_READER_CONTENT || [];
  const fragment = document.createDocumentFragment();
  content.forEach((item) => {
    let element;
    if (item.kind === 'title') {
      element = document.createElement('h1');
    } else if (item.kind === 'section') {
      element = document.createElement('h2');
    } else if (item.kind === 'curtain') {
      element = document.createElement('p');
      element.className = 'reader-curtain';
    } else {
      element = document.createElement('p');
      if (item.kind === 'author') element.className = 'reader-author';
      if (item.kind === 'cast') element.className = 'reader-cast';
      if (item.kind === 'date') element.className = 'reader-date';
    }
    if (item.kind === 'paragraph') appendReaderParagraph(element, item.text);
    else element.textContent = item.text;
    fragment.append(element);
  });
  root.replaceChildren(fragment);
}

renderReader();

const orchardPreload = new Image();
const revealActPhotos = () => $('.acts').classList.add('photos-ready');
orchardPreload.addEventListener('load', revealActPhotos, { once: true });
orchardPreload.addEventListener('error', revealActPhotos, { once: true });
orchardPreload.src = 'assets/orchard.png';
if (orchardPreload.complete) revealActPhotos();

function beginAct(act) {
  state.act = act;
  state.seed = Math.random() * 1000;
  state.starting = false;
  selectQuote();
  const cut = act === 'cut';
  const ritual = $('.ritual');
  ritual.classList.toggle('is-cut', cut);
  $('#ritualAct').textContent = cut ? 'Действие второе' : 'Действие первое';
  $('#ritualTitle').innerHTML = cut ? 'Отсечь<br>прошлое' : 'Вырастить<br>будущее';
  $('#ritualText').textContent = cut
    ? 'Ветви вишнёвого дерева — это тень прошлого, которая заслоняет солнце новому.'
    : 'Телефон в кисти руки — это ветвь вишнёвого дерева, которая становится продолжением вас и принимает новую форму.';
  state.selectedSeconds = randomInt(7, 17);
  $('#growthDuration').textContent = cut
    ? `Резкий взмах как мгновение за ${state.selectedSeconds} секунд`
    : `От вишнёвой косточки до ягоды за ${state.selectedSeconds} секунд`;
  state.ritualStartedAt = performance.now();
  if (cut) {
    const source = [...state.saved].reverse().find((card) => card.act === 'grow');
    if (source?.params) state.params = { ...state.params, ...source.params };
    state.cut = {
      ...state.cut,
      charges: randomInt(1, 3),
      frequency: randomInt(1, 3),
      phase: seededUnit(state.seed) * TAU,
    };
  }
  show('ritual');
}

$('#cardUpload').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.sourceImage = image;
      state.sourceLabel = file.name;
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

$('#chooseSaved').addEventListener('click', () => {
  const source = [...state.saved].reverse().find((card) => card.act === 'grow');
  state.sourceImage = null;
  state.sourceLabel = '';
  if (source?.params) {
    state.params = { ...state.params, ...source.params };
  } else {
    state.params = { ...state.params, seed: Math.random() * 1000, growth: .82 };
  }
});

async function requestSensors() {
  if (state.motionPermission !== null) return state.motionPermission;
  try {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const permission = await DeviceMotionEvent.requestPermission();
      state.motionPermission = permission === 'granted';
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      await DeviceOrientationEvent.requestPermission();
    }
    if (state.motionPermission === null) state.motionPermission = typeof DeviceMotionEvent !== 'undefined';
  } catch {
    state.motionPermission = false;
  }
  return state.motionPermission;
}

async function beginCaptureFromRitual() {
  const ritual = $('.ritual');
  if (state.starting || !ritual.classList.contains('is-active')) return;
  state.starting = true;
  await requestSensors();
  if (ritual.classList.contains('is-active')) startCapture();
  state.starting = false;
}

$('.ritual').addEventListener('click', (event) => {
  if (event.target.closest('button,label,input,.source-controls')) return;
  beginCaptureFromRitual();
});

$('.ritual').addEventListener('keydown', (event) => {
  if (event.target !== $('.ritual')) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    beginCaptureFromRitual();
  }
});

function startCapture() {
  stopAnimation();
  show('recording');
  state.samples = [];
  const selectedSeconds = state.selectedSeconds || randomInt(7, 17);
  const qa = new URLSearchParams(location.search).has('qa');
  const duration = qa ? 2400 : selectedSeconds * 1000;
  const startedAt = performance.now();
  state.liveEnergy = 0;
  let previousMotion = null;
  let previousOrientation = { ...state.orientation };
  const timer = $('#timeSignal');
  timer.textContent = selectedSeconds;
  timer.className = `time-signal ${Math.random() < .5 ? 'from-left' : 'from-right'}`;

  const onMotion = (event) => {
    const a = event.accelerationIncludingGravity || event.acceleration || {};
    const rotation = event.rotationRate || {};
    const sample = {
      t: performance.now(),
      ax: a.x || 0,
      ay: a.y || 0,
      az: a.z || 0,
      alpha: rotation.alpha || 0,
      beta: rotation.beta || 0,
      gamma: rotation.gamma || 0,
      tiltBeta: state.orientation.beta,
      tiltGamma: state.orientation.gamma,
    };
    const delta = previousMotion
      ? Math.hypot(sample.ax - previousMotion.ax, sample.ay - previousMotion.ay, sample.az - previousMotion.az)
      : 0;
    const rotationEnergy = Math.hypot(sample.alpha, sample.beta, sample.gamma) / 90;
    const movement = delta + rotationEnergy;
    state.liveEnergy = state.liveEnergy * .66 + movement * .34;
    previousMotion = sample;
    // Very small wrist movements count; only true sensor noise is ignored.
    if (movement > .012) state.samples.push(sample);
  };
  const onOrientation = (event) => {
    const next = { beta: event.beta || 0, gamma: event.gamma || 0 };
    const tiltDelta = Math.hypot(next.beta - previousOrientation.beta, next.gamma - previousOrientation.gamma);
    state.orientation = next;
    if (tiltDelta > .06) {
      const sample = {
        t: performance.now(),
        ax: (next.gamma - previousOrientation.gamma) * .7,
        ay: (next.beta - previousOrientation.beta) * .7,
        az: 0,
        alpha: 0,
        beta: (next.beta - previousOrientation.beta) * 2,
        gamma: (next.gamma - previousOrientation.gamma) * 2,
        tiltBeta: next.beta,
        tiltGamma: next.gamma,
      };
      state.samples.push(sample);
      state.liveEnergy = state.liveEnergy * .7 + tiltDelta * .09;
    }
    previousOrientation = next;
  };
  const onDown = (event) => {
    state.pointer = { x: event.clientX, y: event.clientY, t: performance.now() };
  };
  const onMove = (event) => {
    if (!state.pointer) return;
    const now = performance.now();
    const dx = event.clientX - state.pointer.x;
    const dy = event.clientY - state.pointer.y;
    const movement = Math.hypot(dx, dy);
    state.liveEnergy = state.liveEnergy * .62 + movement * .045;
    if (movement > .12) {
      state.samples.push({
        t: now,
        ax: dx / 2.4,
        ay: dy / 2.4,
        az: 0,
        alpha: 0,
        beta: dy * 1.2,
        gamma: dx * 1.2,
        tiltBeta: dy,
        tiltGamma: dx,
      });
    }
    state.pointer = { x: event.clientX, y: event.clientY, t: now };
  };
  const onUp = () => { state.pointer = null; };
  window.addEventListener('devicemotion', onMotion);
  window.addEventListener('deviceorientation', onOrientation);
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  const frame = (now) => {
    const progress = clamp((now - startedAt) / duration, 0, 1);
    timer.textContent = Math.max(0, Math.ceil(selectedSeconds - (now - startedAt) / 1000));
    drawLive(progress, now);
    if (progress < 1) {
      state.animation = requestAnimationFrame(frame);
    } else {
      cleanup();
      timer.textContent = '';
      timer.className = 'time-signal';
      finishCapture(startedAt, duration);
    }
  };
  const cleanup = () => {
    window.removeEventListener('devicemotion', onMotion);
    window.removeEventListener('deviceorientation', onOrientation);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    state.pointer = null;
  };
  state.capture = { cleanup };
  state.animation = requestAnimationFrame(frame);
}

function stopAnimation() {
  if (state.animation) cancelAnimationFrame(state.animation);
  state.animation = null;
  if (state.capture) state.capture.cleanup();
  state.capture = null;
}

function analyseGrow() {
  if (state.samples.length < 3) {
    const seed = Math.random() * 1000;
    const openness = seededUnit(seed);
    state.params = {
      lean: 0,
      height: .78 + openness * .12,
      depth: Math.round(12 + openness * 3),
      amplitude: .7 + openness * .18,
      sideBias: 0,
      wind: 0,
      void: .1 + (1 - openness) * .2,
      irregularity: .1 + (1 - openness) * .18,
      growth: .24 + openness * .34,
      seed,
    };
    return;
  }
  const samples = state.samples;
  const magnitudes = samples.map((sample) => Math.hypot(sample.ax, sample.ay, sample.az));
  const meanMagnitude = magnitudes.reduce((sum, value) => sum + value, 0) / magnitudes.length;
  const amplitude = Math.sqrt(magnitudes.reduce((sum, value) => sum + (value - meanMagnitude) ** 2, 0) / magnitudes.length);
  let crossings = 0;
  for (let i = 1; i < magnitudes.length; i++) {
    if ((magnitudes[i - 1] - meanMagnitude) * (magnitudes[i] - meanMagnitude) < 0) crossings++;
  }
  const seconds = Math.max(.25, (samples.at(-1).t - samples[0].t) / 1000);
  const frequency = crossings / seconds / 2;
  const meanX = samples.reduce((sum, sample) => sum + sample.ax, 0) / samples.length;
  const meanY = samples.reduce((sum, sample) => sum + sample.ay, 0) / samples.length;
  const xSpread = Math.sqrt(samples.reduce((sum, sample) => sum + (sample.ax - meanX) ** 2, 0) / samples.length);
  const ySpread = Math.sqrt(samples.reduce((sum, sample) => sum + (sample.ay - meanY) ** 2, 0) / samples.length);
  const rotation = samples.reduce((sum, sample) => sum + Math.hypot(sample.alpha, sample.beta, sample.gamma), 0) / samples.length;
  const meanTilt = samples.reduce((sum, sample) => sum + (sample.tiltGamma || 0), 0) / samples.length;
  const spanRatio = clamp((samples.length / seconds) / 45, 0, 1);
  const energy = amplitude + frequency * .7 + rotation / 55;
  const directionalFlow = clamp(meanX / Math.max(.28, xSpread * .62) + meanTilt / 32, -1, 1);
  const wind = Math.sign(directionalFlow) * Math.pow(Math.abs(directionalFlow), .86) * .32;
  const sideBias = clamp(directionalFlow * .42, -.42, .42);
  const sparseImpulse = clamp(1 - spanRatio, 0, 1);
  const organic = seededUnit(samples.length * 13.17 + amplitude * 91 + rotation * 3.7);
  state.params = {
    lean: clamp(wind * .5, -.18, .18),
    height: clamp(.78 + ySpread * .08 + rotation / 260, .78, 1.08),
    depth: Math.round(clamp(12.5 + spanRatio * 1.5 + frequency * .45 + organic * 1.25, 12, 16)),
    amplitude: clamp(.72 + xSpread * .1 + frequency * .04 + organic * .12, .7, 1.16),
    sideBias,
    wind,
    void: clamp(.08 + sparseImpulse * .25 + (1 - organic) * .16 + rotation / 280, .08, .46),
    irregularity: clamp(.08 + amplitude * .08 + frequency * .06 + (1 - organic) * .14, .08, .48),
    growth: clamp(.24 + organic * .34 + samples.length / 700 + energy * .07, .22, .84),
    seed: samples.length * 13.17 + amplitude * 91 + rotation * 3.7,
    energy,
  };
}

function analyseCut(startedAt, duration) {
  if (!state.samples.length) {
    state.cut = {
      frequency: randomInt(1, 3),
      rotation: upperCutAngle(state.cut.phase + duration / 1000 * CUT_SPIN),
      level: .5,
      phase: state.cut.phase,
      charges: state.cut.charges || randomInt(1, 3),
    };
    return;
  }
  const magnitudes = state.samples.map((sample) => Math.hypot(sample.ax, sample.ay, sample.az));
  let peakIndex = 0;
  magnitudes.forEach((magnitude, index) => { if (magnitude > magnitudes[peakIndex]) peakIndex = index; });
  const peak = magnitudes[peakIndex];
  const peakElapsed = clamp(state.samples[peakIndex].t - startedAt, 0, duration);
  const signedX = state.samples.reduce((sum, sample) => sum + sample.ax, 0);
  const signedY = state.samples.reduce((sum, sample) => sum + sample.ay, 0);
  state.cut = {
    frequency: Math.round(clamp(1 + peak / 7, 1, 3)),
    rotation: upperCutAngle(state.cut.phase + peakElapsed / 1000 * CUT_SPIN + clamp((signedX - signedY) / Math.max(12, state.samples.length) * .025, -.35, .35)),
    level: clamp(.46 + peak / 90, .46, .62),
    phase: state.cut.phase,
    charges: state.cut.charges || randomInt(1, 3),
  };
}

function finishCapture(startedAt, duration) {
  if (state.act === 'grow') analyseGrow();
  else analyseCut(startedAt, duration);
  $('#cardDate').textContent = new Intl.DateTimeFormat('ru-RU').format(new Date());
  const quote = state.selectedQuote || selectQuote();
  $('#cardQuote').textContent = quote.text;
  $('#cardQuoteAuthor').textContent = quote.author;
  $('#cardQuoteAuthor').hidden = !quote.author;
  $('.result').classList.toggle('is-cut', state.act === 'cut');
  show('result');
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const d = Math.min(devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * d));
  const height = Math.max(1, Math.round(rect.height * d));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { ctx: canvas.getContext('2d'), w: width, h: height, d };
}

function drawRitualStage(time = performance.now()) {
  if (!$('.ritual').classList.contains('is-active')) return;
  if (state.act === 'grow') {
    const reveal = clamp((time - state.ritualStartedAt) / 14000, 0, 1);
    drawPythagorasField($('#generativeCanvas'), time, state.seed, 0, reveal, true);
  } else {
    drawSourcePreview($('#sourcePreview'));
    drawCutForm($('#generativeCanvas'), time, 0, false);
  }
  state.animation = requestAnimationFrame(drawRitualStage);
}

function drawLive(progress, time) {
  const canvas = $('#liveCanvas');
  if (state.act === 'grow') {
    drawPythagorasField(canvas, time, state.seed, 0, progress, false);
  } else {
    drawCutForm(canvas, time, progress, true);
  }
}

function drawPythagorasField(canvas, time, seed, _motionEnergy = 0, progress = 0, ritual = false) {
  const { ctx, w, h, d } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#020202';
  ctx.fillRect(0, 0, w, h);
  const t = time / 1000;
  const reveal = clamp(progress, 0, 1);
  const speed = ritual ? .13 : .18;
  const copies = ritual ? 10 : 15;

  function pythagoras(ax, ay, bx, by, depth, theta, rootDepth, alpha) {
    const dx = bx - ax;
    const dy = by - ay;
    const size = Math.hypot(dx, dy);
    if (depth <= 0 || size < .7 * d) return;
    const ux = dx / size;
    const uy = dy / size;
    const nx = uy;
    const ny = -ux;
    const cx = bx + nx * size;
    const cy = by + ny * size;
    const dxTop = ax + nx * size;
    const dyTop = ay + ny * size;
    const branchAlpha = alpha * (.68 + (rootDepth - depth) / rootDepth * .32);
    ctx.strokeStyle = `rgba(238,234,227,${branchAlpha})`;
    ctx.lineWidth = Math.max(.5 * d, .76 * d);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.lineTo(dxTop, dyTop);
    ctx.closePath();
    ctx.stroke();

    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);
    const apexX = dxTop + ux * size * cosine * cosine + nx * size * sine * cosine;
    const apexY = dyTop + uy * size * cosine * cosine + ny * size * sine * cosine;
    pythagoras(dxTop, dyTop, apexX, apexY, depth - 1, theta, rootDepth, alpha);
    pythagoras(apexX, apexY, cx, cy, depth - 1, theta, rootDepth, alpha);
  }

  for (let copy = 0; copy < copies; copy++) {
    const phase = copy * 2.399963 + seed * .017;
    const direction = copy % 2 ? -1 : 1;
    const arrival = clamp(reveal * 1.4 - copy / copies * .88, 0, 1);
    if (arrival <= 0) continue;
    const zoomCycle = (t * .018 * speed + copy / copies + seed * .002) % 1;
    const zoom = Math.pow(PHI, (zoomCycle - .5) * 1.15);
    const spread = .07 + reveal * (ritual ? .33 : .38);
    const x = w * (.5 + (seededUnit(seed + copy * 17.3) - .5) * 2 * spread);
    const y = h * (.58 + (seededUnit(seed + copy * 29.1) - .5) * 1.55 * spread);
    const base = Math.min(w, h) * (.055 + reveal * .055 + (copy % 3) * .009) * zoom * (.48 + arrival * .5);
    const theta = (39 + 10 * Math.sin(t * .1 * speed + phase)) * Math.PI / 180;
    const depth = 5 + (copy % 3);
    const alpha = .045 + arrival * (ritual ? .2 : .18);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (.014 + copy * .0014) * speed * direction + phase * .09);
    pythagoras(-base / 2, 0, base / 2, 0, depth, theta, depth, alpha);
    ctx.restore();
  }
}

function drawImageCover(ctx, image, w, h) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.drawImage(image, (w - width) / 2, (h - height) / 2, width, height);
}

function drawCanvasContain(ctx, source, w, h) {
  const scale = Math.min(w / source.width, h / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  ctx.drawImage(source, (w - width) / 2, (h - height) / 2, width, height);
}

function drawSourcePreview(canvas) {
  if (state.sourceImage?.complete) {
    const { ctx, w, h } = resizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    drawImageCover(ctx, state.sourceImage, w, h);
  } else {
    drawTree(canvas, state.params, { alpha: .82, stage: true, roulette: true });
  }
}

function drawCutForm(canvas, time, progress, withSource) {
  const { ctx, w, h, d } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  if (withSource) {
    if (state.sourceImage?.complete) drawImageCover(ctx, state.sourceImage, w, h);
    else drawCanvasContain(ctx, $('#sourcePreview'), w, h);
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fillRect(0, 0, w, h);
  }
  const t = time / 1000;
  const cx = w / 2;
  const cy = h * .53;
  const radius = Math.hypot(w, h) * .68;
  const charges = clamp(state.cut.charges || 1, 1, 3);
  const rotation = state.cut.phase + t * CUT_SPIN;
  for (let charge = 0; charge < charges; charge++) {
    const offset = (charge - (charges - 1) / 2) * .29;
    const centerAngle = rotation + offset;
    const width = .48 / Math.pow(charges, .2) + progress * .05;
    const a1 = centerAngle - width / 2;
    const a2 = centerAngle + width / 2;
    const edge1 = kochPoints(cx, cy, cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius, 2, charge % 2 ? 1 : -1);
    const edge2 = kochPoints(cx, cy, cx + Math.cos(a2) * radius, cy + Math.sin(a2) * radius, 2, charge % 2 ? -1 : 1);
    ctx.beginPath();
    edge1.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    for (let step = 1; step <= 8; step++) {
      const angle = a1 + (a2 - a1) * step / 8;
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    }
    [...edge2].reverse().forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = withSource ? 'rgba(74,18,21,.5)' : 'rgba(74,22,24,.38)';
    ctx.fill();
  }
}

function drawTree(canvas, params, options = {}) {
  const { ctx, w, h, d } = resizeCanvas(canvas);
  if (!options.preserve) ctx.clearRect(0, 0, w, h);
  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  const tree = layer.getContext('2d');
  tree.lineCap = 'round';
  tree.save();
  const depth = Math.round(clamp(params.depth || 15, 13, TREE_DEPTH));
  const sourceAmplitude = clamp(params.amplitude || 1, .68, 1.34);
  const sourceHeight = clamp(params.height || 1, .76, 1.22);
  const sourceLean = clamp(params.lean || 0, -.26, .26);
  const sourceWind = clamp(params.wind ?? params.sideBias ?? sourceLean, -.36, .36);
  const amplitude = options.roulette ? clamp(sourceAmplitude * .86, .78, 1.08) : sourceAmplitude;
  const height = options.roulette ? clamp(sourceHeight * .9, .84, 1.02) : sourceHeight;
  const lean = options.roulette ? clamp(sourceLean, -.56, .56) : sourceLean;
  const rootOffset = options.roulette ? 0 : -sourceWind * w * .07;
  tree.translate(w / 2 + rootOffset, h * (options.stage ? .84 : .69));
  const sideBias = clamp(params.sideBias || 0, -1, 1);
  const crownVoid = clamp(params.void || 0, 0, .5);
  const irregularity = clamp(params.irregularity || 0, 0, .6);
  const growth = clamp(params.growth ?? 1, .16, 1);
  const treeSeed = params.seed || 1;
  tree.transform(amplitude, 0, -lean * (options.roulette ? .34 : .42), height, 0, 0);
  const unit = h * (options.stage ? .72 : .5) / (3 * depth * (depth + 1));
  const maxLevel = depth;
  const visibleProgress = options.progress ?? 1;

  function branch(x1, y1, angle, branchDepth, path = 1) {
    if (branchDepth <= 0) return;
    const level = maxLevel - branchDepth;
    if (level / maxLevel > visibleProgress) return;
    const length = branchDepth * 6 * unit;
    const radians = angle * Math.PI / 180;
    const x2 = x1 + Math.cos(radians) * length;
    const y2 = y1 + Math.sin(radians) * length;
    const color = Math.floor(255 * branchDepth / TREE_DEPTH);
    tree.strokeStyle = `rgba(${color},${color},${color},${options.alpha ?? 1})`;
    tree.lineWidth = Math.max(.38 * d, branchDepth / 8 * d);
    tree.beginPath();
    tree.moveTo(x1, y1);
    tree.lineTo(x2, y2);
    tree.stroke();

    const childDepth = branchDepth - 1;
    const childLength = childDepth * 6 * unit;
    const gapRadius = w * crownVoid / Math.max(.72, amplitude) * .22;
    const canGrow = (childAngle, childPath) => {
      if (childDepth <= 0) return false;
      const childRadians = childAngle * Math.PI / 180;
      const childX = x2 + Math.cos(childRadians) * childLength;
      const random = seededUnit(treeSeed + childPath * 7.19 + level * 19.7);

      // Slow or discontinuous movement makes the outer crown sparse.
      if (level > 4 && random > .52 + growth * .5) return false;
      if (level > 5 && random < irregularity * .16) return false;

      // A strong horizontal gesture can grow an almost one-sided tree.
      const wrongSide = sideBias > .18 ? childX < -gapRadius * .18 : sideBias < -.18 ? childX > gapRadius * .18 : false;
      if (wrongSide && level < 9 && random < Math.abs(sideBias) * .92) return false;

      // Branches returning toward the axis are removed to open a central void.
      const returnsToCenter = level > 2 && Math.abs(x2) > gapRadius * .36 && Math.abs(childX) < gapRadius;
      if (returnsToCenter && random < crownVoid * 1.9) return false;
      return true;
    };
    const branchSpread = options.roulette ? 20 : 18;
    const windTurn = sourceWind * (options.roulette ? .35 : .45) * (1 + level * .04);
    const leftAngle = angle - branchSpread + windTurn;
    const rightAngle = angle + branchSpread + windTurn;
    if (canGrow(leftAngle, path * 2 + 1)) branch(x2, y2, leftAngle, childDepth, path * 2 + 1);
    if (canGrow(rightAngle, path * 2 + 2)) branch(x2, y2, rightAngle, childDepth, path * 2 + 2);
  }
  branch(0, 0, -90, depth, 1);
  tree.restore();

  ctx.save();
  if (Number.isFinite(options.clipBottom)) {
    ctx.beginPath();
    ctx.rect(0, 0, w, h * options.clipBottom);
    ctx.clip();
  }
  if (options.cut) drawCutTree(ctx, layer, w, h, d, state.cut);
  else ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function kochPoints(x1, y1, x2, y2, iterations, direction = -1) {
  let points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  for (let step = 0; step < iterations; step++) {
    const next = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = (b.x - a.x) / 3;
      const dy = (b.y - a.y) / 3;
      const p1 = { x: a.x + dx, y: a.y + dy };
      const p3 = { x: a.x + dx * 2, y: a.y + dy * 2 };
      const angle = direction * Math.PI / 3;
      const p2 = {
        x: p1.x + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: p1.y + dx * Math.sin(angle) + dy * Math.cos(angle),
      };
      next.push(a, p1, p2, p3);
    }
    next.push(points[points.length - 1]);
    points = next;
    direction *= -1;
  }
  return points;
}

function cutPath(w, h, cut) {
  const level = h * cut.level;
  const slope = Math.tan(cut.rotation * Math.PI / 180);
  return kochPoints(-w * .08, level - slope * w / 2, w * 1.08, level + slope * w / 2, cut.frequency, cut.phase % 2 > 1 ? 1 : -1);
}

function tracePoints(ctx, points) {
  ctx.beginPath();
  points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
}

function drawCutTree(ctx, layer, w, h, d, cut) {
  ctx.drawImage(layer, 0, 0);
  drawCutMask(ctx, w, h, cut);
}

function drawCutMask(ctx, w, h, cut) {
  const cx = w / 2;
  const cy = h * .52;
  const radius = Math.hypot(w, h) * .75;
  const charges = clamp(cut.charges || 1, 1, 3);
  const baseWidth = .42 + clamp(cut.level || .5, .4, .7) * .16;
  for (let charge = 0; charge < charges; charge++) {
    const offset = (charge - (charges - 1) / 2) * .3;
    const angle = cut.rotation + offset;
    const width = baseWidth / Math.pow(charges, .2);
    const a1 = angle - width / 2;
    const a2 = angle + width / 2;
    const edge1 = kochPoints(cx, cy, cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius, cut.frequency, charge % 2 ? 1 : -1);
    const edge2 = kochPoints(cx, cy, cx + Math.cos(a2) * radius, cy + Math.sin(a2) * radius, cut.frequency, charge % 2 ? -1 : 1);
    ctx.beginPath();
    edge1.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    for (let step = 1; step <= 10; step++) {
      const outerAngle = a1 + (a2 - a1) * step / 10;
      ctx.lineTo(cx + Math.cos(outerAngle) * radius, cy + Math.sin(outerAngle) * radius);
    }
    [...edge2].reverse().forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = '#030303';
    ctx.fill();
  }
}

function drawExportCutOverlay(ctx, w, h, cut) {
  drawCutMask(ctx, w, h, cut);
}

function drawResult() {
  const canvas = $('#treeCanvas');
  const cardRect = $('#resultCard').getBoundingClientRect();
  const copyRect = $('.card-copy').getBoundingClientRect();
  const clipBottom = cardRect.height
    ? clamp((copyRect.top - cardRect.top) / cardRect.height - .025, .58, .76)
    : .7;
  if (state.act === 'cut' && state.sourceImage?.complete) {
    const { ctx, w, h, d } = resizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const layer = document.createElement('canvas');
    layer.width = w;
    layer.height = h;
    drawImageCover(layer.getContext('2d'), state.sourceImage, w, h);
    drawCutTree(ctx, layer, w, h, d, state.cut);
  } else {
    drawTree(canvas, state.params, { cut: state.act === 'cut', clipBottom });
  }
}

function renderSavedField() {
  const field = $('#savedField');
  field.replaceChildren();
  state.saved.slice(-12).forEach((card, index) => {
    const tile = document.createElement('i');
    const angle = ((index * 47) % 36) - 18;
    const radius = 4 + index * 1.7;
    tile.style.setProperty('--r', `${angle}deg`);
    tile.style.setProperty('--x', `${Math.cos(index * 2.1) * radius}px`);
    tile.style.setProperty('--y', `${Math.sin(index * 1.7) * radius}px`);
    tile.style.opacity = String(.42 + index / 24);
    field.append(tile);
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 6) {
  const words = text.split(/\s+/);
  let line = '';
  let lineIndex = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      line = word;
      lineIndex++;
      if (lineIndex >= maxLines) return;
    } else line = test;
  }
  if (lineIndex < maxLines) ctx.fillText(line, x, y + lineIndex * lineHeight);
}

$('#saveCard').addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 900;
  exportCanvas.height = 1200;
  const ctx = exportCanvas.getContext('2d');
  ctx.fillStyle = '#030303';
  ctx.fillRect(0, 0, 900, 1200);
  ctx.drawImage($('#treeCanvas'), 0, 0, 900, 1200);
  ctx.strokeStyle = '#d6d2cb';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 852, 1152);
  ctx.strokeRect(34, 34, 832, 1132);
  ctx.fillStyle = '#eeeae3';
  ctx.font = '27px Georgia';
  ctx.textAlign = 'right';
  ctx.fillText($('#cardDate').textContent, 828, 96);
  ctx.textAlign = 'left';
  ctx.font = 'italic 23px Georgia';
  const quote = state.selectedQuote || quoteBank[0];
  wrapText(ctx, quote.text, 72, 1010, 390, 30, 4);
  ctx.font = '15px Arial';
  ctx.fillStyle = '#9d9790';
  ctx.fillText(quote.author.toUpperCase(), 72, 1140);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#eeeae3';
  ctx.font = '32px Georgia';
  ctx.fillText('Вишневый сад', 828, 1010);
  ctx.font = '22px Georgia';
  ctx.fillText('А.П. Чехов', 828, 1050);
  if (state.act === 'cut') drawExportCutOverlay(ctx, 900, 1200, state.cut);
  const link = document.createElement('a');
  link.download = `vishnevy-sad-${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
  state.saved.push({
    date: Date.now(),
    act: state.act,
    params: { ...state.params },
    cut: { ...state.cut },
  });
  localStorage.setItem('vsad-cards', JSON.stringify(state.saved.slice(-80)));
  window.setTimeout(() => show('acts'), 320);
});

$('#returnActs').addEventListener('click', () => show('acts'));

window.addEventListener('resize', () => {
  if ($('.result').classList.contains('is-active')) drawResult();
});

renderSavedField();

// A tiny deterministic hook for local interaction QA; it is inert in normal use.
window.__VSAD__ = { beginAct, show, drawResult, state };
