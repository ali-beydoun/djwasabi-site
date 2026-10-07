/* Progressive enhancement. Photos remain ordinary links without JavaScript. */
(() => {
  const grid = document.querySelector('.event-gallery-grid');
  const viewer = document.getElementById('photo-viewer');
  if (!grid || !viewer || typeof viewer.showModal !== 'function') return;
  const photos = Array.from(grid.querySelectorAll('.event-photo'));
  const filters = document.querySelector('.gallery-filters');
  const filterButtons = Array.from(filters.querySelectorAll('button'));
  const count = document.getElementById('gallery-count');
  const image = document.getElementById('viewer-image');
  const caption = document.getElementById('viewer-caption');
  const position = document.getElementById('viewer-position');
  const original = document.getElementById('viewer-original');
  const previous = document.getElementById('viewer-previous');
  const next = document.getElementById('viewer-next');
  const close = document.getElementById('viewer-close');
  const stage = document.querySelector('.viewer-stage');
  const params = new URLSearchParams(location.search);
  let visible = photos;
  let index = 0;
  let trigger = null;
  let pointer = null;

  function filter(category) {
    if (!filterButtons.some(button => button.dataset.filter === category)) category = 'all';
    photos.forEach(photo => { photo.hidden = category !== 'all' && photo.dataset.category !== category; });
    visible = photos.filter(photo => !photo.hidden);
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    count.textContent = `${visible.length} ${visible.length === 1 ? 'photo' : 'photos'}`;
    const url = new URL(location.href);
    if (category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    url.searchParams.delete('photo');
    history.replaceState(null, '', url);
  }
  function showPhoto() {
    const photo = visible[index];
    image.src = photo.href;
    image.alt = photo.querySelector('img').alt;
    image.width = Number(photo.dataset.fullWidth);
    image.height = Number(photo.dataset.fullHeight);
    caption.textContent = photo.querySelector('.photo-title').textContent;
    position.textContent = `${index + 1} of ${visible.length}`;
    original.href = photo.href;
    previous.disabled = next.disabled = visible.length < 2;
    const url = new URL(location.href);
    url.searchParams.set('photo', photo.dataset.photo);
    history.replaceState(null, '', url);
  }
  function openPhoto(photo) {
    if (photo.hidden) filter('all');
    index = visible.indexOf(photo);
    trigger = photo;
    showPhoto();
    viewer.showModal();
    document.body.classList.add('photo-viewer-open');
    close.focus({ preventScroll: true });
  }
  function move(delta) { index = (index + delta + visible.length) % visible.length; showPhoto(); }
  photos.forEach(photo => {
    photo.setAttribute('aria-haspopup', 'dialog');
    photo.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openPhoto(photo);
    });
  });
  filterButtons.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  close.addEventListener('click', () => viewer.close());
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [previous, next, close, original].filter(control => !control.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if ((event.shiftKey && document.activeElement === first) ||
          (!event.shiftKey && document.activeElement === last) ||
          !controls.includes(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('photo-viewer-open');
    image.removeAttribute('src');
    const url = new URL(location.href);
    url.searchParams.delete('photo');
    history.replaceState(null, '', url);
    trigger?.focus({ preventScroll: true });
  });
  image.draggable = false;
  stage.addEventListener('pointerdown', event => {
    pointer = event.isPrimary ? { x: event.clientX, y: event.clientY } : null;
    if (event.isPrimary) stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!pointer) return;
    const x = event.clientX - pointer.x, y = event.clientY - pointer.y;
    if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5) move(x < 0 ? 1 : -1);
    pointer = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  });
  stage.addEventListener('pointercancel', () => { pointer = null; });
  filter(params.get('category') || 'all');
  filters.hidden = false;
  const requested = photos.find(photo => photo.dataset.photo === params.get('photo'));
  if (requested) openPhoto(requested);
})();
