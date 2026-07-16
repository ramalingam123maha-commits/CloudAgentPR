// Smooth-scroll for in-page anchors and dynamic year
(function () {
  const links = document.querySelectorAll('a[href^="#"]');
  for (const link of links) {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', id);
          el.focus({ preventScroll: true });
        }
      }
    });
  }
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();
})();
