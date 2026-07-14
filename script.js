// ─── API BACKEND (PHP / MySQL) ───
// Adaptez ce chemin selon l'emplacement de votre dossier backend/api sur le serveur.
const API_BASE = '/backend/api';

async function apiCall(endpoint, { method = 'GET', body = null } = {}) {
  const opts = {
    method,
    credentials: 'include', // envoie/reçoit le cookie de session PHP
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  let res, data;
  try {
    res = await fetch(`${API_BASE}/${endpoint}`, opts);
    data = await res.json();
  } catch (err) {
    console.error('Erreur API', endpoint, err);
    return { success: false, error: 'Impossible de contacter le serveur.' };
  }
  if (!res.ok) console.warn('API', endpoint, data.error || res.status);
  return data;
}

const api = {
  destinations:      (params = '') => apiCall(`destinations.php${params}`),
  packages:           (params = '') => apiCall(`packages.php${params}`),
  me:                 ()            => apiCall('auth.php'),
  register:           (payload)     => apiCall('auth.php', { method: 'POST', body: { action: 'register', ...payload } }),
  login:              (payload)     => apiCall('auth.php', { method: 'POST', body: { action: 'login', ...payload } }),
  logout:             ()            => apiCall('auth.php', { method: 'POST', body: { action: 'logout' } }),
  createBooking:      (payload)     => apiCall('bookings.php', { method: 'POST', body: payload }),
  myBookings:         ()            => apiCall('bookings.php'),
  getWishlist:        ()            => apiCall('wishlist.php'),
  addWishlist:        (destinationId) => apiCall('wishlist.php', { method: 'POST', body: { destination_id: destinationId } }),
  removeWishlist:     (destinationId) => apiCall(`wishlist.php?destination_id=${destinationId}`, { method: 'DELETE' }),
  getPlans:           ()            => apiCall('plans.php'),
  savePlanApi:        (payload)     => apiCall('plans.php', { method: 'POST', body: payload }),
  deletePlanApi:      (id)          => apiCall(`plans.php?id=${id}`, { method: 'DELETE' }),
  subscribeNewsletterApi: (email)   => apiCall('newsletter.php', { method: 'POST', body: { email } }),
  sendContact:        (payload)     => apiCall('contact.php', { method: 'POST', body: payload }),
};

// ─── MOBILE MENU ───
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const burger = document.getElementById('hamburger');
  menu.classList.toggle('open');
  burger.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── SCROLL TOP ───
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('show', window.scrollY > 500);
});

// ─── NEWSLETTER ───
function subscribeNewsletter(btn) {
  const input = btn.previousElementSibling;
  const email = input.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    input.style.borderColor = '#c0392b';
    setTimeout(() => input.style.borderColor = '', 1500);
    return;
  }
  btn.textContent = '✓ Inscrit !';
  btn.style.background = 'var(--olive)';
  input.value = '';
  api.subscribeNewsletterApi(email).then(res => {
    if (!res.success) console.warn('Newsletter backend: ', res.error);
  });
  setTimeout(() => { btn.textContent = "S'Abonner"; btn.style.background = ''; }, 3000);
}

// ─── NAV SCROLL ───
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

// ─── REVEAL ON SCROLL ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80);
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));
document.querySelectorAll('.hero .reveal').forEach(el => setTimeout(() => el.classList.add('visible'), 300));

// ─── COUNTERS ───
function animateCounter(el, target, suffix) {
  let start = 0;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1800, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.innerHTML = Math.floor(e * target).toLocaleString('fr-FR') + '<span>' + suffix + '</span>';
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const num = entry.target.querySelector('[data-target]');
      if (num && !num.dataset.animated) {
        num.dataset.animated = true;
        animateCounter(num, parseInt(num.dataset.target), num.querySelector('span').textContent);
      }
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat').forEach(s => statsObserver.observe(s));

// ─── AUTH: storage helpers ───
function getUsers() { try { return JSON.parse(localStorage.getItem('voy_users') || '[]'); } catch { return []; } }
function saveUsers(u) { localStorage.setItem('voy_users', JSON.stringify(u)); }
function getCurrentUser() { try { return JSON.parse(sessionStorage.getItem('voy_current') || 'null'); } catch { return null; } }
function setCurrentUser(u) { sessionStorage.setItem('voy_current', JSON.stringify(u)); }

// ─── AUTH: UI update ───
function updateAuthUI() {
  const user = getCurrentUser();
  const navUser = document.getElementById('navUser');
  const navAvatar = document.getElementById('navAvatar');
  const navUserName = document.getElementById('navUserName');
  const loginBtn = document.querySelector('.nav-login:not(#navUser .nav-login)');
  const registerBtn = document.querySelector('.nav-cta');
  if (user) {
    navUser.classList.add('active');
    navAvatar.textContent = user.prenom[0].toUpperCase();
    navUserName.textContent = user.prenom + ' ' + user.nom;
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
  } else {
    navUser.classList.remove('active');
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';
  }
}

function logoutUser() {
  sessionStorage.removeItem('voy_current');
  api.logout();
  updateAuthUI();
}

// ─── AUTH: Modal ───
function openModal(tab) {
  document.getElementById('authModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(tab || 'login');
}
function closeModal() {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOnBg(e) {
  if (e.target === document.getElementById('authModal')) closeModal();
}
function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('formLogin').classList.toggle('active', tab === 'login');
  document.getElementById('formRegister').classList.toggle('active', tab === 'register');
  // clear messages
  ['loginError','loginSuccess','registerError','registerSuccess'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('show'); el.textContent = '';
  });
}

function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
}

// ─── AUTH: Login ───
function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('loginSuccess').classList.remove('show');

  if (!email || !pass) return showMsg('loginError', 'Veuillez remplir tous les champs.', 'error');

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) return showMsg('loginError', 'Email ou mot de passe incorrect.', 'error');

  setCurrentUser(user);

  // Connexion réelle côté serveur (PHP/MySQL) — établit la session backend
  api.login({ email, password: pass }).then(res => {
    if (!res.success) console.warn('Connexion backend: ', res.error);
  });

  showMsg('loginSuccess', `Bienvenue, ${user.prenom} ! Connexion réussie.`);
  setTimeout(() => { closeModal(); updateAuthUI(); }, 1200);
}

// ─── AUTH: Register ───
function handleRegister() {
  const prenom   = document.getElementById('regPrenom').value.trim();
  const nom      = document.getElementById('regNom').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const pass     = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const terms    = document.getElementById('regTerms').checked;
  document.getElementById('registerError').classList.remove('show');

  if (!prenom || !nom || !email || !pass || !confirm)
    return showMsg('registerError', 'Veuillez remplir tous les champs obligatoires.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return showMsg('registerError', 'Adresse e-mail invalide.');
  if (pass.length < 6)
    return showMsg('registerError', 'Le mot de passe doit contenir au moins 6 caractères.');
  if (pass !== confirm)
    return showMsg('registerError', 'Les mots de passe ne correspondent pas.');
  if (!terms)
    return showMsg('registerError', 'Veuillez accepter les conditions d\'utilisation.');

  const users = getUsers();
  if (users.find(u => u.email === email))
    return showMsg('registerError', 'Un compte avec cet email existe déjà.');

  const newUser = { prenom, nom, email, phone, password: pass, createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  // Création réelle du compte côté serveur (hash du mot de passe, table users MySQL)
  api.register({ full_name: `${prenom} ${nom}`, email, password: pass, phone }).then(res => {
    if (!res.success) console.warn('Inscription backend: ', res.error);
  });

  showMsg('registerSuccess', `Compte créé avec succès ! Bienvenue, ${prenom} !`);
  setTimeout(() => { closeModal(); updateAuthUI(); }, 1400);
}

// keyboard close
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── SEARCH DATA ───

let allResults = [
  { dest:'Marrakech, Maroc', title:'Marrakech Impériale', img:'https://www.visitmorocco.com/sites/default/files/styles/thumbnail_destination_background_top5/public/thumbnails/image/koutoubia-mosque-minaret-located-at-medina-quarter-of-marrakesh-morocco-balate-dorin.jpg?itok=08hAHERp', days:8, price:'980', tags:['culture','gastronomie'], badge:'Best-seller', stars:'★★★★★', desc:'Médinas, souks colorés et palais dynastiques au cœur du Maroc.' },
  { dest:'Marrakech, Maroc', title:'Désert & Dunes de l\'Erg', img:'https://agenciaturismomarruecos.com/wp-content/uploads/2025/08/860492f3-0b51-4b6b-a770-3bf2ace3b102_the-magical-experience-of-erg-chebbi.webp', days:5, price:'650', tags:['aventure'], badge:'', stars:'★★★★☆', desc:'Nuit sous les étoiles du Sahara et bivouac berbère inoubliable.' },
  { dest:'Essaouira, Maroc', title:'Essaouira Marocaine', img:'https://media.istockphoto.com/id/1040006084/photo/view-on-old-city-of-essaouira-in-morocco.jpg?s=1024x1024&w=is&k=20&c=AbosNiny--FR0FVqW0GXJMVJ2qiaDZ3lL_9FxYr24qY=', days:4, price:'490', tags:['gastronomie','culture'], badge:'Nouveau', stars:'★★★★★', desc:'Ateliers de cuisine, marchés d\'épices et dîners en riad.' },
  { dest:'Fes, Marocaine', title:'Fes, Marocaine', img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', days:7, price:'1890', tags:['culture'], badge:'Coup de Cœur', stars:'★★★★★', desc:'Fushimi Inari, Arashiyama et cérémonie du thé traditionnelle.' },
  { dest:'Mekness, Marocaine', title:'Mekness, Marocaine', img:'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=600&q=80', days:14, price:'2890', tags:['culture','gastronomie'], badge:'', stars:'★★★★★', desc:'Traversée épique du Japon entre modernité et tradition millénaire.' },
  { dest:'Chefchaouen, Marocaine', title:'Chefchaouen, Marocaine', img:'https://images.pexels.com/photos/34362535/pexels-photo-34362535.jpeg', days:6, price:'1350', tags:['plage','gastronomie'], badge:'Romantique', stars:'★★★★★', desc:'Couchers de soleil à Oia, vins locaux et plages de lave noire.' },
  { dest:'agadir', title:'Aurores Boréales & Geysers', img:'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', days:8, price:'2050', tags:['aventure'], badge:'Hiver', stars:'★★★★★', desc:'Lumières du nord, cascades gelées et sources chaudes naturelles.' },
];

let currentFilter = 'all';
let currentSort   = 'none';
let currentDest   = '';
let searchDepart  = '';
let searchRetour  = '';

function launchSearch() {
  const destEl   = document.querySelector('.hero-search select');
  const depEl    = document.getElementById('heroDepart');
  const retEl    = document.getElementById('heroRetour');
  const travEl   = document.querySelectorAll('.hero-search select')[1];

  currentDest  = destEl  ? destEl.value  : 'Toutes destinations';
  searchDepart = depEl   ? depEl.value   : '';
  searchRetour = retEl   ? retEl.value   : '';
  const trav   = travEl  ? travEl.value  : '';

  document.getElementById('resultsDestLabel').textContent = currentDest;

  // summary line sous le titre
  const fmtLong = d => new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  const parts = [];
  if (searchDepart) parts.push('Départ : ' + fmtLong(searchDepart));
  if (searchRetour) parts.push('Retour : ' + fmtLong(searchRetour));
  if (trav) parts.push(trav);
  document.getElementById('resultsSummary').textContent = parts.join(' · ');

  // dates bar
  const bar = document.getElementById('resultsDatesBar');
  if (searchDepart || searchRetour) {
    bar.style.display = 'flex';
    document.getElementById('rdbDepart').textContent = searchDepart ? fmtLong(searchDepart) : '—';
    document.getElementById('rdbRetour').textContent = searchRetour ? fmtLong(searchRetour) : '—';
    if (searchDepart && searchRetour) {
      const nights = Math.round((new Date(searchRetour) - new Date(searchDepart)) / 86400000);
      document.getElementById('rdbNights').textContent = nights > 0 ? nights + ' nuit' + (nights > 1 ? 's' : '') : '';
    } else {
      document.getElementById('rdbNights').textContent = '';
    }
  } else {
    bar.style.display = 'none';
  }

  // reset filters
  currentFilter = 'all';
  currentSort   = 'none';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sort-pill').forEach(p => p.classList.remove('active'));
  const firstPill = document.querySelector('.filter-pill');
  if (firstPill) firstPill.classList.add('active');
  const sortNone = document.getElementById('sort-none');
  if (sortNone) sortNone.classList.add('active');

  renderResults();
  document.getElementById('resultsPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeResults() {
  document.getElementById('resultsPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function filterResults(tag, btn) {
  currentFilter = tag;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderResults();
}

function sortResults(order, btn) {
  if (order === 'asc' || order === 'desc') return; // tri par prix désactivé
  currentSort = order;
  document.querySelectorAll('.sort-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderResults();
}

function renderResults() {
  const grid = document.getElementById('resultsGrid');
  const destKey = currentDest.split(',')[0].toLowerCase();

  let filtered = allResults.filter(r => {
    const matchDest = r.dest.toLowerCase().includes(destKey) || destKey === 'toutes destinations';
    const matchTag  = currentFilter === 'all' || r.tags.includes(currentFilter);
    return matchDest && matchTag;
  });

  // sort by price
  if (currentSort === 'asc')  filtered = [...filtered].sort((a,b) => parseInt(a.price) - parseInt(b.price));
  if (currentSort === 'desc') filtered = [...filtered].sort((a,b) => parseInt(b.price) - parseInt(a.price));

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="icon">🗺</div>
      <h3>Aucun résultat trouvé</h3>
      <p>Essayez une autre destination ou un autre filtre</p>
    </div>`;
    return;
  }

  // compute nights if dates selected
  const nights = (searchDepart && searchRetour)
    ? Math.round((new Date(searchRetour) - new Date(searchDepart)) / 86400000)
    : null;

  grid.innerHTML = filtered.map((r, i) => {
    // badge prix si tri actif
    const priceBadge = currentSort !== 'none'
      ? `<span class="price-rank">${currentSort==='asc'?'💚 Meilleur prix':'💎 Premium'}</span>`
      : '';

    // afficher durée calculée si dates dispo
    const dureeStr = nights && nights > 0
      ? `${nights} nuit${nights>1?'s':''} (${r.days} jours suggérés)`
      : `${r.days} jours`;

    return `<div class="result-card" style="animation-delay:${i * 60}ms">
      <div class="result-img">
        <img src="${r.img}" alt="${r.title}">
        ${r.badge ? `<span class="result-badge">${r.badge}</span>` : ''}
        ${priceBadge}
      </div>
      <div class="result-body">
        <div class="result-dest">
          <span>${r.dest}</span>
          <span class="result-stars">${r.stars}</span>
        </div>
        <div class="result-title">${r.title}</div>
        ${nights ? `<div class="result-dates-line">📅 ${new Date(searchDepart).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} → ${new Date(searchRetour).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} · ${nights} nuit${nights>1?'s':''}</div>` : ''}
        <div class="result-info">${dureeStr} · ${r.desc}</div>
        <div class="result-tags">${r.tags.map(t=>`<span class="result-tag">${t}</span>`).join('')}</div>
        <div class="result-footer">
          <div class="result-price"><small>À partir de</small>${parseInt(r.price).toLocaleString('fr-FR')} DH</div>
          <button class="result-book" onclick="bookTrip('${r.title}')">Réserver</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function bookTrip(title) {
  const user = getCurrentUser();
  if (!user) {
    closeResults();
    openModal('login');
    setTimeout(() => {
      document.getElementById('loginError').textContent = 'Connectez-vous pour réserver "' + title + '"';
      document.getElementById('loginError').classList.add('show');
    }, 400);
  } else {
    alert(`Réservation confirmée pour "${title}" !\n\nUn conseiller vous contactera sous 24h, ${user.prenom}.`);
  }
}

// ─── PLACES MAROCAINES ───
let moroccanPlaces = [
  {
    id: 1, title: 'Marrakech la Rouge', region: 'Maroc · Villes Impériales', zone: 'Marrakech-Safi',
    cat: 'imperial', stars: '★★★★★',
    img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/9d/92/7a/caption.jpg?w=1200&h=-1&s=1&cx=1920&cy=1080&chk=v1_809ada3581f73ea031b9',
    days: 5, price: 3200, saison: 'Avr – Juin · Sep – Nov',
    desc: 'Marrakech, la "Ville Rouge", est un kaléidoscope de couleurs, d\'odeurs et de sons. Perdez-vous dans les dédales de la médina, admirez la place Jemaa el-Fna et découvrez les palais dynastiques de la cité impériale.',
    highlights: ['Jemaa el-Fna & souks', 'Jardins Majorelle', 'Palais de la Bahia', 'Hammam traditionnel', 'Cuisine marocaine authentique', 'Riad de luxe en médina'],
    medina: {
      name: 'Médina de Marrakech',
      founded: 'Fondée en 1070-1072 par les Almoravides · UNESCO depuis 1985',
      text: 'La médina de Marrakech est l\'une des plus vivantes du monde arabe. Ceinte de 19 km de remparts en pisé ocre, elle abrite plus de 3000 ruelles, la mythique place Jemaa el-Fna classée patrimoine oral de l\'humanité, la mosquée Koutoubia du XIIe siècle et un dédale de souks spécialisés (teinturiers, forgerons, cuir, épices).'
    },
    food: [
      { name: 'Tajine', desc: 'Mijoté de viande ou légumes aux épices, cuit lentement dans un plat en terre conique' },
      { name: 'Pastilla', desc: 'Feuilleté sucré-salé au pigeon ou poulet, amandes et cannelle' },
      { name: 'Méchoui', desc: 'Agneau entier rôti à la broche, spécialité des grandes occasions' },
      { name: 'Thé à la menthe', desc: 'Servi partout dans les souks, symbole de l\'hospitalité marocaine' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée, installation en riad, découverte de la place Jemaa el-Fna en soirée' },
      { day: 'Jour 2', desc: 'Visite des souks, tanneries de la médina et Palais de la Bahia' },
      { day: 'Jour 3', desc: 'Jardins Majorelle, musée Yves Saint Laurent, Koutoubia' },
      { day: 'Jour 4', desc: 'Excursion vallée de l\'Ourika et Atlas, déjeuner berbère' },
      { day: 'Jour 5', desc: 'Matinée libre, shopping en médina, retour' },
    ],
    includes: ['Riad 5★ en médina', 'Transferts aéroport', 'Petit-déjeuner inclus', 'Guide privé', 'Hammam & Spa', 'Dîner traditionnel']
  },
  {
    id: 2, title: 'Fès l\'Éternelle', region: 'Maroc · Villes Impériales', zone: 'Fès-Meknès',
    cat: 'imperial', stars: '★★★★★',
    img: 'https://chicmorocco.com/wp-content/uploads/2025/07/Fez-ciudad.jpg',
    days: 4, price: 2600, saison: 'Mar – Mai · Oct – Nov',
    desc: 'Fès abrite la plus grande médina médiévale du monde, classée UNESCO. La ville est un voyage dans le temps, entre artisans, medersa et mosquées millénaires qui ont préservé leur âme pendant plus de 1200 ans.',
    highlights: ['Médina Al-Qarawiyyin', 'Tanneries Chouara', 'Medersa Bou Inania', 'Artisanat traditionnel', 'Dar Batha museum', 'Architecture andalouse'],
    medina: {
      name: 'Médina de Fès el-Bali',
      founded: 'Fondée en 789 par Idris Ier · UNESCO depuis 1981',
      text: 'La plus grande zone piétonne du monde et la médina médiévale la mieux conservée. On y trouve l\'université Al Qarawiyyin (859), la plus ancienne université encore en activité au monde, les tanneries Chouara vieilles de 1000 ans, et un labyrinthe de 9400 ruelles où artisans et souks perpétuent des savoir-faire millénaires.'
    },
    food: [
      { name: 'Pastilla au pigeon', desc: 'La version originelle et la plus raffinée du Maroc, spécialité fassie' },
      { name: 'Seffa', desc: 'Semoule fine sucrée à la cannelle et amandes, souvent servie aux mariages' },
      { name: 'Harira fassie', desc: 'Soupe traditionnelle enrichie de vermicelles et d\'épices' },
      { name: 'Cornes de gazelle', desc: 'Pâtisserie aux amandes, emblème sucré de la ville' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée à Fès, visite de Fès el-Jdid et soirée en riad' },
      { day: 'Jour 2', desc: 'Tanneries Chouara, souks de l\'artisanat, Medersa Bou Inania' },
      { day: 'Jour 3', desc: 'Excursion Meknès & Volubilis (site romain)' },
      { day: 'Jour 4', desc: 'Musée Dar Batha, cours de cuisine marocaine, départ' },
    ],
    includes: ['Riad traditionnel 4★', 'Transferts', 'Petit-déjeuner', 'Guide expert', 'Cours de cuisine', 'Entrées sites']
  },
  {
    id: 3, title: 'Désert de l\'Erg Chebbi', region: 'Maroc · Sud & Désert', zone: 'Drâa-Tafilalet',
    cat: 'sud', stars: '★★★★★',
    img: 'https://images.pexels.com/photos/26689361/pexels-photo-26689361.jpeg',
    days: 3, price: 1900, saison: 'Oct – Avr',
    desc: 'Les dunes de l\'Erg Chebbi culminent à 150 mètres. Une nuit sous les étoiles du Sahara marocain est une expérience qui transforme le voyageur. Silence absolu, coucher de soleil doré et bivouac berbère inoubliable.',
    highlights: ['Dunes de 150m de hauteur', 'Nuit en camp de luxe', 'Balade en dromadaire', 'Coucher de soleil doré', 'Musique gnawa au feu', 'Ciel étoilé exceptionnel'],
    medina: {
      name: 'Ksar de Rissani',
      founded: 'Ancienne capitale du royaume de Sijilmassa, VIIIe siècle',
      text: 'Aux portes du désert, le ksar (village fortifié) de Rissani fut le berceau de la dynastie alaouite et un carrefour caravanier majeur entre l\'Afrique subsaharienne et le Maghreb. Ses greniers en pisé et ses ruelles voûtées rappellent l\'âge d\'or du commerce transsaharien de l\'or et du sel.'
    },
    food: [
      { name: 'Méchoui berbère', desc: 'Agneau cuit dans un four en terre enterré, tendre et fumé' },
      { name: 'Madfouna', desc: 'Le "pain farci" de Rissani, garni de viande et d\'épices' },
      { name: 'Dattes du Tafilalet', desc: 'Parmi les meilleures du Maroc, récoltées dans les palmeraies voisines' },
      { name: 'Thé au désert', desc: 'Préparé et savouré au coucher de soleil sur les dunes' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Départ de Marrakech, traversée des gorges du Dadès, arrivée Merzouga' },
      { day: 'Jour 2', desc: 'Lever de soleil, balade en dromadaire, repos au camp, coucher de soleil magique' },
      { day: 'Jour 3', desc: 'Aube dans les dunes, village berbère, retour via Ouarzazate' },
    ],
    includes: ['Camp de luxe en dunes', 'Transport 4x4', 'Pension complète', 'Guide berbère', 'Dromadaire', 'Soirée musicale']
  },
  {
    id: 4, title: 'Chefchaouen la Bleue', region: 'Maroc · Nord', zone: 'Tanger-Tétouan-Al Hoceïma',
    cat: 'nord', badge: 'Photo ★★★★★', stars: '★★★★★',
    img: 'https://images.pexels.com/photos/37852966/pexels-photo-37852966.jpeg',
    days: 3, price: 1750, saison: 'Avr – Juin · Sep – Oct',
    desc: 'Chefchaouen, la "Ville Bleue" du Rif, est sans doute la destination la plus photogénique du Maroc. Ses ruelles peintes en nuances d\'indigo et d\'azur offrent un spectacle unique au monde, enchâssé dans les montagnes du Rif.',
    highlights: ['Médina bleue unique au monde', 'Place Outa el-Hammam', 'Cascades d\'Akchour', 'Marché local du Rif', 'Kasbah du 15ème siècle', 'Randonnée en montagne'],
    medina: {
      name: 'Médina Bleue de Chefchaouen',
      founded: 'Fondée en 1471 par Moulay Ali Ben Rachid',
      text: 'Nichée dans les montagnes du Rif, cette médina fut fondée comme forteresse contre les invasions portugaises. Le bleu qui recouvre ses murs, introduit au XXe siècle, symboliserait le ciel et le sacré. Ruelles pavées, portes cloutées et placettes fleuries en font la médina la plus photographiée du Maroc.'
    },
    food: [
      { name: 'Fromage de chèvre du Rif', desc: 'Produit localement, servi frais avec du miel de montagne' },
      { name: 'Bissara', desc: 'Soupe de fèves épaisse, arrosée d\'huile d\'olive et de cumin' },
      { name: 'Tagine aux figues', desc: 'Alliance sucrée-salée typique des montagnes du Rif' },
      { name: 'Ghoriba', desc: 'Biscuits aux amandes ou à la semoule, parfaits avec un thé' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée, balade dans la médina bleue, coucher de soleil sur la place centrale' },
      { day: 'Jour 2', desc: 'Excursion cascades d\'Akchour, pique-nique en nature' },
      { day: 'Jour 3', desc: 'Visite kasbah, souks artisanaux, départ' },
    ],
    includes: ['Riad en médina bleue', 'Transferts', 'Petit-déjeuner', 'Guide local', 'Excursion cascades', 'Entrées monuments']
  },
  {
    id: 5, title: 'Essaouira, Cité des Vents', region: 'Maroc · Côte Atlantique', zone: 'Marrakech-Safi',
    cat: 'cote', stars: '★★★★☆',
    img: 'https://images.pexels.com/photos/11095599/pexels-photo-11095599.jpeg',
    days: 3, price: 1600, saison: 'Avr – Oct',
    desc: 'Essaouira est une cité côtière magique où les remparts du 18ème siècle se jettent dans l\'Atlantique. Port de pêche, médina blanche et bleue, vent constant et ambiance bohème font de cette ville une escale inoubliable.',
    highlights: ['Remparts atlantiques', 'Port de pêche animé', 'Médina UNESCO', 'Plage de 5km', 'Kitesurf & windsurf', 'Artisanat du thuya'],
    medina: {
      name: 'Médina d\'Essaouira (Mogador)',
      founded: 'Remparts construits en 1764 sur plan de l\'architecte Théodore Cornut · UNESCO depuis 2001',
      text: 'Ancien comptoir portugais puis port royal sous le sultan Mohammed III, la médina d\'Essaouira mêle urbanisme européen du XVIIIe siècle et tradition marocaine. Ses remparts (Skala) surplombant l\'Atlantique, ses ruelles blanches aux volets bleus et ses ateliers de marqueterie en bois de thuya en font un joyau unique sur la côte.'
    },
    food: [
      { name: 'Sardines grillées', desc: 'Fraîchement pêchées et grillées sur le port, spécialité incontournable' },
      { name: 'Pastilla aux fruits de mer', desc: 'Version côtière du plat traditionnel, au poisson et crevettes' },
      { name: 'Poisson du jour', desc: 'Choisi directement au port et cuisiné à la chermoula' },
      { name: 'Amlou', desc: 'Pâte d\'amandes, argan et miel, à tartiner au petit-déjeuner' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée, visite des remparts, coucher de soleil sur l\'Atlantique' },
      { day: 'Jour 2', desc: 'Port de pêche, médina, déjeuner de poissons frais, plage' },
      { day: 'Jour 3', desc: 'Artisans du thuya, marché berbère du jeudi, départ' },
    ],
    includes: ['Hôtel bord de mer', 'Transferts', 'Petit-déjeuner', 'Guide', 'Dégustation poissons', 'Visite atelier thuya']
  },
  {
    id: 6, title: 'Gorges du Dadès & Todra', region: 'Maroc · Sud & Désert', zone: 'Drâa-Tafilalet',
    cat: 'sud', badge: 'Aventure', stars: '★★★★★',
    img: 'https://images.pexels.com/photos/33530297/pexels-photo-33530297.jpeg',
    days: 4, price: 2200, saison: 'Mar – Mai · Sep – Nov',
    desc: 'La "Route des Mille Kasbahs" traverse des paysages époustouflants. Les gorges du Todra avec leurs falaises à 300 mètres de hauteur et les méandres du Dadès sont parmi les plus beaux spectacles naturels d\'Afrique.',
    highlights: ['Gorges du Todra 300m', 'Kasbah Aït Benhaddou', 'Vallée des Roses', 'Route des Mille Kasbahs', 'Villages berbères', 'Randonnée encaissée'],
    medina: {
      name: 'Kasbah Aït Benhaddou',
      founded: 'Ksar fortifié du XVIIe siècle · UNESCO depuis 1987',
      text: 'Ce village fortifié en pisé, ancienne halte caravanière sur la route reliant le Sahara à Marrakech, est l\'un des exemples les mieux préservés d\'architecture terre du sud marocain. Ses maisons en terracotta empilées à flanc de colline ont servi de décor à de nombreux films internationaux.'
    },
    food: [
      { name: 'Tagine aux pruneaux', desc: 'Viande mijotée aux pruneaux, amandes et cannelle, spécialité du Sud' },
      { name: 'Berkoukes', desc: 'Semoule roulée en grosses billes, cuisinée en soupe berbère' },
      { name: 'Amlou', desc: 'Pâte d\'argan, amandes et miel, produite dans les vallées voisines' },
      { name: 'Pain berbère', desc: 'Cuit au feu de bois dans un four traditionnel en terre' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Départ de Marrakech, Kasbah Aït Benhaddou (UNESCO), nuit à Ouarzazate' },
      { day: 'Jour 2', desc: 'Vallée du Dadès, gorges serpentines, village de roses' },
      { day: 'Jour 3', desc: 'Gorges du Todra, randonnée entre les falaises, nuit berbère' },
      { day: 'Jour 4', desc: 'Retour panoramique, visite studio de cinéma d\'Ouarzazate' },
    ],
    includes: ['Hôtels de charme', 'Transport 4x4', 'Demi-pension', 'Guide de randonnée', 'Entrées kasbahs', 'Bivouac nuit 3']
  },
  {
    id: 7, title: 'Agadir & Souss-Massa', region: 'Maroc · Côte Atlantique', zone: 'Souss-Massa',
    cat: 'cote',  stars: '★★★★☆',
    img: 'https://media.istockphoto.com/id/2246421208/photo/i-love-agadir-sign-with-the-agadir-oufella-casbah-in-the-background.jpg?s=1024x1024&w=is&k=20&c=8Ho5K0Xr1n51LIN1dA-lHCdcMR4B8Wirt7uEs2exfyQ=',
    days: 7, price: 4800, saison: 'Toute l\'année',
    desc: 'Agadir bénéficie de 300 jours de soleil par an. Station balnéaire moderne avec une longue plage dorée, la ville est aussi la porte d\'entrée du Souss : arganiers, réserve naturelle et berbères Chleuhs.',
    highlights: ['Plage 10km de sable fin', 'Réserve Souss-Massa', 'Forêt d\'arganiers', 'Tiznit & bijoux amazighs', 'Surf & sports nautiques', 'Spa & thalasso'],
    medina: {
      name: 'Kasbah Agadir Oufella',
      founded: 'Forteresse du XVIe siècle, reconstruite après le séisme de 1960',
      text: 'Perchée sur la colline dominant la baie, la kasbah historique fut en grande partie détruite par le tremblement de terre de 1960. Ses vestiges de remparts offrent aujourd\'hui une vue panoramique sur la ville moderne, la marina et l\'océan, et rappellent l\'histoire mouvementée de la cité.'
    },
    food: [
      { name: 'Tajine à l\'huile d\'argan', desc: 'Spécialité régionale utilisant l\'or liquide du Souss' },
      { name: 'Poisson grillé du port', desc: 'Sardines et poissons frais servis directement sur les quais' },
      { name: 'Tanjia', desc: 'Viande confite lentement, plat convivial du Sud marocain' },
      { name: 'Amlou d\'argan', desc: 'Pâte artisanale produite par les coopératives féminines de la région' }
    ],
    program: [
      { day: 'J1-2', desc: 'Arrivée, installation, plage et découverte du front de mer' },
      { day: 'J3', desc: 'Réserve naturelle Souss-Massa, observation flamants roses' },
      { day: 'J4', desc: 'Excursion Tiznit, coopérative d\'argan, bijouterie amazigh' },
      { day: 'J5-6', desc: 'Plage, sports nautiques, soirée à la marina' },
      { day: 'J7', desc: 'Spa matinée, départ' },
    ],
    includes: ['Hôtel 5★ bord de plage', 'Vol A/R inclus', 'All-inclusive', 'Excursions', 'Spa & hammam', 'Activités sportives']
  },
  {
    id: 8, title: 'Meknès & Volubilis', region: 'Maroc · Villes Impériales', zone: 'Fès-Meknès',
    cat: 'imperial', stars: '★★★★☆',
    img: 'https://images.pexels.com/photos/30149254/pexels-photo-30149254.jpeg',
    days: 2, price: 1200, saison: 'Mar – Nov',
    desc: 'Meknès, quatrième ville impériale du Maroc, est souvent éclipsée par ses voisines mais enchante tous ceux qui s\'y arrêtent. À 30km, les ruines romaines de Volubilis comptent parmi les mieux conservées d\'Afrique du Nord.',
    highlights: ['Bab Mansour (porte monumentale)', 'Mausolée Moulay Ismail', 'Heri es-Souani (greniers royaux)', 'Volubilis (ruines romaines)', 'Médina tranquille', 'Vins de Meknès'],
    medina: {
      name: 'Médina de Meknès',
      founded: 'Fondée au XIe siècle · Apogée sous Moulay Ismaïl au XVIIe siècle · UNESCO depuis 1996',
      text: 'Quatrième ville impériale, Meknès devint la capitale somptueuse du sultan Moulay Ismaïl, qui y fit construire des kilomètres de remparts et la monumentale porte Bab Mansour. Plus paisible que ses voisines, sa médina conserve un artisanat authentique et une atmosphère préservée du tourisme de masse.'
    },
    food: [
      { name: 'Olives de Meknès', desc: 'La région est la première productrice d\'olives du Maroc' },
      { name: 'Vin de Meknès', desc: 'Terroir viticole historique, hérité de l\'époque du protectorat' },
      { name: 'Rfissa', desc: 'Plat mijoté au poulet, lentilles et msemen effiloché' },
      { name: 'Brochettes grillées', desc: 'Servies dans les gargotes animées de la place el-Hedim' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée, Bab Mansour, médina, mausolée, coucher de soleil sur les remparts' },
      { day: 'Jour 2', desc: 'Matin Volubilis (mosaïques romaines), déjeuner typique, retour' },
    ],
    includes: ['Riad 4★', 'Transferts', 'Petit-déjeuner', 'Guide historien', 'Entrée Volubilis', 'Dégustation vins']
  },
  {
    id: 9, title: 'Vallée du Drâa', region: 'Maroc · Sud & Désert', zone: 'Drâa-Tafilalet',
    cat: 'sud', stars: '★★★★★',
    img: 'https://images.pexels.com/photos/3581916/pexels-photo-3581916.jpeg',
    days: 4, price: 2400, saison: 'Oct – Avr',
    desc: 'Le Drâa est le plus long fleuve du Maroc. Sa vallée, bordée de 2 millions de palmiers et ponctuée de kasbahs en pisé rouge, offre un voyage hors du temps entre Agdz et Zagora, aux portes du Sahara.',
    highlights: ['Palmeraie de 2 millions de dattiers', 'Kasbahs en terre rouge', 'Village de Tamegroute', 'Bibliothèque manuscrits anciens', 'Bivouac en palmeraie', 'Artisanat zellige'],
    medina: {
      name: 'Ksar de Tamnougalt',
      founded: 'Ancienne capitale de la vallée, résidence des caïds Mezouari',
      text: 'Ce ksar fortifié fut pendant des siècles le siège du pouvoir local et une étape clé des caravanes reliant Tombouctou à Marrakech. Ses greniers collectifs, sa mosquée et ses maisons en pisé décorées de motifs géométriques témoignent du raffinement de l\'architecture berbère du Drâa.'
    },
    food: [
      { name: 'Dattes de Zagora', desc: 'Réputées parmi les meilleures du royaume, récoltées en palmeraie' },
      { name: 'Tagine aux dattes', desc: 'Association sucrée-salée typique de la vallée du Drâa' },
      { name: 'Couscous berbère', desc: 'Préparé le vendredi, garni de sept légumes' },
      { name: 'Thé à la palmeraie', desc: 'Dégusté à l\'ombre des dattiers au coucher du soleil' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Départ Ouarzazate, col du Tizi n\'Tinifift, arrivée Agdz' },
      { day: 'Jour 2', desc: 'Balade à vélo en palmeraie, kasbahs berbères, Tamnougalt' },
      { day: 'Jour 3', desc: 'Tamegroute, bibliothèque islamique, poteries vertes uniques' },
      { day: 'Jour 4', desc: 'Zagora, désert M\'Hamid, retour' },
    ],
    includes: ['Maison d\'hôtes de charme', '4x4 + chauffeur', 'Pension complète', 'Guide local', 'Vélos', 'Bivouac palmier']
  },
  {
    id: 10, title: 'Tanger & Cap Spartel', region: 'Maroc · Nord', zone: 'Tanger-Tétouan',
    cat: 'nord', stars: '★★★★☆',
    img: 'https://images.pexels.com/photos/15767314/pexels-photo-15767314.jpeg',
    days: 3, price: 1850, saison: 'Avr – Oct',
    desc: 'Tanger est une ville de passage, de rencontres et de mystères. Carrefour de deux mers, deux continents et deux cultures, elle a inspiré Matisse, Delacroix et Burroughs. Le Cap Spartel marque la jonction entre Atlantique et Méditerranée.',
    highlights: ['Cap Spartel & Grottes d\'Hercule', 'Médina historique', 'Kasbah & musée du Détroit', 'Détroit de Gibraltar', 'Quartier des Artistes', 'Cuisine de la mer'],
    medina: {
      name: 'Médina & Kasbah de Tanger',
      founded: 'Ville antique, kasbah reconstruite au XVIIe siècle',
      text: 'Carrefour millénaire entre Afrique, Europe et Méditerranée, la médina de Tanger surplombe le détroit de Gibraltar depuis la kasbah. Le Petit Socco, ancien centre nerveux des espions et artistes internationaux (Matisse, Bowles, Burroughs), garde encore son atmosphère cosmopolite unique.'
    },
    food: [
      { name: 'Fruits de mer', desc: 'Poissons et crustacés frais pêchés dans le détroit de Gibraltar' },
      { name: 'Poisson à la chermoula', desc: 'Mariné aux épices et herbes, grillé ou en tagine' },
      { name: 'Pastilla au poisson', desc: 'Variante tangéroise du feuilleté traditionnel' },
      { name: 'Thé à la menthe tangérois', desc: 'Servi dans les cafés historiques du Petit Socco' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée, médina, kasbah, vue sur le détroit de Gibraltar' },
      { day: 'Jour 2', desc: 'Cap Spartel, Grottes d\'Hercule, déjeuner fruits de mer' },
      { day: 'Jour 3', desc: 'Marché du Grand Socco, palais du Mendoubia, départ' },
    ],
    includes: ['Hôtel vue mer', 'Transferts', 'Petit-déjeuner', 'Guide', 'Entrée grottes', 'Croisière détroit']
  },
  {
    id: 11, title: 'Ouarzazate, Hollywood d\'Afrique', region: 'Maroc · Sud & Désert', zone: 'Drâa-Tafilalet',
    cat: 'sud', badge: 'Cinéma & Désert', stars: '★★★★☆',
    img: 'https://images.pexels.com/photos/3878114/pexels-photo-3878114.jpeg',
    days: 3, price: 1700, saison: 'Sep – Mai',
    desc: 'Ouarzazate a servi de décor à Game of Thrones, Gladiator et Lawrence d\'Arabie. La ville est la capitale du cinéma africain, entourée de kasbahs millénaires, de paysages lunaires et des portes du Grand Erg.',
    highlights: ['Studios de cinéma Atlas', 'Kasbah Aït Benhaddou (UNESCO)', 'Kasbah Taourirt', 'Lac Draa turquoise', 'Paysages de films', 'Marché berbère'],
    medina: {
      name: 'Kasbah Taourirt',
      founded: 'XIXe siècle, ancienne résidence des puissants pachas Glaoui',
      text: 'Ce vaste ensemble en pisé fut la résidence des Glaoui, seigneurs féodaux qui contrôlaient les routes commerciales du Sud marocain. Ses centaines de pièces décorées de zellige et de plafonds peints témoignent du faste de cette dynastie locale, avant de devenir le décor de nombreux tournages internationaux.'
    },
    food: [
      { name: 'Tagine berbère', desc: 'Mijoté aux légumes de saison et viande locale' },
      { name: 'Couscous du Sud', desc: 'Servi traditionnellement le vendredi en famille' },
      { name: 'Dattes', desc: 'Produites dans les oasis proches, entre désert et Atlas' },
      { name: 'Amlou', desc: 'Pâte d\'argan et d\'amandes, spécialité des femmes berbères' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Studios Atlas, kasbah Taourirt, visite du plateau de tournage' },
      { day: 'Jour 2', desc: 'Aït Benhaddou (UNESCO), randonnée, nuit en kasbah' },
      { day: 'Jour 3', desc: 'Lac de Draa, retour Marrakech par l\'Tizi n\'Tichka' },
    ],
    includes: ['Kasbah-hôtel', 'Transferts', 'Demi-pension', 'Guide cinéma', 'Entrée studios', 'Kasbah Benhaddou']
  },
  {
    id: 12, title: 'Rabat, Capitale Royale', region: 'Maroc · Villes Impériales', zone: 'Rabat-Salé',
    cat: 'imperial', badge: 'Patrimoine UNESCO', stars: '★★★★☆',
    img: 'https://media.istockphoto.com/id/2149359391/photo/rabat-morocco-hassan-tower.jpg?s=1024x1024&w=is&k=20&c=l2Hu1fpFUxt06CIXEU5RHdJWTyyaOxIYa4M2kwUVRWM=',
    days: 3, price: 1500, saison: 'Toute l\'année',
    desc: 'Rabat, capitale administrative du Maroc, est aussi une ville impériale classée UNESCO. La Tour Hassan, le mausolée Mohammed V et la Kasbah des Oudayas sur l\'embouchure du Bou Regreg en font une capitale d\'une rare élégance.',
    highlights: ['Tour Hassan & Mausolée Mohammed V', 'Kasbah des Oudayas', 'Chellah (nécropole romaine)', 'Musée Mohammed VI', 'Bord de mer Sablé', 'Architecture hispano-mauresque'],
    medina: {
      name: 'Médina de Rabat & Kasbah des Oudayas',
      founded: 'Kasbah almohade du XIIe siècle · Médina classée UNESCO en 2012',
      text: 'À l\'embouchure du Bou Regreg, la Kasbah des Oudayas domine l\'océan avec ses remparts almohades et ses ruelles bleu et blanc héritées des réfugiés andalous du XVIIe siècle. La médina voisine, plus discrète que celle de Marrakech ou Fès, offre une architecture hispano-mauresque raffinée et un rythme de vie plus posé.'
    },
    food: [
      { name: 'Cuisine Rbatie raffinée', desc: 'Héritière du raffinement andalou, moins épicée que la cuisine du Sud' },
      { name: 'Pastilla au lait', desc: 'Dessert délicat à base de crème pâtissière et de feuilles de brick' },
      { name: 'Poisson de l\'Atlantique', desc: 'Fraîchement pêché, servi grillé ou en tagine' },
      { name: 'Thé à la menthe royal', desc: 'Servi selon un cérémonial hérité de la cour royale' }
    ],
    program: [
      { day: 'Jour 1', desc: 'Arrivée, Tour Hassan, Mausolée royal, kasbah des Oudayas au coucher de soleil' },
      { day: 'Jour 2', desc: 'Chellah, musée Mohammed VI d\'art moderne, médina' },
      { day: 'Jour 3', desc: 'Promenade bord de mer, marché central, départ' },
    ],
    includes: ['Hôtel boutique centre', 'Transferts', 'Petit-déjeuner', 'Guide patrimoine', 'Entrées musées', 'Déjeuner traditionnel']
  },
];

let activePkgFilter = 'all';
let currentPlace = null;

function filterPkg(cat, btn) {
  activePkgFilter = cat;
  document.querySelectorAll('.pkg-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPkgGrid();
}

function renderPkgGrid() {
  const grid = document.getElementById('pkgGrid');
  const filtered = activePkgFilter === 'all'
    ? moroccanPlaces
    : moroccanPlaces.filter(p => p.cat === activePkgFilter);

  grid.innerHTML = filtered.map((p, i) => `
    <div class="pkg-card" style="animation-delay:${i*55}ms" onclick="openPlaceModal(${p.id})">
      <div class="pkg-img">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        ${p.badge ? `<span class="pkg-badge">${p.badge}</span>` : ''}
      </div>
      <div class="pkg-body">
        <div class="pkg-meta">
          <span>${p.days} Jours</span>
          <span class="pkg-stars">${p.stars}</span>
        </div>
        <div class="pkg-title">${p.title}</div>
        <p class="pkg-desc">${p.desc.substring(0,90)}…</p>
        <div class="pkg-footer">
          <div class="pkg-price"><small>À partir de</small>${p.price.toLocaleString('fr-MA')} DH</div>
          <button class="pkg-btn">Découvrir</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── PLACE DETAIL MODAL ───
function openPlaceModal(id) {
  const p = moroccanPlaces.find(x => x.id === id);
  if (!p) return;
  currentPlace = p;

  document.getElementById('pmImg').src = p.img;
  document.getElementById('pmRegion').textContent = p.region;
  document.getElementById('pmTitle').textContent = p.title;
  document.getElementById('pmStars').textContent = p.stars;
  document.getElementById('pmBadge').textContent = p.badge;
  document.getElementById('pmBadge').style.display = p.badge ? '' : 'none';
  document.getElementById('pmDays').textContent = p.days + ' jours';
  document.getElementById('pmPrice').textContent = p.price.toLocaleString('fr-MA') + ' DH';
  document.getElementById('pmZone').textContent = p.zone;
  document.getElementById('pmSaison').textContent = p.saison;
  document.getElementById('pmDesc').textContent = p.desc;
  document.getElementById('pmPriceBig').textContent = p.price.toLocaleString('fr-MA') + ' DH';

  document.getElementById('pmHighlights').innerHTML =
    p.highlights.map(h => `<li>${h}</li>`).join('');

  const medinaSection = document.getElementById('pmMedinaSection');
  if (p.medina) {
    document.getElementById('pmMedinaName').textContent = p.medina.name;
    document.getElementById('pmMedinaFounded').textContent = p.medina.founded;
    document.getElementById('pmMedinaText').textContent = p.medina.text;
    medinaSection.style.display = '';
  } else {
    medinaSection.style.display = 'none';
  }

  const foodSection = document.getElementById('pmFoodSection');
  if (p.food && p.food.length) {
    document.getElementById('pmFoodGrid').innerHTML = p.food.map(f => `
      <div class="pm-food-item">
        <div class="pm-food-name">${f.name}</div>
        <p>${f.desc}</p>
      </div>`).join('');
    foodSection.style.display = '';
  } else {
    foodSection.style.display = 'none';
  }

  document.getElementById('pmProgram').innerHTML =
    p.program.map(d => `
      <div class="pm-day">
        <span class="pm-day-num">${d.day}</span>
        <span>${d.desc}</span>
      </div>`).join('');

  document.getElementById('pmIncludes').innerHTML =
    p.includes.map(inc => `<span class="pm-include-tag">✓ ${inc}</span>`).join('');

  document.getElementById('placeModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlaceModal() {
  document.getElementById('placeModal').classList.remove('open');
  document.body.style.overflow = '';
}
function closePlaceModalOnBg(e) {
  if (e.target === document.getElementById('placeModal')) closePlaceModal();
}
function bookFromModal() {
  const user = getCurrentUser();
  if (!user) {
    closePlaceModal();
    openModal('login');
    setTimeout(() => {
      document.getElementById('loginError').textContent = 'Connectez-vous pour réserver "' + (currentPlace?.title || '') + '"';
      document.getElementById('loginError').classList.add('show');
    }, 400);
  } else {
    alert(`Demande de réservation envoyée pour\n"${currentPlace.title}"\n\nUn conseiller vous contactera sous 24h, ${user.prenom} !`);
    closePlaceModal();
  }
}

// init grid
renderPkgGrid();

// ─── TRIP PLANNER ───
const plannerDests = [
  { id:'marrakech', label:'🔴 Marrakech', days:2 },
  { id:'fes', label:'🕌 Fès', days:2 },
  { id:'chefchaouen', label:'🔵 Chefchaouen', days:2 },
  { id:'merzouga', label:'🏜 Désert Merzouga', days:2 },
  { id:'essaouira', label:'🌊 Essaouira', days:2 },
  { id:'ouarzazate', label:'🎬 Ouarzazate', days:1 },
  { id:'agadir', label:'🏖 Agadir', days:3 },
  { id:'rabat', label:'🏛 Rabat', days:2 },
  { id:'tanger', label:'⚓ Tanger', days:2 },
  { id:'ifrane', label:'⛰ Ifrane', days:1 },
  { id:'dakhla', label:'🪁 Dakhla', days:3 },
  { id:'toubkal', label:'🏔 Toubkal', days:3 },
  { id:'dades', label:'🦅 Gorges Dadès', days:2 },
  { id:'draa', label:'🌴 Vallée Drâa', days:2 },
  { id:'asilah', label:'🎨 Asilah', days:2 },
];
// Budget: hébergement + transport + repas + activités (DH/pers/nuit)
const budgetPerDay = { eco: 480, confort: 1200, luxe: 3500 };
const budgetLabels = { eco: 'Économique', confort: 'Confort', luxe: 'Luxe' };
const budgetDetails = {
  eco:    { hotel: 200, transport: 80,  repas: 120, activites: 80  },
  confort:{ hotel: 600, transport: 250, repas: 200, activites: 150 },
  luxe:   { hotel:1800, transport: 800, repas: 500, activites: 400 },
};

let planState = { selectedDests: [], depart: '', retour: '', voyageurs: 2, type: '', budget: '' };

function buildDestChips() {
  const grid = document.getElementById('stepDestGrid');
  if (!grid) return;

  // Insert counter above grid
  const parent = grid.parentElement;
  if (!document.getElementById('destCounter')) {
    const counter = document.createElement('div');
    counter.id = 'destCounter';
    counter.style.cssText = 'font-family:Syne,sans-serif;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--terracotta);margin-bottom:.8rem;padding:.5rem .9rem;background:rgba(200,96,58,.08);border-radius:.5rem;border:1px solid rgba(200,96,58,.2);display:inline-block';
    counter.textContent = '0 / 4 destinations sélectionnées';
    parent.insertBefore(counter, grid);
  }

  grid.innerHTML = plannerDests.map(d => `
    <button class="dest-chip" data-id="${d.id}" onclick="toggleDest('${d.id}',this)">
      <span class="chip-check">✓</span>${d.label}
    </button>`).join('');
}

function toggleDest(id, btn) {
  const idx = planState.selectedDests.indexOf(id);
  if (idx === -1) {
    if (planState.selectedDests.length >= 4) {
      const msg = document.createElement('div');
      msg.style.cssText = 'position:fixed;top:1.5rem;left:50%;transform:translateX(-50%);background:var(--terracotta);color:#fff;padding:.8rem 1.8rem;font-family:Syne,sans-serif;font-size:.75rem;font-weight:700;z-index:9999;letter-spacing:.08em;box-shadow:0 4px 20px rgba(200,96,58,.4);border-radius:2rem';
      msg.textContent = '⚠ Maximum 4 destinations sélectionnées';
      document.body.appendChild(msg);
      setTimeout(()=>msg.remove(),2500);
      return;
    }
    planState.selectedDests.push(id);
    btn.classList.add('selected');
  } else {
    planState.selectedDests.splice(idx, 1);
    btn.classList.remove('selected');
  }
  // update counter
  const ctr = document.getElementById('destCounter');
  if(ctr) {
    const n = planState.selectedDests.length;
    ctr.textContent = n + ' / 4 destination' + (n!==1?'s':'') + ' sélectionnée' + (n!==1?'s':'');
    ctr.style.color = n >= 4 ? 'var(--olive)' : 'var(--terracotta)';
  }
  updatePlanner();
}

function selectType(el, type) {
  document.querySelectorAll('.type-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  planState.type = type;
  updatePlanner();
}

function selectBudget(el, b) {
  document.querySelectorAll('.budget-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  planState.budget = b;
  updatePlanner();
}

function updatePlanner() {
  const dep = document.getElementById('planDepart');
  const ret = document.getElementById('planRetour');
  const voy = document.getElementById('planVoyageurs');
  if (dep) planState.depart = dep.value;
  if (ret) planState.retour = ret.value;
  if (voy) planState.voyageurs = parseInt(voy.value) || 2;

  const ready = planState.selectedDests.length > 0 && planState.depart && planState.retour;
  const btn = document.getElementById('generateBtn');
  if (btn) { btn.style.opacity = ready ? '1' : '.4'; btn.style.cursor = ready ? 'pointer' : 'not-allowed'; }
  if (ready) renderSummaryPreview();
}

function getDaysBetween(d1, d2) {
  return Math.max(1, Math.round((new Date(d2) - new Date(d1)) / 86400000));
}

function renderSummaryPreview() {
  const { selectedDests, depart, retour, voyageurs, type, budget } = planState;
  if (!selectedDests.length || !depart || !retour) return;

  const totalDays = getDaysBetween(depart, retour);
  const dests = selectedDests.map(id => plannerDests.find(d => d.id === id));
  const nights = Math.floor(totalDays / dests.length);
  const extra = totalDays % dests.length;

  document.getElementById('summaryEmpty').style.display = 'none';
  document.getElementById('summaryContent').style.display = 'flex';

  const fmtDate = d => new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  document.getElementById('sumTitle').textContent = dests.map(d=>d.label.replace(/[^\w\s\u00C0-\u024F]/g,'').trim()).join(' → ');
  document.getElementById('sumMeta').innerHTML = `
    <span>📅 ${totalDays} jours</span>
    <span>👥 ${voyageurs} pers.</span>
    ${type ? `<span>✨ ${type}</span>` : ''}
    ${budget ? `<span>💰 ${budgetLabels[budget]}</span>` : ''}
    <span>🗓 ${fmtDate(depart)} → ${fmtDate(retour)}</span>`;

  let cursor = new Date(depart);
  document.getElementById('sumTimeline').innerHTML = dests.map((d, i) => {
    const n = nights + (i < extra ? 1 : 0);
    const label = new Date(cursor).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
    const endDate = new Date(cursor);
    endDate.setDate(endDate.getDate() + n);
    const endLabel = endDate.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
    cursor.setDate(cursor.getDate() + n);
    return `<div class="timeline-day">
      <div class="tl-date">${label} → ${endLabel}</div>
      <div><div class="tl-dest">${d.label}</div><div class="tl-nights">${n} nuit${n>1?'s':''}</div></div>
    </div>`;
  }).join('');

  const bdg = budget || 'confort';
  const ppd = budgetPerDay[bdg];
  const det = budgetDetails[bdg];
  const totalPP = ppd * totalDays;
  const totalAll = totalPP * voyageurs;

  // Frais optionnels
  const fraisVols = bdg === 'luxe' ? 4500 : bdg === 'confort' ? 2200 : 900;
  const fraisAssurance = Math.round(totalAll * 0.04);

  // Styles inline pour les lignes avec fond clair (dark panel = white text par défaut)
  const rowLight = 'display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.08);padding:.5rem .8rem;border-radius:.4rem;margin-bottom:.3rem';
  const lblLight = 'font-family:Syne,sans-serif;font-size:.6rem;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.75)';
  const valLight = 'font-size:.95rem;font-weight:400;color:#d4a84b';

  document.getElementById('sumBudget').innerHTML = `
    <div style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#d4a84b;margin-bottom:.8rem;padding-bottom:.5rem;border-bottom:1px solid rgba(212,168,75,.25)">📊 Estimation Détaillée</div>

    <div style="${rowLight}">
      <span style="${lblLight}">🏨 Hébergement / pers. / nuit</span>
      <span style="${valLight}">${det.hotel.toLocaleString('fr-MA')} DH</span>
    </div>
    <div style="${rowLight}">
      <span style="${lblLight}">🚗 Transport / pers. / nuit</span>
      <span style="${valLight}">${det.transport.toLocaleString('fr-MA')} DH</span>
    </div>
    <div style="${rowLight}">
      <span style="${lblLight}">🍽 Repas / pers. / nuit</span>
      <span style="${valLight}">${det.repas.toLocaleString('fr-MA')} DH</span>
    </div>
    <div style="${rowLight};margin-bottom:.9rem">
      <span style="${lblLight}">🎭 Activités / pers. / nuit</span>
      <span style="${valLight}">${det.activites.toLocaleString('fr-MA')} DH</span>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
      <span style="${lblLight}">Sous-total / pers. / nuit</span>
      <span style="font-size:1rem;color:rgba(255,255,255,.85);font-weight:300">${ppd.toLocaleString('fr-MA')} DH</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
      <span style="${lblLight}">Total / pers. (${totalDays} nuits)</span>
      <span style="font-size:1rem;color:rgba(255,255,255,.85);font-weight:300">${totalPP.toLocaleString('fr-MA')} DH</span>
    </div>

    <div style="height:1px;background:rgba(212,168,75,.3);margin:.7rem 0"></div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.9rem">
      <span style="font-family:Syne,sans-serif;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#fff">💰 Total groupe (${voyageurs} pers.)</span>
      <span style="font-size:1.3rem;font-weight:600;color:#d4a84b">${totalAll.toLocaleString('fr-MA')} DH</span>
    </div>

    <div style="padding:.75rem .9rem;background:rgba(212,168,75,.08);border-radius:.5rem;border:1px dashed rgba(212,168,75,.4)">
      <div style="font-family:Syne,sans-serif;font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.45);margin-bottom:.55rem">⚡ Optionnel (non inclus)</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <span style="${lblLight}">✈ Vols A/R estimés / pers.</span>
        <span style="font-size:.9rem;color:rgba(255,255,255,.6);font-weight:300">~${fraisVols.toLocaleString('fr-MA')} DH</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="${lblLight}">🛡 Assurance voyage (~4%)</span>
        <span style="font-size:.9rem;color:rgba(255,255,255,.6);font-weight:300">~${fraisAssurance.toLocaleString('fr-MA')} DH</span>
      </div>
    </div>`;
}

function generatePlan() {
  if (!planState.selectedDests.length || !planState.depart || !planState.retour) return;
  renderSummaryPreview();
  const s = document.getElementById('plannerSummary');
  s.scrollIntoView({ behavior: 'smooth', block: 'start' });
  s.style.boxShadow = '0 0 0 3px var(--gold)';
  setTimeout(() => s.style.boxShadow = '', 1800);
}

function savePlan() {
  const user = getCurrentUser();
  if (!user) { openModal('login'); return; }
  const { selectedDests, depart, retour, voyageurs, type, budget } = planState;
  if (!selectedDests.length || !depart || !retour) return;

  const plans = getSavedPlans();
  plans.push({
    id: Date.now(),
    title: selectedDests.map(id => plannerDests.find(d=>d.id===id)?.label.replace(/[^\w\s\u00C0-\u024F]/g,'')).join(' → ').trim(),
    depart, retour, voyageurs, type, budget, dests: selectedDests,
    days: getDaysBetween(depart, retour)
  });
  localStorage.setItem('voy_plans_' + user.email, JSON.stringify(plans));
  loadSavedPlans();

  // Sauvegarde réelle du plan de voyage en base de données (table saved_plans)
  api.savePlanApi({
    title: selectedDests.map(id => plannerDests.find(d=>d.id===id)?.label).join(' → '),
    destinations: selectedDests,
    depart_date: depart,
    retour_date: retour,
    travelers: voyageurs,
    trip_type: type,
    budget_level: budget,
  }).then(res => { if (!res.success) console.warn('Plan backend: ', res.error); });

  alert('✅ Planning sauvegardé !');
}

function getSavedPlans() {
  const user = getCurrentUser();
  if (!user) return [];
  try { return JSON.parse(localStorage.getItem('voy_plans_' + user.email) || '[]'); } catch { return []; }
}

function loadSavedPlans() {
  const plans = getSavedPlans();
  const wrap = document.getElementById('savedPlansWrap');
  const list = document.getElementById('savedPlansList');
  if (!wrap || !list) return;
  if (!plans.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  list.innerHTML = plans.map(p => `
    <div class="saved-plan-card">
      <div class="spc-title">${p.title || 'Mon voyage'}</div>
      <div class="spc-meta">📅 ${p.days} jours · 👥 ${p.voyageurs} pers. · ${new Date(p.depart).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</div>
      ${p.type ? `<div style="font-size:.85rem;color:#9a8878">${p.type}${p.budget?' · '+budgetLabels[p.budget]:''}</div>` : ''}
      <div class="spc-actions">
        <button class="spc-btn" onclick="loadPlan(${p.id})">📂 Charger</button>
        <button class="spc-btn del" onclick="deletePlan(${p.id})">🗑 Supprimer</button>
      </div>
    </div>`).join('');
}

function loadPlan(id) {
  const p = getSavedPlans().find(x => x.id === id);
  if (!p) return;
  planState = { selectedDests: p.dests, depart: p.depart, retour: p.retour, voyageurs: p.voyageurs, type: p.type||'', budget: p.budget||'' };
  document.querySelectorAll('.dest-chip').forEach(c => c.classList.toggle('selected', planState.selectedDests.includes(c.dataset.id)));
  document.getElementById('planDepart').value = p.depart;
  document.getElementById('planRetour').value = p.retour;
  document.getElementById('planVoyageurs').value = p.voyageurs;
  const typeEls = document.querySelectorAll('.type-option');
  const tMap = { culture:0, aventure:1, plage:2, gastronomie:3, romantique:4, famille:5 };
  typeEls.forEach(e => e.classList.remove('selected'));
  if (p.type && tMap[p.type] !== undefined) typeEls[tMap[p.type]]?.classList.add('selected');
  const bEls = document.querySelectorAll('.budget-opt');
  bEls.forEach(e => e.classList.remove('selected'));
  const bMap = { eco:0, confort:1, luxe:2 };
  if (p.budget && bMap[p.budget] !== undefined) bEls[bMap[p.budget]]?.classList.add('selected');
  generatePlan();
  document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
}

function deletePlan(id) {
  const user = getCurrentUser();
  if (!user) return;
  const plans = getSavedPlans().filter(p => p.id !== id);
  localStorage.setItem('voy_plans_' + user.email, JSON.stringify(plans));
  loadSavedPlans();
}

function printDevis() {
  const { selectedDests, depart, retour, voyageurs, type, budget } = planState;
  if (!selectedDests.length || !depart || !retour) {
    alert('Veuillez d\'abord générer votre planning.');
    return;
  }

  const dests = selectedDests.map(id => plannerDests.find(d => d.id === id));
  const totalDays = getDaysBetween(depart, retour);
  const nights = Math.floor(totalDays / dests.length);
  const extra = totalDays % dests.length;
  const bdg = budget || 'confort';
  const ppd = budgetPerDay[bdg];
  const det = budgetDetails[bdg];
  const totalPP = ppd * totalDays;
  const totalAll = totalPP * voyageurs;
  const fraisVols = bdg === 'luxe' ? 4500 : bdg === 'confort' ? 2200 : 900;
  const fraisAssurance = Math.round(totalAll * 0.04);

  const fmtDate = d => new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  const fmtShort = d => new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  const today = new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  const devisNum = 'DEV-' + Date.now().toString().slice(-6);

  let cursor = new Date(depart);
  const timelineRows = dests.map((d, i) => {
    const n = nights + (i < extra ? 1 : 0);
    const from = new Date(cursor);
    cursor.setDate(cursor.getDate() + n);
    const to = new Date(cursor);
    return `<tr>
      <td style="padding:.6rem .8rem;border-bottom:1px solid #f0e8df">${fmtShort(from)} → ${fmtShort(to)}</td>
      <td style="padding:.6rem .8rem;border-bottom:1px solid #f0e8df;font-weight:600">${d.label}</td>
      <td style="padding:.6rem .8rem;border-bottom:1px solid #f0e8df;text-align:center">${n} nuit${n>1?'s':''}</td>
      <td style="padding:.6rem .8rem;border-bottom:1px solid #f0e8df;text-align:right">${(det.hotel*n*voyageurs).toLocaleString('fr-MA')} DH</td>
    </tr>`;
  }).join('');

  const budgetSection = `
    <tr style="background:#fdf8f0"><td colspan="3" style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4">🏨 Hébergement (${det.hotel.toLocaleString()} DH × ${totalDays}n × ${voyageurs}p)</td><td style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4;text-align:right">${(det.hotel*totalDays*voyageurs).toLocaleString('fr-MA')} DH</td></tr>
    <tr style="background:#fdf8f0"><td colspan="3" style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4">🚗 Transport (${det.transport.toLocaleString()} DH × ${totalDays}n × ${voyageurs}p)</td><td style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4;text-align:right">${(det.transport*totalDays*voyageurs).toLocaleString('fr-MA')} DH</td></tr>
    <tr style="background:#fdf8f0"><td colspan="3" style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4">🍽 Repas (${det.repas.toLocaleString()} DH × ${totalDays}n × ${voyageurs}p)</td><td style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4;text-align:right">${(det.repas*totalDays*voyageurs).toLocaleString('fr-MA')} DH</td></tr>
    <tr style="background:#fdf8f0"><td colspan="3" style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4">🎭 Activités (${det.activites.toLocaleString()} DH × ${totalDays}n × ${voyageurs}p)</td><td style="padding:.6rem .8rem;border-bottom:1px solid #e8ddd4;text-align:right">${(det.activites*totalDays*voyageurs).toLocaleString('fr-MA')} DH</td></tr>
  `;

  const win = window.open('', '_blank', 'width=860,height=1100');
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
  <meta charset="UTF-8">
  <title>Devis Voyage — VOYAGEUR Maroc — ${devisNum}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Cormorant Garamond',serif;background:#fff;color:#1a1209;padding:0}
    @page{margin:1.8cm 1.5cm}
    @media print{.no-print{display:none!important};body{padding:0}}

    .page{max-width:800px;margin:0 auto;padding:2rem}

    /* Header */
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:1.5rem;border-bottom:3px solid #c8603a;margin-bottom:1.8rem}
    .logo{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#c8603a;letter-spacing:.06em}
    .logo span{display:block;font-size:.65rem;font-weight:600;color:#7a8c5c;letter-spacing:.2em;text-transform:uppercase;margin-top:.1rem}
    .devis-info{text-align:right;font-family:'Syne',sans-serif;font-size:.75rem}
    .devis-num{font-size:1.1rem;font-weight:800;color:#c8603a;letter-spacing:.06em}

    /* Section titles */
    .sec-title{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:#c8603a;margin:1.5rem 0 .7rem;padding-bottom:.3rem;border-bottom:1px solid #e8ddd4}

    /* Info grid */
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem}
    .info-row{display:flex;flex-direction:column;gap:.15rem}
    .info-label{font-family:'Syne',sans-serif;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9a8878}
    .info-val{font-size:1rem;font-weight:600}

    /* Table */
    table{width:100%;border-collapse:collapse;font-size:.9rem}
    thead tr{background:#c8603a;color:#fff}
    thead th{padding:.7rem .8rem;text-align:left;font-family:'Syne',sans-serif;font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em}
    thead th:last-child{text-align:right}

    /* Total box */
    .total-box{background:#1a1209;color:#fff;padding:1.2rem 1.5rem;border-radius:.5rem;margin-top:1.2rem;display:flex;justify-content:space-between;align-items:center}
    .total-label{font-family:'Syne',sans-serif;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em}
    .total-val{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:#d4a84b}
    .total-sub{font-size:.8rem;color:rgba(255,255,255,.6);margin-top:.2rem}

    /* Optional */
    .optional-box{border:1.5px dashed #d4a84b;border-radius:.5rem;padding:1rem 1.2rem;margin-top:1rem;background:#fffdf7}
    .optional-title{font-family:'Syne',sans-serif;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:#7a8c5c;margin-bottom:.6rem}
    .optional-row{display:flex;justify-content:space-between;font-size:.88rem;padding:.25rem 0;border-bottom:1px dotted #e8ddd4}
    .optional-row:last-child{border-bottom:none}

    /* Footer */
    .footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #e8ddd4;display:flex;justify-content:space-between;font-size:.75rem;color:#9a8878}
    .conditions{margin-top:1.2rem;font-size:.78rem;color:#9a8878;line-height:1.6;padding:1rem;background:#fdf8f0;border-radius:.4rem;border-left:3px solid #d4a84b}
    .conditions strong{color:#1a1209;font-family:'Syne',sans-serif;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em}

    /* Print button */
    .print-btn{position:fixed;bottom:2rem;right:2rem;background:#c8603a;color:#fff;border:none;padding:.9rem 2rem;font-family:'Syne',sans-serif;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;cursor:pointer;border-radius:2rem;box-shadow:0 4px 20px rgba(200,96,58,.4)}
    .print-btn:hover{background:#d4a84b}

    .badge{display:inline-block;padding:.2rem .7rem;border-radius:2rem;font-family:'Syne',sans-serif;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-left:.5rem}
    .badge-eco{background:#e8f5e9;color:#2e7d32}
    .badge-confort{background:#fff3e0;color:#e65100}
    .badge-luxe{background:#fce4ec;color:#880e4f}
  </style>
  </head><body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <div class="logo">VOYAGEUR<span>Maroc · Voyages Sur-Mesure</span></div>
        <div style="font-size:.8rem;color:#9a8878;margin-top:.5rem">contact@voyageur.ma · +212 5 22 00 00 00</div>
        <div style="font-size:.8rem;color:#9a8878">Casablanca · Marrakech · Rabat · Agadir</div>
      </div>
      <div class="devis-info">
        <div class="devis-num">${devisNum}</div>
        <div style="margin-top:.3rem;color:#9a8878">Émis le ${today}</div>
        <div style="margin-top:.6rem">
          <span class="badge badge-${bdg}">${budgetLabels[bdg]}</span>
        </div>
      </div>
    </div>

    <!-- TITRE -->
    <div style="margin-bottom:1.5rem">
      <div style="font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:#7a8c5c">Devis de Voyage Personnalisé</div>
      <h1 style="font-size:2rem;font-weight:300;margin-top:.3rem">
        <em>Circuit ${dests.map(d=>d.label.replace(/[^\w\s\u00C0-\u024F]/g,'').trim()).join(' · ')}</em>
      </h1>
    </div>

    <!-- INFO VOYAGE -->
    <div class="sec-title">Informations du voyage</div>
    <div class="info-grid">
      <div class="info-row"><span class="info-label">📅 Date de départ</span><span class="info-val">${fmtDate(depart)}</span></div>
      <div class="info-row"><span class="info-label">🏁 Date de retour</span><span class="info-val">${fmtDate(retour)}</span></div>
      <div class="info-row"><span class="info-label">🌙 Durée</span><span class="info-val">${totalDays} nuits / ${totalDays+1} jours</span></div>
      <div class="info-row"><span class="info-label">👥 Voyageurs</span><span class="info-val">${voyageurs} personne${voyageurs>1?'s':''}</span></div>
      <div class="info-row"><span class="info-label">🗺 Destinations</span><span class="info-val">${selectedDests.length} étape${selectedDests.length>1?'s':''}</span></div>
      ${type ? `<div class="info-row"><span class="info-label">✨ Type</span><span class="info-val" style="text-transform:capitalize">${type}</span></div>` : ''}
    </div>

    <!-- ITINERAIRE -->
    <div class="sec-title">Itinéraire Détaillé</div>
    <table>
      <thead><tr>
        <th>Dates</th>
        <th>Destination</th>
        <th style="text-align:center">Nuits</th>
        <th style="text-align:right">Hébergement</th>
      </tr></thead>
      <tbody>${timelineRows}</tbody>
    </table>

    <!-- BUDGET DETAILLE -->
    <div class="sec-title">Détail du Budget</div>
    <table>
      <thead><tr>
        <th colspan="3">Poste de dépense</th>
        <th style="text-align:right">Montant Total</th>
      </tr></thead>
      <tbody>
        ${budgetSection}
        <tr style="background:#f5efe6;font-weight:700">
          <td colspan="3" style="padding:.7rem .8rem;border-top:2px solid #c8603a">Sous-total (${voyageurs} pers. × ${totalDays} nuits)</td>
          <td style="padding:.7rem .8rem;text-align:right;border-top:2px solid #c8603a;color:#c8603a;font-size:1.05rem">${totalAll.toLocaleString('fr-MA')} DH</td>
        </tr>
      </tbody>
    </table>

    <!-- TOTAL -->
    <div class="total-box">
      <div>
        <div class="total-label">Montant Total du Voyage</div>
        <div class="total-sub">${voyageurs} pers. × ${totalDays} nuits · Formule ${budgetLabels[bdg]}</div>
        <div class="total-sub" style="margin-top:.2rem">${ppd.toLocaleString('fr-MA')} DH / pers. / nuit · ${totalPP.toLocaleString('fr-MA')} DH / pers.</div>
      </div>
      <div style="text-align:right">
        <div class="total-val">${totalAll.toLocaleString('fr-MA')} DH</div>
        <div class="total-sub">≈ ${Math.round(totalAll/10).toLocaleString('fr-MA')} EUR</div>
      </div>
    </div>

    <!-- OPTIONNEL -->
    <div class="optional-box">
      <div class="optional-title">⚡ Frais Optionnels (non inclus dans le devis)</div>
      <div class="optional-row"><span>✈ Vols aller-retour (estimation)</span><span style="font-weight:600">~${fraisVols.toLocaleString('fr-MA')} DH / pers.</span></div>
      <div class="optional-row"><span>🛡 Assurance voyage multirisque</span><span style="font-weight:600">~${fraisAssurance.toLocaleString('fr-MA')} DH (groupe)</span></div>
      <div class="optional-row"><span>🪪 Visa (si requis)</span><span style="font-weight:600">Variable selon nationalité</span></div>
    </div>

    <!-- CONDITIONS -->
    <div class="conditions">
      <strong>Conditions & Notes</strong><br>
      Ce devis est établi à titre indicatif sur la base des tarifs en vigueur à la date d'émission. Les prix sont exprimés en Dirhams Marocains (MAD) et incluent la TVA applicable. Les réservations sont confirmées à réception d'un acompte de 30%. Devis valable 30 jours. Un conseiller VOYAGEUR vous recontacte sous 24h pour personnaliser votre voyage.
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div>VOYAGEUR Maroc · IATA Certifié · ⭐ 4.9/5</div>
      <div>${devisNum} · ${today}</div>
    </div>

  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨 Imprimer / Enregistrer PDF</button>
  </body></html>`);
  win.document.close();
}

function sharePlan() {
  const txt = `Mon voyage au Maroc : ${planState.selectedDests.map(id => plannerDests.find(d=>d.id===id)?.label).join(' → ')} · ${planState.depart} → ${planState.retour}`;
  navigator.clipboard?.writeText(txt).then(() => alert('📋 Planning copié !'));
}

const todayStr = new Date().toISOString().split('T')[0];
const depEl = document.getElementById('planDepart');
const retEl = document.getElementById('planRetour');
if (depEl) depEl.min = todayStr;
if (retEl) retEl.min = todayStr;

buildDestChips();
loadSavedPlans();

// ═══════════════════════════════════════════
//  DASHBOARD CLIENT — JS COMPLET
// ═══════════════════════════════════════════

// ── Helpers storage ──
function getDashUsers()   { try{return JSON.parse(localStorage.getItem('voy_users')||'[]');}catch{return[];} }
function saveDashUsers(u) { localStorage.setItem('voy_users',JSON.stringify(u)); }
function getDashUser()    { try{return JSON.parse(sessionStorage.getItem('voy_current')||'null');}catch{return null;} }
function setDashUser(u)   { sessionStorage.setItem('voy_current',JSON.stringify(u)); }

function getDashPlans() {
  const u = getDashUser(); if(!u) return [];
  try{return JSON.parse(localStorage.getItem('voy_plans_'+u.email)||'[]');}catch{return[];}
}

function getDashWishlist() {
  const u = getDashUser(); if(!u) return [];
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  return idx>=0 ? (all[idx].wishlist||[]) : [];
}
function saveDashWishlist(wl) {
  const u = getDashUser(); if(!u) return;
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  if(idx>=0){ all[idx].wishlist=wl; saveDashUsers(all); setDashUser({...u,wishlist:wl}); }
}

function getDashBookings() {
  const u = getDashUser(); if(!u) return [];
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  return idx>=0 ? (all[idx].bookings||[]) : [];
}

// ── Open / Close ──
function openDashboard() {
  const u = getDashUser();
  if(!u){ openModal('login'); return; }
  populateDashboard(u);
  document.getElementById('dashPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchDashTab('overview', document.querySelectorAll('.dash-tab')[0]);
}
function closeDashboard() {
  document.getElementById('dashPanel').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Tab switch ──
function switchDashTab(tab, btn) {
  document.querySelectorAll('.dash-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.dash-section').forEach(s=>s.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const el = document.getElementById('ds-'+tab);
  if(el) el.classList.add('active');

  if(tab==='wishlist')  renderDashWishlist();
  if(tab==='bookings')  renderDashBookings();
  if(tab==='plannings') renderDashPlannings();
  if(tab==='discover')  renderDiscoverGrid('all', document.querySelector('#discFilters .filter-pill'));
}

// ── Populate ──
function populateDashboard(u) {
  const plans    = getDashPlans();
  const wishlist = getDashWishlist();
  const bookings = getDashBookings();

  // avatar & name
  document.getElementById('dashAvatar').textContent  = u.prenom[0].toUpperCase();
  document.getElementById('dashFullname').textContent = u.prenom + ' ' + u.nom;
  document.getElementById('dashEmail').textContent    = u.email;
  const yr = u.createdAt ? new Date(u.createdAt).getFullYear() : 2026;
  document.getElementById('dashSince').textContent    = '⭐ Membre depuis ' + yr;

  // badges
  const badges = [];
  if(bookings.length>=1) badges.push('<span class="dash-badge db-gold">✈ Voyageur</span>');
  if(wishlist.length>=3) badges.push('<span class="dash-badge db-green">❤ Explorateur</span>');
  if(plans.length>=1)    badges.push('<span class="dash-badge db-blue">🗓 Planificateur</span>');
  document.getElementById('dashBadges').innerHTML = badges.join('');

  // tab counts
  document.getElementById('dtc-wish').textContent = wishlist.length;
  document.getElementById('dtc-book').textContent = bookings.length;
  document.getElementById('dtc-plan').textContent = plans.length;

  // stats
  document.getElementById('dashStats').innerHTML = `
    <div class="dash-stat"><div class="ds-icon ds-orange">🗺</div><div><div class="ds-num">${plans.length}</div><div class="ds-label">Plannings</div></div></div>
    <div class="dash-stat"><div class="ds-icon ds-red">❤</div><div><div class="ds-num">${wishlist.length}</div><div class="ds-label">Favoris</div></div></div>
    <div class="dash-stat"><div class="ds-icon ds-gold">🎫</div><div><div class="ds-num">${bookings.length}</div><div class="ds-label">Réservations</div></div></div>
    <div class="dash-stat"><div class="ds-icon ds-green">🏙</div><div><div class="ds-num" style="font-size:1rem;line-height:1.2">${u.city||u.ville||'—'}</div><div class="ds-label">Ville</div></div></div>
    <div class="dash-stat"><div class="ds-icon ds-blue">📅</div><div><div class="ds-num" style="font-size:.95rem;line-height:1.2">${yr}</div><div class="ds-label">Inscription</div></div></div>
  `;

  // activity feed
  const acts = [
    { cls:'ai-o', ico:'🗺', txt: plans.length ? 'Planning "'+plans[plans.length-1].title+'" créé' : 'Créez votre premier planning !', t:'Récemment' },
    { cls:'ai-r', ico:'❤', txt: wishlist.length ? wishlist.length+' destination(s) dans vos favoris' : 'Ajoutez des destinations favorites', t:'Il y a 2 jours' },
    { cls:'ai-g', ico:'🎫', txt: bookings.length ? bookings.length+' réservation(s) active(s)' : 'Aucune réservation pour le moment', t:'Il y a 5 jours' },
    { cls:'ai-b', ico:'👤', txt: 'Compte créé le '+new Date(u.createdAt||Date.now()).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}), t:"Lors de l'inscription" },
  ];
  document.getElementById('dashActivity').innerHTML = acts.map(a=>`
    <div class="act-item">
      <div class="act-icon ${a.cls}">${a.ico}</div>
      <div><div class="act-text">${a.txt}</div><div class="act-time">${a.t}</div></div>
    </div>`).join('');

  // reco strip (first 6 moroccan places)
  if(typeof moroccanPlaces !== 'undefined') {
    document.getElementById('dashRecoStrip').innerHTML = moroccanPlaces.slice(0,6).map(p=>`
      <div class="reco-chip" onclick="closeDashboard();setTimeout(()=>openPlaceModal(${p.id}),300)">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="reco-lbl">${p.title}</div>
      </div>`).join('');
  }

  // settings fields
  document.getElementById('setPrenom').value = u.prenom||'';
  document.getElementById('setNom').value    = u.nom||'';
  document.getElementById('setEmail').value  = u.email||'';
  document.getElementById('setPhone').value  = u.phone||'';
  if(document.getElementById('setVille')) document.getElementById('setVille').value = u.city||u.ville||'';
  if(u.birth && document.getElementById('setBirth')) document.getElementById('setBirth').value = u.birth;
}

// ── Wishlist render ──
function renderDashWishlist() {
  const wl = getDashWishlist();
  const grid = document.getElementById('dashWishGrid');
  if(!wl.length){
    grid.innerHTML=`<div class="wish-empty"><div class="e-icon">❤</div><h4>Aucun favori</h4><p style="font-family:'Syne',sans-serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.14em">Explorez les destinations et cliquez ♡</p></div>`;
    return;
  }
  if(typeof moroccanPlaces==='undefined'){ grid.innerHTML='<p style="color:#9a8878">Chargement...</p>'; return; }
  const items = wl.map(id=>moroccanPlaces.find(p=>p.id===id)).filter(Boolean);
  grid.innerHTML = items.map(p=>`
    <div class="wish-card" onclick="closeDashboard();setTimeout(()=>openPlaceModal(${p.id}),300)">
      <div class="wish-card-img"><img src="${p.img}" alt="${p.title}" loading="lazy"></div>
      <div class="wish-card-body">
        <div class="wish-card-title">${p.title}</div>
        <div class="wish-card-price">${p.price.toLocaleString('fr-MA')} DH</div>
      </div>
      <button class="wish-rm" onclick="event.stopPropagation();removeFromWishlist(${p.id})">✕</button>
    </div>`).join('');
}

function removeFromWishlist(id) {
  let wl = getDashWishlist().filter(x=>x!==id);
  saveDashWishlist(wl);
  document.getElementById('dtc-wish').textContent = wl.length;
  renderDashWishlist();
  api.removeWishlist(id).then(res => { if (!res.success) console.warn('Wishlist backend: ', res.error); });
  // also update heart in discover if visible
  const heart = document.querySelector('.disc-heart[data-id="'+id+'"]');
  if(heart){ heart.classList.remove('liked'); heart.textContent='♡'; }
}

function toggleDashWishlist(id, btn) {
  let wl = getDashWishlist();
  const idx = wl.indexOf(id);
  if(idx>=0){ wl.splice(idx,1); btn.classList.remove('liked'); btn.textContent='♡'; api.removeWishlist(id).then(res => { if (!res.success) console.warn('Wishlist backend: ', res.error); }); }
  else { wl.push(id); btn.classList.add('liked'); btn.textContent='♥'; api.addWishlist(id).then(res => { if (!res.success) console.warn('Wishlist backend: ', res.error); }); }
  saveDashWishlist(wl);
  document.getElementById('dtc-wish').textContent = wl.length;
}

// ── Bookings render ──
function renderDashBookings() {
  const bks = getDashBookings();
  const el  = document.getElementById('dashBookingsList');
  if(!bks.length){
    el.innerHTML=`<div class="bk-empty"><div class="e-icon">🎫</div><h4>Aucune réservation</h4><p style="font-family:'Syne',sans-serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.14em;color:#9a8878">Explorez nos voyages et réservez</p>
      <button class="form-submit" style="margin-top:1.2rem;width:auto;padding:.7rem 1.8rem;font-size:.66rem" onclick="closeDashboard();document.getElementById('voyages').scrollIntoView({behavior:'smooth'})">Voir les Voyages</button></div>`;
    return;
  }
  const smap = {confirmed:'st-ok',pending:'st-pnd',completed:'st-end'};
  const slbl = {confirmed:'✓ Confirmée',pending:'⏳ En attente',completed:'✈ Terminé'};
  el.innerHTML = bks.map(b=>`
    <div class="bk-card">
      <div class="bk-img"><img src="${b.img||'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200&q=70'}" alt="${b.title}"></div>
      <div class="bk-info">
        <div class="bk-title">${b.title}</div>
        <div class="bk-meta"><span>📍 ${b.dest||'Maroc'}</span><span>📅 ${b.date||'—'}</span><span>👥 ${b.voyageurs||1} pers.</span></div>
        <div class="bk-price">${b.price||'—'}</div>
      </div>
      <div class="bk-right">
        <span class="bk-status ${smap[b.status]||'st-pnd'}">${slbl[b.status]||'En attente'}</span>
        <button class="bk-action" onclick="alert('Détails disponibles prochainement.')">Détails</button>
      </div>
    </div>`).join('');
}

// ── Plannings render ──
function renderDashPlannings() {
  const plans = getDashPlans();
  const grid  = document.getElementById('dashPlanGrid');
  if(!plans.length){
    grid.innerHTML=`<div class="plan-empty" style="grid-column:1/-1"><div class="e-icon">🗓</div><h4>Aucun planning</h4><p style="font-family:'Syne',sans-serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.14em;color:#9a8878">Utilisez le planificateur pour créer votre voyage</p>
      <button class="form-submit" style="margin-top:1.2rem;width:auto;padding:.7rem 1.8rem;font-size:.66rem" onclick="closeDashboard();document.getElementById('planner').scrollIntoView({behavior:'smooth'})">Créer un Planning</button></div>`;
    return;
  }
  grid.innerHTML = plans.map(p=>`
    <div class="plan-card">
      <div class="plan-card-top">
        <div class="plan-icon">🗺</div>
        <div style="flex:1"><div class="plan-title">${p.title||'Mon voyage'}</div></div>
      </div>
      <div class="plan-meta">📅 ${p.days} jours · 👥 ${p.voyageurs} pers.</div>
      <div class="plan-detail">${new Date(p.depart).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}${p.type?' · '+p.type:''}</div>
      <div class="plan-actions">
        <button class="plan-btn" onclick="closeDashboard();loadPlan(${p.id})">📂 Charger</button>
        <button class="plan-btn del" onclick="deleteDashPlan(${p.id})">🗑</button>
      </div>
    </div>`).join('');
}

function deleteDashPlan(id) {
  const u = getDashUser(); if(!u) return;
  const plans = getDashPlans().filter(p=>p.id!==id);
  localStorage.setItem('voy_plans_'+u.email, JSON.stringify(plans));
  document.getElementById('dtc-plan').textContent = plans.length;
  renderDashPlannings();
}

// ── Discover grid ──
function renderDiscoverGrid(cat, btn) {
  if(typeof moroccanPlaces==='undefined') return;
  // update filter pills
  document.querySelectorAll('#discFilters .filter-pill').forEach(p=>p.classList.remove('active'));
  if(btn) btn.classList.add('active');

  const wl = getDashWishlist();
  const items = cat==='all' ? moroccanPlaces : moroccanPlaces.filter(p=>p.cat===cat);
  document.getElementById('dashDiscGrid').innerHTML = items.map(p=>`
    <div class="disc-card" onclick="closeDashboard();setTimeout(()=>openPlaceModal(${p.id}),300)">
      <div class="disc-img">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="disc-img-overlay"></div>
        <div class="disc-img-name">${p.title}</div>
        <button class="disc-heart ${wl.includes(p.id)?'liked':''}" data-id="${p.id}"
          onclick="event.stopPropagation();toggleDashWishlist(${p.id},this)">
          ${wl.includes(p.id)?'♥':'♡'}
        </button>
      </div>
      <div class="disc-body">
        <div class="disc-region">${p.region}</div>
        <div class="disc-price">À partir de ${p.price.toLocaleString('fr-MA')} DH</div>
      </div>
    </div>`).join('');
}

// ── Settings save ──
function saveProfile() {
  const u = getDashUser(); if(!u) return;
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  const updated = {
    ...all[idx],
    prenom: document.getElementById('setPrenom').value.trim()||u.prenom,
    nom:    document.getElementById('setNom').value.trim()||u.nom,
    phone:  document.getElementById('setPhone').value.trim(),
    city:   document.getElementById('setVille').value,
    birth:  document.getElementById('setBirth')?.value||'',
  };
  if(idx>=0){ all[idx]=updated; saveDashUsers(all); setDashUser(updated); }
  const msg = document.getElementById('saveMsg');
  msg.style.display='block'; msg.style.color='var(--olive)'; msg.textContent='✓ Profil mis à jour !';
  setTimeout(()=>msg.style.display='none',3000);
  // update display name
  document.getElementById('dashFullname').textContent = updated.prenom+' '+updated.nom;
  document.getElementById('dashAvatar').textContent   = updated.prenom[0].toUpperCase();
  updateAuthUI();
}

function savePrefs() {
  const u = getDashUser(); if(!u) return;
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  if(idx>=0){
    all[idx].prefType    = document.getElementById('setPrefType').value;
    all[idx].prefBudget  = document.getElementById('setPrefBudget').value;
    all[idx].newsletter  = document.getElementById('prefNewsletter').checked;
    all[idx].whatsapp    = document.getElementById('prefWhatsapp').checked;
    saveDashUsers(all); setDashUser(all[idx]);
  }
  alert('✅ Préférences enregistrées !');
}

function changePassword() {
  const u   = getDashUser(); if(!u) return;
  const cur = document.getElementById('setPwdCurrent').value;
  const nw  = document.getElementById('setPwdNew').value;
  const cf  = document.getElementById('setPwdConfirm').value;
  const msg = document.getElementById('pwdMsg');
  msg.style.display='block';
  if(!cur||!nw||!cf){ msg.style.color='#c0392b'; msg.textContent='Remplissez tous les champs.'; return; }
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  if(idx<0||all[idx].password!==cur){ msg.style.color='#c0392b'; msg.textContent='Mot de passe actuel incorrect.'; return; }
  if(nw.length<6){ msg.style.color='#c0392b'; msg.textContent='Minimum 6 caractères.'; return; }
  if(nw!==cf){ msg.style.color='#c0392b'; msg.textContent='Les mots de passe ne correspondent pas.'; return; }
  all[idx].password=nw; saveDashUsers(all); setDashUser(all[idx]);
  msg.style.color='var(--olive)'; msg.textContent='✓ Mot de passe modifié avec succès !';
  document.getElementById('setPwdCurrent').value='';
  document.getElementById('setPwdNew').value='';
  document.getElementById('setPwdConfirm').value='';
  setTimeout(()=>msg.style.display='none',3500);
}

function clearAllData() {
  if(!confirm('Effacer toutes vos données de voyage (favoris, plannings) ? Cette action est irréversible.')) return;
  const u = getDashUser(); if(!u) return;
  localStorage.removeItem('voy_plans_'+u.email);
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===u.email);
  if(idx>=0){ all[idx].wishlist=[]; all[idx].bookings=[]; saveDashUsers(all); setDashUser(all[idx]); }
  alert('✅ Données effacées.');
  populateDashboard(getDashUser());
  switchDashTab('overview', document.querySelectorAll('.dash-tab')[0]);
}

function deleteAccount() {
  if(!confirm('Supprimer définitivement votre compte VOYAGEUR ? Action irréversible.')) return;
  const u = getDashUser(); if(!u) return;
  const all = getDashUsers().filter(x=>x.email!==u.email);
  saveDashUsers(all);
  localStorage.removeItem('voy_plans_'+u.email);
  sessionStorage.removeItem('voy_current');
  closeDashboard();
  updateAuthUI();
  alert('Compte supprimé. Au revoir !');
}

// ── override bookTrip to save to user bookings ──
function bookTrip(title, img, dest, price, days) {
  const user = getDashUser();
  if(!user){
    closeResults();
    openModal('login');
    setTimeout(()=>{
      document.getElementById('loginError').textContent='Connectez-vous pour réserver "'+title+'"';
      document.getElementById('loginError').classList.add('show');
    },400);
    return;
  }
  const all = getDashUsers();
  const idx = all.findIndex(x=>x.email===user.email);
  if(idx>=0){
    if(!all[idx].bookings) all[idx].bookings=[];
    all[idx].bookings.push({
      id:Date.now(), title, img:img||'', dest:dest||'Maroc',
      date:new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}),
      voyageurs:1, price:(price||'—')+' DH', status:'pending'
    });
    saveDashUsers(all); setDashUser(all[idx]);
  }

  // Réservation réelle enregistrée en base de données (table bookings)
  api.createBooking({
    package_title: title,
    full_name: `${user.prenom} ${user.nom || ''}`.trim(),
    email: user.email,
    phone: user.phone || '',
    travelers: 1,
    destination_id: currentPlace && currentPlace.title === title ? currentPlace.id : null,
  }).then(res => {
    if (!res.success) console.warn('Réservation backend: ', res.error);
  });

  alert('🎫 Demande de réservation envoyée pour "'+title+'" !\nUn conseiller vous contactera sous 24h, '+user.prenom+' !');
}

// ── override bookFromModal (place detail) ──
function bookFromModal() {
  if(!currentPlace) return;
  const user = getDashUser();
  if(!user){
    closePlaceModal(); openModal('login');
    setTimeout(()=>{
      document.getElementById('loginError').textContent='Connectez-vous pour réserver "'+currentPlace.title+'"';
      document.getElementById('loginError').classList.add('show');
    },400);
    return;
  }
  bookTrip(currentPlace.title, currentPlace.img, currentPlace.region, currentPlace.price.toLocaleString('fr-MA'), currentPlace.days);
  closePlaceModal();
}

// ── Chargement des données depuis le backend (MySQL via API PHP) ──
// Si le backend n'est pas encore configuré/accessible, le site continue de
// fonctionner avec les données de démonstration codées ci-dessus.
async function loadDataFromBackend() {
  const destRes = await api.destinations();
  if (destRes.success && Array.isArray(destRes.data) && destRes.data.length) {
    moroccanPlaces = destRes.data;
    if (typeof renderPkgGrid === 'function') renderPkgGrid();
  }

  const pkgRes = await api.packages();
  if (pkgRes.success && Array.isArray(pkgRes.data) && pkgRes.data.length) {
    allResults = pkgRes.data;
  }
}
loadDataFromBackend();

// ESC key close dashboard
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && document.getElementById('dashPanel').classList.contains('open')) closeDashboard();
});

updateAuthUI();