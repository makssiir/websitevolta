document.documentElement.classList.add('js');

function revealHashDisclosure() {
  let id;
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  let revealed = false;
  for (let node = target; node; node = node.parentElement) {
    if (node.tagName === 'DETAILS' && !node.open) {
      node.open = true;
      revealed = true;
    }
  }
  if (revealed) window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}
revealHashDisclosure();
window.addEventListener('hashchange', revealHashDisclosure);

document.querySelectorAll('[data-background-video]').forEach((video) => {
  const hero = video.closest('.project-hero');
  const control = hero.querySelector('.hero-video-toggle');
  const caption = hero.querySelector('.hero-media-caption');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let requested = null;
  let visible = true;
  let pageReady = document.readyState === 'complete';
  let failed = false;

  const wantsPlayback = () => requested ?? (!motion.matches && !connection?.saveData);
  const canPlay = () => !failed && pageReady && visible && !document.hidden && wantsPlayback();
  function updateControl() {
    const playing = !video.paused;
    const label = playing ? 'Achtergrondvideo pauzeren' : 'Achtergrondvideo afspelen';
    control.setAttribute('aria-label', label);
    control.title = label;
    control.querySelector('[data-video-play]').hidden = playing;
    control.querySelector('[data-video-pause]').hidden = !playing;
  }
  function syncPlayback() {
    if (!canPlay()) {
      video.pause();
      if (requested !== true && (motion.matches || connection?.saveData)) {
        hero.classList.remove('has-video-frame');
        caption.hidden = true;
      }
      return;
    }
    // Defer the clip request until the page has loaded and motion is permitted.
    if (!video.src) video.src = video.dataset.backgroundVideo;
    video.muted = true;
    if (video.paused) video.play().catch(updateControl);
  }
  control.hidden = false;
  control.addEventListener('click', () => {
    requested = video.paused;
    syncPlayback();
  });
  video.addEventListener('playing', () => {
    if (!canPlay()) { video.pause(); return; }
    hero.classList.add('has-video-frame');
    caption.hidden = false;
    updateControl();
  });
  video.addEventListener('pause', updateControl);
  video.addEventListener('error', () => {
    failed = true;
    hero.classList.remove('has-video-frame');
    caption.hidden = true;
    control.hidden = true;
  });
  function preferencesChanged() {
    requested = null;
    syncPlayback();
  }
  motion.addEventListener('change', preferencesChanged);
  connection?.addEventListener('change', preferencesChanged);
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(hero);
  }
  if (pageReady) syncPlayback();
  else window.addEventListener('load', () => { pageReady = true; syncPlayback(); }, { once: true });
});

const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobileNavigation = window.matchMedia('(max-width: 1100px)');
let focusWithinNavigation = false;
function closeNavigation() {
  const restoreFocus = mobileNavigation.matches && navigation?.contains(document.activeElement);
  document.body.classList.remove('nav-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Menu openen');
  toggle?.setAttribute('title', 'Menu openen');
  if (restoreFocus) toggle?.focus();
}
toggle?.addEventListener('click', () => {
  const open = !document.body.classList.contains('nav-open');
  document.body.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  toggle.setAttribute('title', open ? 'Menu sluiten' : 'Menu openen');
  if (open) navigation?.querySelector('a[href]')?.focus();
});
navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeNavigation();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
    closeNavigation();
    toggle?.focus();
  }
});
document.addEventListener('focusin', (event) => {
  focusWithinNavigation = Boolean(navigation?.contains(event.target));
  if (document.body.classList.contains('nav-open') && !navigation?.contains(event.target) && event.target !== toggle) closeNavigation();
});
mobileNavigation.addEventListener('change', () => {
  const toggleFocused = document.activeElement === toggle;
  const navigationFocused = focusWithinNavigation;
  closeNavigation();
  if (mobileNavigation.matches && navigationFocused) toggle?.focus();
  if (!mobileNavigation.matches && toggleFocused) navigation?.querySelector('a[href]')?.focus();
});

const photoDialog = document.querySelector('#photo-viewer');
const photoTriggers = [...document.querySelectorAll('[data-photo-src]')];
if (photoDialog && photoTriggers.length) {
  const image = photoDialog.querySelector('#photo-viewer-image');
  const caption = photoDialog.querySelector('#photo-viewer-caption');
  const count = photoDialog.querySelector('#photo-viewer-count');
  let currentPhoto = 0;
  let visiblePhotos = [];
  function showPhoto(index) {
    currentPhoto = (index + visiblePhotos.length) % visiblePhotos.length;
    const trigger = visiblePhotos[currentPhoto];
    image.src = trigger.dataset.photoSrc;
    image.alt = trigger.dataset.photoAlt;
    caption.textContent = trigger.dataset.photoTitle;
    count.textContent = `${currentPhoto + 1} / ${visiblePhotos.length}`;
  }
  photoTriggers.forEach((trigger) => trigger.addEventListener('click', () => {
    visiblePhotos = photoTriggers.filter((photo) => !photo.closest('details:not([open])') && photo.getClientRects().length && getComputedStyle(photo).visibility === 'visible');
    const index = visiblePhotos.indexOf(trigger);
    if (index === -1) return;
    showPhoto(index);
    photoDialog.showModal();
  }));
  photoDialog.querySelector('[data-photo-close]').addEventListener('click', () => photoDialog.close());
  photoDialog.querySelector('[data-photo-prev]').addEventListener('click', () => showPhoto(currentPhoto - 1));
  photoDialog.querySelector('[data-photo-next]').addEventListener('click', () => showPhoto(currentPhoto + 1));
  photoDialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  photoDialog.addEventListener('click', (event) => {
    if (event.target !== photoDialog) return;
    const bounds = photoDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
  });
}

const form = document.querySelector('#project-form');
if (form) {
  const actions = document.querySelector('#project-actions');
  const status = document.querySelector('#project-status');
  const clientType = form.elements.namedItem('Opdrachtgever');
  const clientTypeLabel = clientType.closest('label');
  const company = form.elements.namedItem('Bedrijf');
  const companyField = document.querySelector('#company-field');
  const copyFallback = document.querySelector('#copy-fallback');
  const whatsappDraft = document.querySelector('#whatsapp-draft');
  const emailAddress = form.dataset.email;
  copyFallback.setAttribute('aria-describedby', status.id);
  status.setAttribute('aria-atomic', 'true');
  let statusTimer;
  let feedbackRevision = 0;
  function clearFeedback() {
    feedbackRevision += 1;
    clearTimeout(statusTimer);
    status.hidden = true;
    status.textContent = '';
    copyFallback.hidden = true;
    copyFallback.value = '';
    whatsappDraft.hidden = true;
    whatsappDraft.removeAttribute('href');
  }
  const parameters = new URLSearchParams(window.location.search);
  const pricePreference = form.elements.namedItem('Prijsafspraak');
  const priceDetailsLink = form.querySelector('#price-note a');
  const selectedPriceNote = document.createElement('p');
  selectedPriceNote.className = 'privacy-note';
  selectedPriceNote.id = 'selected-price-note';
  selectedPriceNote.hidden = true;
  pricePreference.closest('label').insertAdjacentElement('afterend', selectedPriceNote);
  pricePreference.setAttribute('aria-describedby', 'price-note selected-price-note');
  function updatePriceNote() {
    const note = pricePreference.selectedOptions[0]?.dataset.priceNote || '';
    selectedPriceNote.textContent = note;
    selectedPriceNote.hidden = !note;
  }
  pricePreference.addEventListener('change', updatePriceNote);
  const requestedPrice = parameters.get('prijs');
  const requestedOption = [...pricePreference.options].find((option) => requestedPrice && option.dataset.rate === requestedPrice);
  if (requestedOption) pricePreference.value = requestedOption.value;
  const requestedType = parameters.get('type') || (requestedOption?.dataset.audience === 'private' ? 'particulier' : null);
  if (['zakelijk', 'bedrijf', 'particulier'].includes(requestedType)) clientType.value = requestedType;
  let businessClientType = clientType.value === 'bedrijf' ? 'bedrijf' : 'zakelijk';
  clientType.querySelector('option[value="particulier"]').hidden = true;
  const intakeHeading = document.querySelector('#intake-heading');
  const intakeDescription = document.querySelector('#intake-description');
  const workPackage = form.elements.namedItem('Werkpakket');
  const projectType = form.elements.namedItem('Projecttype');
  const projectChoices = new Map([
    ['zakelijk', [workPackage.value, projectType.value]],
    ['particulier', ['Complete woninginstallatie / renovatie', 'Complete woningrenovatie of nieuwbouw']],
  ]);
  let currentRoute;
  const routePicker = document.createElement('div');
  routePicker.className = 'form-route-picker';
  routePicker.innerHTML = `<div role="group" aria-label="Type opdrachtgever"><button type="button" data-client-route="zakelijk">Zakelijk</button><button type="button" data-client-route="particulier">Particulier</button></div>`;
  form.insertBefore(routePicker, form.firstChild);
  function updateClientType() {
    const privateProject = clientType.value === 'particulier';
    const nextRoute = privateProject ? 'particulier' : 'zakelijk';
    if (!privateProject) businessClientType = clientType.value;
    clientTypeLabel.hidden = privateProject;
    intakeHeading.textContent = privateProject ? 'Uw woningproject.' : 'Uw projectaanvraag.';
    intakeDescription.textContent = 'Vul de hoofdlijnen in; de details bespreken we samen.';
    form.elements.namedItem('Projectomvang').placeholder = privateProject ? 'Bijv. complete woning of verbouwing van meerdere ruimtes' : 'Bijv. 6 woningen of 300 m² bedrijfspand';
    pricePreference.options[0].textContent = privateProject ? 'Vaste offerte voor mijn woningproject' : 'Vaste aanneemsom voor het werkpakket';
    if (currentRoute !== nextRoute) {
      if (currentRoute) projectChoices.set(currentRoute, [workPackage.value, projectType.value]);
      const choices = projectChoices.get(nextRoute);
      [workPackage, projectType].forEach((field, index) => {
        if ([...field.options].some((option) => option.value === choices[index])) field.value = choices[index];
      });
      currentRoute = nextRoute;
    }
    company.required = !privateProject;
    company.disabled = privateProject;
    companyField.hidden = privateProject;
    companyField.parentElement.classList.toggle('form-row--single', privateProject);
    priceDetailsLink.href = privateProject ? '/woningprojecten#prijsafspraak' : '/zakelijk#tarieven';
    priceDetailsLink.textContent = privateProject ? 'Bekijk particuliere prijs- en reisafspraken (incl. btw)' : 'Bekijk zakelijke prijs- en reisafspraken';
    for (const option of pricePreference.options) {
      const audience = option.dataset.audience;
      const unavailable = audience && audience !== (privateProject ? 'private' : 'business');
      option.disabled = Boolean(unavailable);
      option.hidden = Boolean(unavailable);
    }
    if (pricePreference.selectedOptions[0]?.disabled) pricePreference.selectedIndex = 0;
    updatePriceNote();
    routePicker.querySelectorAll('[data-client-route]').forEach((button) => {
      const selected = button.dataset.clientRoute === nextRoute;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    clearFeedback();
  }
  updateClientType();
  const requestedWork = parameters.get('werk');
  const requestedWorkOption = [...workPackage.options].find((option) => requestedWork && option.dataset.work === requestedWork);
  if (requestedWorkOption) workPackage.value = requestedWorkOption.value;
  const crewPreference = form.elements.namedItem('Gewenste bezetting');
  const requestedCrew = parameters.get('bezetting');
  const requestedCrewOption = [...(crewPreference?.options ?? [])].find(option => requestedCrew && option.dataset.crew === requestedCrew);
  if (requestedCrewOption) crewPreference.value = requestedCrewOption.value;
  function revealField(field) {
    for (let ancestor = field.parentElement; ancestor && ancestor !== form; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    }
  }
  if (requestedWorkOption) revealField(workPackage);
  if (requestedOption) revealField(pricePreference);
  if (requestedCrewOption) revealField(crewPreference);
  form.addEventListener('invalid', (event) => revealField(event.target), true);
  clientType.addEventListener('change', () => {
    updateClientType();
  });
  routePicker.addEventListener('click', (event) => {
    const route = event.target.closest('[data-client-route]');
    if (!route) return;
    clientType.value = route.dataset.clientRoute === 'particulier' ? 'particulier' : businessClientType;
    updateClientType();
  });
  form.addEventListener('input', (event) => {
    if (event.target.matches('input, textarea')) event.target.setCustomValidity('');
    clearFeedback();
  });
  form.addEventListener('change', clearFeedback);
  const fields = ['Bedrijf', 'Contactpersoon', 'E-mail', 'Telefoon', 'Projectlocatie', 'Projecttype', 'Projectomvang', 'Werkpakket', 'Gewenste bezetting', 'Prijsafspraak', 'Startperiode', 'Werktaal op locatie', 'Doorverwezen door', 'Toelichting'];
  function message() {
    const data = new FormData(form);
    const source = parameters.get('bron') || parameters.get('source') || parameters.get('utm_source') || '';
    return ['Projectaanvraag voor Elektoria', '', `Opdrachtgever: ${clientType.selectedOptions[0].textContent}`, ...(source ? [`Bron: ${source}`] : []), ...fields.filter((field) => data.has(field)).map((field) => `${field}: ${String(data.get(field) ?? '').trim() || 'In overleg'}`), '', 'Tekeningen en bestek kan ik afzonderlijk toesturen.'].join('\r\n');
  }
  function showStatus(text) {
    clearTimeout(statusTimer);
    status.textContent = '';
    status.hidden = false;
    // Expose the empty live region before updating it so announcements can fire.
    statusTimer = setTimeout(() => { status.textContent = text; }, 50);
  }
  function validateProject() {
    form.querySelectorAll('input[required], textarea[required]').forEach((field) => {
      field.setCustomValidity(field.value && !field.value.trim() ? 'Vul dit veld in.' : '');
    });
    return form.reportValidity();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFeedback();
    if (!validateProject()) return;
    const data = new FormData(form);
    const applicant = String(data.get('Bedrijf') || data.get('Contactpersoon')).trim();
    const text = message();
    const href = `mailto:${emailAddress}?subject=${encodeURIComponent(`Projectaanvraag - ${applicant}`)}&body=${encodeURIComponent(text)}`;
    copyFallback.value = text;
    copyFallback.hidden = false;
    if (event.submitter?.value !== 'email') {
      const whatsappUrl = new URL(form.dataset.whatsapp);
      whatsappUrl.searchParams.set('text', text);
      whatsappDraft.href = whatsappUrl.href;
      whatsappDraft.hidden = false;
      showStatus('Uw bericht staat klaar. Open WhatsApp met de knop hieronder, controleer de gegevens en verstuur het bericht. Uw aanvraag is nog niet verzonden.');
      whatsappDraft.focus();
      return;
    }
    showStatus('Uw aanvraag is nog niet verzonden. Verstuur de voorbereide e-mail zelf. Opent er geen e-mail of ontbreken er gegevens? Kopieer de volledige projectgegevens hieronder en mail ze naar info@voltaa.nl.');
    window.location.href = href;
  });
  document.querySelector('#copy-project')?.addEventListener('click', async () => {
    clearFeedback();
    if (!validateProject()) return;
    const text = message();
    const revision = feedbackRevision;
    try {
      await navigator.clipboard.writeText(text);
      if (revision !== feedbackRevision) return;
      showStatus('Projectgegevens gekopieerd. U kunt ze mailen naar info@voltaa.nl. Er is nog geen aanvraag verzonden.');
    } catch {
      if (revision !== feedbackRevision) return;
      copyFallback.hidden = false;
      copyFallback.value = text;
      copyFallback.focus();
      copyFallback.select();
      showStatus('Kopieer de geselecteerde projectgegevens en mail ze naar info@voltaa.nl.');
    }
  });
  form.noValidate = true;
  actions.hidden = false;
  actions.querySelectorAll('button').forEach((button) => { button.disabled = false; });
}
