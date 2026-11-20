/* ===== Ajustes que puedes cambiar ===== */
// Enlace para «Pedir licencia» y la prueba (Discord, WhatsApp, correo…). Vacío = lleva a la sección de precio.
const CONTACTO = 'https://discord.gg/ztMtKqWnT';
// Repositorio PÚBLICO solo con instaladores y web (el código vive en uno privado).
const REPO = 'Monsterpick/LiveArena';
/* ===================================== */

const $ = (s, r = document) => r.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;

/* ---------- descarga: siempre el último instalador publicado ---------- */
(async () => {
  let url = `https://github.com/${REPO}/releases/latest`;
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (r.ok) {
      const rel = await r.json();
      const setup = rel.assets.find((a) => /^LiveArena-Setup-.*\.exe$/.test(a.name));
      if (setup) {
        url = setup.browser_download_url;
        const mb = Math.round(setup.size / 1048576);
        document.querySelectorAll('[data-version]').forEach((el) => (el.textContent = `Versión ${rel.tag_name.replace(/^v/, '')} · 7 días gratis`));
        document.querySelectorAll('[data-size]').forEach((el) => (el.textContent = `Instalador para Windows 10 y 11 · ${mb} MB · se actualiza solo`));
      }
    }
  } catch { /* sin conexión con GitHub: el botón abre la página de descargas */ }
  document.querySelectorAll('[data-download]').forEach((a) => (a.href = url));
})();
document.querySelectorAll('[data-contact]').forEach((a) => {
  a.href = CONTACTO || '#precio';
  if (CONTACTO) { a.target = '_blank'; a.rel = 'noopener'; }
});

/* ---------- catálogo de cinemáticas (id, nombre, tipo, qué pasa, daño final, segundos) ---------- */
const CATS = { destruccion: 'Destrucción total', heroes: 'Héroes y poderes', monstruos: 'Monstruos y titanes', elementos: 'Elementos y magia', trampas: 'Trampas y defensa' };
const CINE = [
  ['impacto_lunar', 'Impacto Lunar', 'destruccion', 'El cielo se tiñe de rojo y la Luna cae al rojo vivo: llueven fragmentos, su gravedad arranca el suelo y abre el cráter más grande de todos.', 250, 22],
  ['mecha_kaiju', 'Titán Mecha-Kaiju', 'monstruos', 'Un titán mecánico de 30 bloques baja con propulsores, avanza abriendo cráteres, lanza misiles y dispara el rayo de su reactor.', 150, 22],
  ['nuclear', 'Bomba nuclear', 'destruccion', 'Sirenas, reflectores y un bombardero: destello cegador, hongo atómico y una onda expansiva que lo arrasa todo.', 100, 29],
  ['thor', 'Thor', 'heroes', 'Súper tormenta: el dios del trueno corre entre relámpagos, salta al cielo y lanza su hacha con un rayo descomunal.', 70, 18],
  ['meteorito', 'Meteorito', 'destruccion', 'La cámara sube al espacio y una roca incandescente cae dejando un cráter enorme.', 50, 18],
  ['serafin', 'Serafín', 'monstruos', 'El cielo se rasga y baja un ser de seis alas: su ojo dispara un haz que barre el suelo en espiral.', 40, 15],
  ['supernova', 'Supernova', 'elementos', 'Una estrella nace sobre ti, crece, colapsa en un punto y estalla con una onda de choque.', 35, 16],
  ['ataque_orbital', 'Ataque orbital', 'destruccion', 'Un satélite fija el objetivo desde el espacio, con la Tierra de fondo, y dispara un láser colosal.', 30, 14],
  ['kamehameha', 'Kamehameha', 'heroes', 'Un guerrero carga una esfera azul en la cadera mientras el suelo se levanta y dispara un haz que te arrastra.', 30, 12],
  ['dragon_cambio', 'Décima Postura: Dragón del Cambio', 'heroes', 'Un espadachín gira a tu alrededor y su dragón de agua crece con cada vuelta hasta caer en picado.', 30, 12],
  ['coloso', 'Coloso de lava', 'monstruos', 'Un gólem gigante de roca y lava cae ardiendo, ruge, abre una grieta hasta ti y te lanza de un pisotón.', 30, 17],
  ['erupcion', 'Erupción', 'elementos', 'La tierra se agrieta en vetas de magma, un volcán crece bajo tus pies y estalla.', 30, 15],
  ['genkidama', 'Genkidama', 'heroes', 'Un guerrero sube al cielo y reúne la energía de todos en una esfera gigante que lanza contra ti.', 25, 22],
  ['calma', 'Undécima Postura: Calma', 'heroes', 'El suelo se vuelve un mar en calma y un espadachín corta todo lo que entra en su alcance.', 25, 15],
  ['ovni', 'OVNI', 'monstruos', 'Un platillo volante te atrapa con su haz tractor junto a los bloques de alrededor y te deja caer.', 25, 14],
  ['glaciar', 'Era glacial', 'elementos', 'Ventisca, picos de hielo en espiral y un bloque de hielo que te atrapa antes de lanzarte.', 25, 14],
  ['tornado', 'Tornado', 'elementos', 'Un embudo gigante avanza arrancando el suelo, te hace girar y te lanza por los aires.', 22, 16],
  ['juicio_arcano', 'Juicio ígneo', 'elementos', 'Sello y columnas de fuego, lluvia de meteoros y un sol que se comprime sobre ti y estalla.', 20, 14],
  ['mil_cortes', 'Mil cortes: Templo del mal', 'heroes', 'Un templo emerge bajo un cielo carmesí y cientos de tajos cruzan el dominio.', 15, 15],
  ['vacio_purpura', 'Vacío púrpura', 'heroes', 'Azul en una mano y rojo en la otra se funden en un orbe púrpura que lo borra todo a su paso.', 15, 21],
  ['sangre_perforante', 'Sangre Perforante', 'heroes', 'Un hechicero comprime una esfera de sangre y dispara una flecha que te atraviesa.', 15, 14],
  ['misiles', 'Ráfaga de misiles', 'destruccion', 'Una torreta fija al jugador y dispara 8 misiles que lo persiguen. Puede correr y esquivarlos.', 15, 26],
  ['trueno_explosion', 'Trueno + explosión', 'elementos', 'Tres rayos te cercan, cae el rayo central y todo estalla.', 15, 7],
  ['super_rayo', 'Súper rayo', 'elementos', 'El cielo se oscurece y cae un relámpago colosal y ramificado.', 12.5, 5],
  ['ojo_vacio', 'Ojo del vacío', 'monstruos', 'Un ojo colosal con tentáculos se abre en el cielo: todo levita y luego es aplastado.', 12, 13],
  ['agujero_negro', 'Agujero negro', 'elementos', 'Arranca el terreno en espiral, lo traga todo y colapsa.', 10, 15],
  ['akaza', 'Aguja de brújula', 'heroes', 'Un luchador despliega su brújula de hielo, te eleva a puñetazos de aire y te remata contra el suelo.', 10, 20],
  ['carrusel_creepers', 'Carrusel de creepers', 'trampas', 'Ocho creepers cargados giran como un tiovivo y se lanzan con explosiones enormes.', 10, 10],
  ['corona_espadas', 'Corona de espadas', 'trampas', 'Doce espadas forman una corona sobre ti y se disparan una tras otra.', 5, 7],
  ['onda_repulsion', 'Onda de repulsión', 'trampas', 'Un anillo de fuerza barre el terreno y lanza todo por los aires.', 4, 4],
  ['escudo', 'Escudo de energía', 'trampas', 'Una coraza hexagonal con vida propia que absorbe golpes y se rompe en pedazos. Esta ayuda al streamer.', 0, 60],
];

/* ---------- inicio: un regalo y toda la escena reacciona ---------- */
const GIFTS = [
  { g: '🌙', name: 'Universo', clip: 'hero_luna', effect: 'Impacto Lunar', combo: 'x1' },
  { g: '🦁', name: 'León', clip: 'hero_mecha', effect: 'Titán Mecha-Kaiju', combo: 'x3' },
  { g: '🚀', name: 'Cohete', clip: 'hero_nuclear', effect: 'Bomba nuclear', combo: 'x5' },
  { g: '💙', name: 'Corazón', clip: 'hero_kame', effect: 'Kamehameha', combo: 'x12' },
];
const VIEWERS = ['luna_gamer', 'eldiego.mx', 'sofi_plays', 'kevo777', 'majo.tv', 'thiago_crack', 'valen_uwu', 'nachito', 'cami.mc', 'bruno_ttv'];
const CHAT = ['NOOO la Luna 😱', 'otra vez el titán!!', 'jajaja no sobrevive', 'manda el León', 'quiero ver la nuclear', '¿con qué app haces esto?', 'GG', '🔥🔥🔥'];
const bgVideo = $('#bg-video');
const phoneVideo = $('#phone-video');
const feed = $('#feed');
const row = $('#gift-row');
const combo = $('#combo');
const burst = $('#burst');
const hearts = $('#hearts');
let current = 0;
let auto = true;
const rnd = (a) => a[Math.floor(Math.random() * a.length)];

function addFeed(html, cls = '') {
  const li = document.createElement('li');
  if (cls) li.className = cls;
  li.innerHTML = html;
  feed.prepend(li);
  while (feed.children.length > 4) feed.lastChild.remove();
}
function swapVideo(v, clip) {
  v.classList.add('swap');
  setTimeout(() => {
    v.poster = `media/${clip}.jpg`;
    v.src = `media/${clip}.mp4`;
    v.play().catch(() => {});
    v.classList.remove('swap');
  }, 300);
}
function sendGift(i, who) {
  const gift = GIFTS[i];
  current = i;
  row.querySelectorAll('.gift').forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  addFeed(`<span class="g" aria-hidden="true">${gift.g}</span><span><b>${who}</b> envió ${gift.name} ${gift.combo}</span>`, 'gift-msg');
  combo.innerHTML = `${gift.g} ${gift.effect}<small>${who} envió ${gift.name} ${gift.combo}</small>`;
  combo.classList.remove('show');
  void combo.offsetWidth; // reinicia la animación
  combo.classList.add('show');
  if (!reduced) for (let k = 0; k < 14; k++) {
    const s = document.createElement('span');
    s.textContent = gift.g;
    s.style.setProperty('--bx', `${(Math.random() - 0.5) * 260}px`);
    s.style.setProperty('--by', `${-120 - Math.random() * 320}px`);
    s.style.setProperty('--br', `${(Math.random() - 0.5) * 120}deg`);
    s.style.animationDelay = `${k * 30}ms`;
    burst.append(s);
    setTimeout(() => s.remove(), 1700);
  }
  swapVideo(phoneVideo, gift.clip);
  swapVideo(bgVideo, gift.clip);
}
GIFTS.forEach((gift, i) => {
  const b = document.createElement('button');
  b.className = 'gift';
  b.type = 'button';
  b.setAttribute('aria-pressed', String(i === 0));
  b.innerHTML = `<span aria-hidden="true">${gift.g}</span>${gift.name}`;
  b.addEventListener('click', () => { auto = false; sendGift(i, 'Tú'); });
  row.append(b);
});
addFeed(`<span class="g" aria-hidden="true">👋</span><span><b>luna_gamer</b> se unió al directo</span>`);
if (!reduced) {
  setInterval(() => { // likes que suben por la derecha
    if (document.hidden) return;
    const h = document.createElement('span');
    h.textContent = rnd(['❤️', '💛', '🧡', '💖', '❤️']);
    h.style.setProperty('--hx', `${(Math.random() - 0.5) * 40}px`);
    hearts.append(h);
    setTimeout(() => h.remove(), 2700);
  }, 420);
}
let tick = 0;
setInterval(() => {
  if (document.hidden) return;
  tick++;
  const who = rnd(VIEWERS);
  if (auto && tick % 3 === 0) sendGift((current + 1) % GIFTS.length, who);
  else if (Math.random() < 0.5) addFeed(`<span class="g" aria-hidden="true">💬</span><span><b>${who}</b> ${rnd(CHAT)}</span>`);
  else addFeed(`<span class="g" aria-hidden="true">❤️</span><span><b>${who}</b> dio ${10 + Math.floor(Math.random() * 90)} likes</span>`);
  $('#viewers').textContent = `${(1.1 + Math.random() * 0.4).toFixed(1).replace('.', ',')} k espectadores`;
}, reduced ? 6000 : 2400);

/* profundidad: el móvil sigue al ratón y el fondo se aleja al bajar */
const phone = $('.phone');
if (fine && !reduced) {
  $('#hero').addEventListener('pointermove', (e) => {
    // sobre el móvil se endereza: así los regalos no se mueven bajo el cursor al ir a pulsarlos
    if (phone.contains(e.target)) { phone.style.setProperty('--ry', '0deg'); phone.style.setProperty('--rx', '0deg'); return; }
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    phone.style.setProperty('--ry', `${-10 + x * 16}deg`);
    phone.style.setProperty('--rx', `${4 - y * 10}deg`);
  });
}

/* ---------- tira de cine (dos filas en bucle) ---------- */
const reelCard = ([id, name]) => `<div class="reel-card"><img src="media/${id}.jpg" alt="" loading="lazy" width="300" height="169"><span>${name}</span></div>`;
const half = Math.ceil(CINE.length / 2);
const rowA = CINE.slice(0, half).map(reelCard).join('');
const rowB = CINE.slice(half).map(reelCard).join('');
$('#reel-a').innerHTML = rowA + rowA; // duplicada: el bucle no tiene salto
$('#reel-b').innerHTML = rowB + rowB;

/* ---------- sala de cine ---------- */
const pv = $('#player-video');
const strip = $('#strip');
let idx = 0;
let paused = false;
let filter = 'todas';
let started = 0;
const DURATION = 7000;
const glow = { destruccion: 'rgb(255 120 40 / .55)', heroes: 'rgb(90 170 255 / .5)', monstruos: 'rgb(255 59 74 / .5)', elementos: 'rgb(160 110 255 / .5)', trampas: 'rgb(124 255 140 / .4)' };

CINE.forEach(([id, name], i) => {
  const li = document.createElement('li');
  li.dataset.cat = CINE[i][2];
  li.innerHTML = `<button type="button" class="thumb" aria-label="Ver ${name}"><img src="media/${id}.jpg" alt="" loading="lazy" width="168" height="94"><span>${name}</span></button>`;
  li.querySelector('button').addEventListener('click', () => { show(i); started = performance.now(); });
  strip.append(li);
});
const visibleIdx = () => CINE.map((c, i) => i).filter((i) => filter === 'todas' || CINE[i][2] === filter);
function show(i) {
  idx = i;
  const [id, name, cat, desc, dmg, secs] = CINE[i];
  pv.classList.add('swap');
  setTimeout(() => {
    pv.poster = `media/${id}.jpg`;
    pv.src = `media/${id}.mp4`;
    if (!paused) pv.play().catch(() => {});
    pv.classList.remove('swap');
  }, 200);
  $('#player-title').textContent = name;
  $('#player-cat').textContent = CATS[cat];
  $('#player-desc').textContent = desc;
  $('#player-dmg').textContent = dmg ? `${dmg} ❤` : 'Te protege';
  $('#player-dur').textContent = `${secs} s`;
  $('#player').style.setProperty('--glow', glow[cat]);
  strip.querySelectorAll('.thumb').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
  const li = strip.children[i];
  strip.scrollTo({ left: li.offsetLeft - strip.clientWidth / 2 + li.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
}
function step(d) {
  const list = visibleIdx();
  const p = list.indexOf(idx);
  show(list[(p + d + list.length) % list.length]);
  started = performance.now();
}
$('#prev').addEventListener('click', () => step(-1));
$('#next').addEventListener('click', () => step(1));
$('#pause').addEventListener('click', (e) => {
  paused = !paused;
  e.currentTarget.textContent = paused ? '▶' : '❚❚';
  e.currentTarget.setAttribute('aria-label', paused ? 'Reanudar el tráiler' : 'Pausar el tráiler');
  paused ? pv.pause() : pv.play().catch(() => {});
  started = performance.now();
});

const filters = $('#filters');
[['todas', 'Todas', CINE.length], ...Object.entries(CATS).map(([k, v]) => [k, v, CINE.filter((c) => c[2] === k).length])].forEach(([k, label, n]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-selected', String(k === 'todas'));
  b.innerHTML = `${label}<small>${n}</small>`;
  b.addEventListener('click', () => {
    filter = k;
    filters.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    strip.querySelectorAll('li').forEach((li) => li.classList.toggle('hide', k !== 'todas' && li.dataset.cat !== k));
    show(visibleIdx()[0]);
    started = performance.now();
  });
  filters.append(b);
});

// el tráiler solo avanza mientras la sala se ve en pantalla
let theaterOn = false;
new IntersectionObserver(([e]) => {
  theaterOn = e.isIntersecting;
  if (theaterOn && !pv.src) show(0);
  if (theaterOn && !paused) { pv.play().catch(() => {}); started = performance.now(); } else pv.pause();
}, { threshold: 0.25 }).observe($('#player'));
(function loop(now) {
  if (theaterOn && !paused && !reduced) {
    const u = (now - started) / DURATION;
    $('#player-bar').style.width = `${Math.min(100, u * 100)}%`;
    if (u >= 1) step(1);
  }
  requestAnimationFrame(loop);
})(performance.now());

/* ---------- vídeos que se cargan solo al verse ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      if (!reduced) v.play().catch(() => {});
    } else v.pause();
  }
}, { rootMargin: '150px' });
document.querySelectorAll('video[data-src]').forEach((v) => io.observe(v));

/* ---------- minijuegos: inclinación 3D al pasar el ratón ---------- */
if (fine && !reduced) document.querySelectorAll('.tilt').forEach((card) => {
  const m = card.querySelector('.game-media');
  card.addEventListener('pointermove', (e) => {
    const r = m.getBoundingClientRect();
    m.style.setProperty('--ty', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
    m.style.setProperty('--tx', `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
  });
  card.addEventListener('pointerleave', () => { m.style.setProperty('--ty', '0deg'); m.style.setProperty('--tx', '0deg'); });
});

/* ---------- scroll: cabecera, paralaje del fondo, línea de pasos, ventana de la app ---------- */
const header = $('#top');
const steps = $('.step-list');
const win = $('.window');
function onScroll() {
  const y = scrollY;
  header.classList.toggle('solid', y > 40);
  if (!reduced) {
    if (y < innerHeight * 1.2) {
      bgVideo.style.setProperty('--bg-y', `${y * 0.25}px`);
      bgVideo.style.setProperty('--bg-scale', `${1.08 + y / innerHeight * 0.12}`);
    }
    const sr = steps.getBoundingClientRect();
    steps.style.setProperty('--p', Math.max(0, Math.min(1, (innerHeight * 0.8 - sr.top) / (sr.height + innerHeight * 0.3))).toFixed(3));
    const wr = win.getBoundingClientRect();
    const u = Math.max(0, Math.min(1, (innerHeight - wr.top) / (innerHeight * 0.75)));
    win.style.setProperty('--wx', `${14 * (1 - u)}deg`);
    win.style.setProperty('--ws', `${0.94 + 0.06 * u}`);
  }
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* aparición una sola vez de los títulos y bloques al llegar a ellos */
const revealer = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
}, { threshold: 0.15 });
document.querySelectorAll('section:not(.hero) h2, .section-lead, .step-list li, .game, .plan, .player, .tab-panel').forEach((el, i) => {
  el.classList.add('reveal');
  if (el.matches('.step-list li, .game, .plan')) el.style.transitionDelay = `${(i % 5) * 90}ms`;
  revealer.observe(el);
});

/* ---------- pestañas de la app ---------- */
const SHOTS = {
  plugins: ['app_plugins.jpg', 'Pantalla de LiveArena donde se asigna una acción a cada regalo', 'Cada regalo, like o seguidor dispara una acción: monstruos, TNT, objetos, tótems, cinemáticas. Perfiles listos para empezar y una galería por categorías para elegir sin saber comandos.'],
  overlays: ['app_overlays.jpg', 'Catálogo de overlays de LiveArena con vista previa', 'Más de 30 overlays para tu escena: top de regalos, metas, contador de tótems, alertas de «te mató» y más. Los pruebas antes de colocarlos y los pegas en OBS o TikTok LIVE Studio.'],
  tts: ['app_tts.jpg', 'Pantalla de voces de LiveArena', 'El chat habla: lee comentarios y regalos con voces naturales o al estilo Loquendo, y puede darle una voz distinta a cada espectador.'],
  emitir: ['app_emitir.jpg', 'Asistente para emitir con OBS de LiveArena', 'Un asistente deja OBS listo para directo vertical: escenas, fuentes y overlays en su sitio, con los ajustes recomendados para TikTok.'],
};
const tabs = document.querySelectorAll('[role="tab"][data-shot]');
tabs.forEach((t) => t.addEventListener('click', () => {
  tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
  const [img, alt, text] = SHOTS[t.dataset.shot];
  const el = $('#tab-img');
  el.style.opacity = 0;
  setTimeout(() => { el.src = `media/${img}`; el.alt = alt; el.style.opacity = 1; }, 180);
  $('#tab-text').textContent = text;
}));
