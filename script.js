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

  showMsg('registerSuccess', `Compte créé avec succès ! Bienvenue, ${prenom} !`);
  setTimeout(() => { closeModal(); updateAuthUI(); }, 1400);
}

// keyboard close
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── SEARCH DATA ───

const allResults = [
  { dest:'Marrakech, Maroc', title:'Marrakech Impériale', img:'https://www.visitmorocco.com/sites/default/files/styles/thumbnail_destination_background_top5/public/thumbnails/image/koutoubia-mosque-minaret-located-at-medina-quarter-of-marrakesh-morocco-balate-dorin.jpg?itok=08hAHERp', days:8, price:'980', tags:['culture','gastronomie'], badge:'Best-seller', stars:'★★★★★', desc:'Médinas, souks colorés et palais dynastiques au cœur du Maroc.' },
  { dest:'Marrakech, Maroc', title:'Désert & Dunes de l\'Erg', img:'https://agenciaturismomarruecos.com/wp-content/uploads/2025/08/860492f3-0b51-4b6b-a770-3bf2ace3b102_the-magical-experience-of-erg-chebbi.webp', days:5, price:'650', tags:['aventure'], badge:'', stars:'★★★★☆', desc:'Nuit sous les étoiles du Sahara et bivouac berbère inoubliable.' },
  { dest:'Essaouira, Maroc', title:'Essaouira Marocaine', img:'https://media.istockphoto.com/id/1040006084/photo/view-on-old-city-of-essaouira-in-morocco.jpg?s=1024x1024&w=is&k=20&c=AbosNiny--FR0FVqW0GXJMVJ2qiaDZ3lL_9FxYr24qY=', days:4, price:'490', tags:['gastronomie','culture'], badge:'Nouveau', stars:'★★★★★', desc:'Ateliers de cuisine, marchés d\'épices et dîners en riad.' },
  { dest:'Fes, Marocaine', title:'Fes, Marocaine', img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', days:7, price:'1890', tags:['culture'], badge:'Coup de Cœur', stars:'★★★★★', desc:'Fushimi Inari, Arashiyama et cérémonie du thé traditionnelle.' },
  { dest:'Mekness, Marocaine', title:'Mekness, Marocaine', img:'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=600&q=80', days:14, price:'2890', tags:['culture','gastronomie'], badge:'', stars:'★★★★★', desc:'Traversée épique du Japon entre modernité et tradition millénaire.' },
  { dest:'Chefchaouen, Marocaine', title:'Chefchaouen, Marocaine', img:'https://images.pexels.com/photos/34362535/pexels-photo-34362535.jpeg', days:6, price:'1350', tags:['plage','gastronomie'], badge:'Romantique', stars:'★★★★★', desc:'Couchers de soleil à Oia, vins locaux et plages de lave noire.' },
  { dest:'agadir', title:'Aurores Boréales & Geysers', img:'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', days:8, price:'2050', tags:['aventure'], badge:'Hiver', stars:'★★★★★', desc:'Lumières du nord, cascades gelées et sources chaudes naturelles.' },
];

let currentFilter = 'all';
let currentDest = '';

function launchSearch() {
  const destEl = document.querySelector('.hero-search select');
  const dateEl = document.querySelector('.hero-search input[type=date]');
  const travEl = document.querySelectorAll('.hero-search select')[1];
  currentDest = destEl ? destEl.value : 'Toutes destinations';
  const date = dateEl ? dateEl.value : '';
  const trav = travEl ? travEl.value : '';

  document.getElementById('resultsDestLabel').textContent = currentDest;
  const dateStr = date ? new Date(date).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'}) : '';
  document.getElementById('resultsSummary').textContent =
    [dateStr, trav].filter(Boolean).join(' · ');

  currentFilter = 'all';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.filter-pill').classList.add('active');

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

function renderResults() {
  const grid = document.getElementById('resultsGrid');

  // filter by destination keyword + tag
  const destKey = currentDest.split(',')[0].toLowerCase();
  let filtered = allResults.filter(r => {
    const matchDest = r.dest.toLowerCase().includes(destKey) || destKey === 'toutes destinations';
    const matchTag  = currentFilter === 'all' || r.tags.includes(currentFilter);
    return matchDest && matchTag;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="icon">🗺</div>
      <h3>Aucun résultat trouvé</h3>
      <p>Essayez une autre destination ou un autre filtre</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((r, i) => `
    <div class="result-card" style="animation-delay:${i * 60}ms">
      <div class="result-img">
        <img src="${r.img}" alt="${r.title}">
        ${r.badge ? `<span class="result-badge">${r.badge}</span>` : ''}
      </div>
      <div class="result-body">
        <div class="result-dest">
          <span>${r.dest}</span>
          <span class="result-stars">${r.stars}</span>
        </div>
        <div class="result-title">${r.title}</div>
        <div class="result-info">${r.days} jours · ${r.desc}</div>
        <div class="result-tags">${r.tags.map(t=>`<span class="result-tag">${t}</span>`).join('')}</div>
        <div class="result-footer">
          <div class="result-price"><small>À partir de</small>${parseInt(r.price).toLocaleString('fr-FR')} DH</div>
          <button class="result-book" onclick="bookTrip('${r.title}')">Réserver</button>
        </div>
      </div>
    </div>
  `).join('');
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
const moroccanPlaces = [
  {
    id: 1, title: 'Marrakech la Rouge', region: 'Maroc · Villes Impériales', zone: 'Marrakech-Safi',
    cat: 'imperial', stars: '★★★★★',
    img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/9d/92/7a/caption.jpg?w=1200&h=-1&s=1&cx=1920&cy=1080&chk=v1_809ada3581f73ea031b9',
    days: 5, price: 3200, saison: 'Avr – Juin · Sep – Nov',
    desc: 'Marrakech, la "Ville Rouge", est un kaléidoscope de couleurs, d\'odeurs et de sons. Perdez-vous dans les dédales de la médina, admirez la place Jemaa el-Fna et découvrez les palais dynastiques de la cité impériale.',
    highlights: ['Jemaa el-Fna & souks', 'Jardins Majorelle', 'Palais de la Bahia', 'Hammam traditionnel', 'Cuisine marocaine authentique', 'Riad de luxe en médina'],
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
const budgetPerDay = { eco: 450, confort: 1400, luxe: 3200 };
const budgetLabels = { eco: 'Économique', confort: 'Confort', luxe: 'Luxe' };

let planState = { selectedDests: [], depart: '', retour: '', voyageurs: 2, type: '', budget: '' };

function buildDestChips() {
  const grid = document.getElementById('stepDestGrid');
  if (!grid) return;
  grid.innerHTML = plannerDests.map(d => `
    <button class="dest-chip" data-id="${d.id}" onclick="toggleDest('${d.id}',this)">
      <span class="chip-check">✓</span>${d.label}
    </button>`).join('');
}

function toggleDest(id, btn) {
  const idx = planState.selectedDests.indexOf(id);
  if (idx === -1) {
    if (planState.selectedDests.length >= 5) return;
    planState.selectedDests.push(id);
    btn.classList.add('selected');
  } else {
    planState.selectedDests.splice(idx, 1);
    btn.classList.remove('selected');
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
    cursor.setDate(cursor.getDate() + n);
    return `<div class="timeline-day">
      <div class="tl-date">${label}</div>
      <div><div class="tl-dest">${d.label}</div><div class="tl-nights">${n} nuit${n>1?'s':''}</div></div>
    </div>`;
  }).join('');

  const bdg = budget || 'confort';
  const ppd = budgetPerDay[bdg];
  const totalPP = ppd * totalDays;
  const totalAll = totalPP * voyageurs;
  document.getElementById('sumBudget').innerHTML = `
    <div class="budget-row"><span class="blabel">Budget / pers. / jour</span><span class="bval">${ppd.toLocaleString('fr-MA')} DH</span></div>
    <div class="budget-row"><span class="blabel">Total / personne</span><span class="bval">${totalPP.toLocaleString('fr-MA')} DH</span></div>
    <div class="budget-row"><span class="blabel">💰 Total groupe (${voyageurs} pers.)</span><span class="bval">${totalAll.toLocaleString('fr-MA')} DH</span></div>`;
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

function printPlan() { window.print(); }
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
  // also update heart in discover if visible
  const heart = document.querySelector('.disc-heart[data-id="'+id+'"]');
  if(heart){ heart.classList.remove('liked'); heart.textContent='♡'; }
}

function toggleDashWishlist(id, btn) {
  let wl = getDashWishlist();
  const idx = wl.indexOf(id);
  if(idx>=0){ wl.splice(idx,1); btn.classList.remove('liked'); btn.textContent='♡'; }
  else { wl.push(id); btn.classList.add('liked'); btn.textContent='♥'; }
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

// ESC key close dashboard
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && document.getElementById('dashPanel').classList.contains('open')) closeDashboard();
});

updateAuthUI();