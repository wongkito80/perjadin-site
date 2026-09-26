const pageLang=(document.documentElement.lang||'id').toLowerCase().startsWith('en')?'en':'id';
const numberLocale=pageLang==='en'?'en-US':'id-ID';
const uiText=pageLang==='en'?{
 light:'Enable light mode',dark:'Enable dark mode',close:'Close dialog',nav:'Open or close navigation'
}:{light:'Aktifkan mode terang',dark:'Aktifkan mode gelap',close:'Tutup dialog',nav:'Buka atau tutup navigasi'};


window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }, 700);
});
setTimeout(() => {
  const l = document.getElementById('loader');
  if (l && !l.classList.contains('hidden')) {
    l.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }
}, 3000);

function updateThemeIcon() {
 const button=document.getElementById("themeToggle");
 button.innerHTML=currentTheme === "dark" ? "<svg class=\"ui-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5\"/></svg>" : "<svg class=\"ui-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z\"/></svg>";
 button.setAttribute("aria-label",currentTheme === "dark" ? uiText.light : uiText.dark);
 button.setAttribute("aria-pressed",String(currentTheme === "dark"));
}
let currentTheme = 'light';
try { currentTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch (_) {}
document.body.setAttribute('data-theme', currentTheme);
updateThemeIcon();
document.getElementById('themeToggle').addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeIcon();
  try { localStorage.setItem('theme', currentTheme); } catch (_) {}
});

const navbar = document.getElementById('navbar');
const navLinksEl = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 200;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinksEl.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const navLinksList = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');
function toggleMenu(open) {
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  navLinksList.classList.toggle('open', open);
  navOverlay.classList.toggle('open', open);
}
hamburger.addEventListener('click', () => toggleMenu(!navLinksList.classList.contains('open')));
navOverlay.addEventListener('click', () => toggleMenu(false));
navLinksEl.forEach(l => l.addEventListener('click', () => toggleMenu(false)));

let modalTrigger = null;
function openModal(id) {
 const modal=document.getElementById(id); if(!modal)return;
 modalTrigger=document.activeElement; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
 modal.querySelector('.modal-close').focus();
}
function closeModal(id) {
 const modal=document.getElementById(id); if(!modal)return;
 modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; modalTrigger?.focus();
}
document.querySelectorAll('.modal-overlay').forEach(overlay=>{
 overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true');
 const heading=overlay.querySelector('h3'); heading.id=overlay.id+'-title'; overlay.setAttribute('aria-labelledby',heading.id);
 overlay.querySelector('.modal-close').setAttribute('aria-label',uiText.close);
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal(overlay.id);});
});
document.addEventListener('keydown',e=>{
 const modal=document.querySelector('.modal-overlay.open');
 if(e.key==='Escape') { if(modal)closeModal(modal.id); toggleMenu(false); }
 if(e.key==='Tab'&&modal) {
  const focusable=Array.from(modal.querySelectorAll('button,a[href],[tabindex="0"]')); const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
document.querySelectorAll('[aria-haspopup="dialog"][aria-controls]').forEach(el=>{
 el.addEventListener('click',()=>openModal(el.getAttribute('aria-controls')));
 el.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(el.getAttribute('aria-controls'));}
 });
});
document.querySelectorAll('.modal-close').forEach(btn=>{
 btn.addEventListener('click',()=>{
  const overlay=btn.closest('.modal-overlay');
  if(overlay) closeModal(overlay.id);
 });
});
hamburger.setAttribute('aria-controls','navLinks');hamburger.setAttribute('aria-expanded','false');hamburger.setAttribute('aria-label',uiText.nav);
document.getElementById('copyrightYear').textContent=new Date().getFullYear();

function toggleFaq(el) {
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(item => item.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
  document.querySelectorAll('.faq-item').forEach(item => item.querySelector('.faq-question').setAttribute('aria-expanded', String(item.classList.contains('open'))));
}

function setFaqFilter(category) {
  const items = document.querySelectorAll('#faqList .faq-item');
  const controls = document.querySelectorAll('[data-faq-filter]');
  controls.forEach(btn => {
    const active = btn.dataset.faqFilter === category;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  items.forEach(item => {
    const match = category === 'all' || item.dataset.faqCategory === category;
    item.classList.toggle('is-hidden', !match);
    if (!match) {
      item.classList.remove('open');
      const trigger = item.querySelector('.faq-question');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  });
}
document.querySelectorAll('[data-faq-filter]').forEach(btn=>{
 btn.addEventListener('click',()=>setFaqFilter(btn.dataset.faqFilter));
});
document.querySelectorAll('.faq-question').forEach(btn=>{
 btn.addEventListener('click',()=>toggleFaq(btn.closest('.faq-item')));
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('active'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

function animateCounter(el) {
  const target = +el.dataset.target;
  const dur = 2000;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = Math.floor(eased * target).toLocaleString(numberLocale);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString(numberLocale);
  }
  requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(c => counterObs.observe(c));



(function(){
  const toEnglish=document.getElementById('switchToEnglish');
  const toIndonesian=document.getElementById('switchToIndonesian');
  if(toEnglish){
    toEnglish.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      window.location.assign('https://perjadin.site/en.html');
    });
  }
  if(toIndonesian){
    toIndonesian.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      window.location.assign('https://perjadin.site/');
    });
  }
})();