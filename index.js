/* ─────────────────────────────────────────
   index.js — Portfolio Interactions
───────────────────────────────────────── */

// ── 1. THREE.JS CYBER NETWORK ────────────────────────────
(async function initCyberScene() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    const mobile = innerWidth < 768;
    const particleCount = mobile ? 70 : 150;
    camera.position.z = 7;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

    const points = Array.from({ length: particleCount }, () => new THREE.Vector3((Math.random() - .5) * 7, (Math.random() - .5) * 5, (Math.random() - .5) * 4));
    const pointGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pointMaterial = new THREE.PointsMaterial({ color: 0x00e5ff, size: mobile ? .045 : .06, transparent: true, opacity: .7 });
    const pointCloud = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(pointCloud);

    const linePositions = [];
    points.forEach((point, index) => {
      points.slice(index + 1).forEach(other => {
        if (point.distanceTo(other) < 1.55) linePositions.push(point.x, point.y, point.z, other.x, other.y, other.z);
      });
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: .13 }));
    scene.add(lines);

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: .3 }));
    const coreGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 1), new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: .28 }));
    scene.add(core, coreGlow);

    const pointer = { x: 0, y: 0 };
    addEventListener('pointermove', event => { pointer.x = (event.clientX / innerWidth - .5) * 2; pointer.y = (event.clientY / innerHeight - .5) * 2; });
    function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
    resize(); addEventListener('resize', resize);
    function render(time) {
      const elapsed = time * .00025;
      pointCloud.rotation.y = elapsed * .35 + pointer.x * .08;
      lines.rotation.y = elapsed * .35 + pointer.x * .08;
      core.rotation.x = elapsed * 1.2; core.rotation.y = elapsed * 1.7;
      coreGlow.rotation.x = -elapsed * 1.4; coreGlow.rotation.z = elapsed;
      camera.position.x += (pointer.x * .45 - camera.position.x) * .025;
      camera.position.y += (-pointer.y * .3 - camera.position.y) * .025;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera); requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  } catch (error) {
    canvas.hidden = true;
    console.warn('Cyber scene unavailable; continuing without WebGL background.', error);
  }
})();

// ── 2. IMAGE TARGETING RETICLE ───────────────────────────
(function initReticle() {
  const wrap = document.getElementById('hero-image-wrap');
  const reticle = document.getElementById('reticle');
  if (!wrap || !reticle) return;
  wrap.addEventListener('pointermove', event => {
    const bounds = wrap.getBoundingClientRect();
    reticle.style.left = `${event.clientX - bounds.left}px`;
    reticle.style.top = `${event.clientY - bounds.top}px`;
  });
  wrap.addEventListener('pointerleave', () => { reticle.style.left = '50%'; reticle.style.top = '50%'; });
})();

// ── 3. HERO MICRO-INTERACTIONS ───────────────────────────
(function initHeroMicroInteractions() {
  const visual = document.getElementById('hero-visual');
  const copy = document.querySelector('.hero-copy');
  const tags = document.querySelectorAll('.hero-specialties span');
  if (!visual || matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches) return;

  visual.addEventListener('pointermove', event => {
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    visual.style.setProperty('--visual-shift-x', `${x * 5}px`);
    visual.style.setProperty('--visual-shift-y', `${y * 5}px`);
    if (copy) copy.style.transform = `translate(${x * -2}px, ${y * -2}px)`;
  });
  visual.addEventListener('pointerleave', () => { visual.style.removeProperty('--visual-shift-x'); visual.style.removeProperty('--visual-shift-y'); if (copy) copy.style.transform = ''; });

  tags.forEach(tag => tag.addEventListener('pointermove', event => {
    const bounds = tag.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    tag.style.setProperty('--tag-rotate-x', `${y * -5}deg`);
    tag.style.setProperty('--tag-rotate-y', `${x * 5}deg`);
  }));
  tags.forEach(tag => tag.addEventListener('pointerleave', () => { tag.style.removeProperty('--tag-rotate-x'); tag.style.removeProperty('--tag-rotate-y'); }));
})();


// ── 4. TYPING EFFECT ──────────────────────────────────────
function typeText(el, text, speed = 60, cb) {
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) { clearInterval(timer); cb && cb(); }
  }, speed);
}

window.addEventListener('load', () => {
  const nameEl = document.getElementById('typed-name');
  const roleEl = document.getElementById('typed-role');

  typeText(nameEl, 'Mostafa Mohamed', 70, () => {
    setTimeout(() => {
      typeText(roleEl, '> Junior Penetration Tester', 40);
    }, 300);
  });
});


// ── 4. SCROLL REVEAL ──────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── 5. SKILL BAR ANIMATION ────────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => {
        fill.style.width = fill.dataset.w + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObserver.observe(skillsSection);


// ── 6. ACTIVE NAV LINK ────────────────────────────────────
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));


// ── 7. UPTIME CLOCK ───────────────────────────────────────
(function uptimeClock() {
  const start = Date.now();
  const el    = document.getElementById('uptime');

  function pad(n) { return String(n).padStart(2, '0'); }

  setInterval(() => {
    const diff = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, 1000);
})();


// ── 8. CONTACT FORM ───────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const contactType = document.getElementById('contact-type');
  const pentestFields = document.getElementById('pentest-fields');
  const status = document.getElementById('form-status');
  const submitButton = form && form.querySelector('[type="submit"]');
  const submitLabel = submitButton && submitButton.querySelector('.form-submit-label');
  if (!form || !contactType || !pentestFields || !status || !submitButton || !submitLabel) return;

  const authorization = pentestFields.querySelector('[name="authorization_confirmed"]');
  let isSubmitting = false;

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('error', isError);
    status.hidden = false;
  }

  function updatePentestFields() {
    const isPentestRequest = contactType.value === 'Pentesting Request';
    pentestFields.hidden = !isPentestRequest;
    pentestFields.disabled = !isPentestRequest;
    pentestFields.setAttribute('aria-hidden', String(!isPentestRequest));
    if (!isPentestRequest) authorization.checked = false;
  }

  contactType.addEventListener('change', updatePentestFields);
  document.querySelectorAll('[data-pentest-request]').forEach(button => {
    button.addEventListener('click', () => {
      contactType.value = 'Pentesting Request';
      contactType.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (isSubmitting) return;

    if (contactType.value === 'Pentesting Request' && !authorization.checked) {
      showStatus('Confirm that you are authorized to test this target before submitting.', true);
      authorization.focus();
      return;
    }

    if (form.action.endsWith('/YOUR_FORM_ID')) {
      showStatus('Formspree is not configured yet. Add your Form ID to the form action in index.html.', true);
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitLabel.textContent = 'Sending...';
    status.hidden = true;
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) throw new Error('Form submission failed.');

      form.reset();
      updatePentestFields();
      showStatus('Message sent successfully. Thank you for getting in touch.');
    } catch {
      showStatus('Your message could not be sent. Please check your connection and try again.', true);
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitLabel.textContent = 'Send Message';
    }
  });

  updatePentestFields();
})();


// ── 8. COPY TO CLIPBOARD ──────────────────────────────────
function copyToClipboard(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const hint = el.querySelector('.copy-hint');
    hint.textContent = '✓ copied!';
    el.classList.add('copied');
    setTimeout(() => {
      hint.textContent = 'click to copy';
      el.classList.remove('copied');
    }, 2000);
  });
}


// ── 9. LIVE VULNERABILITY INTELLIGENCE ────────────────────
(async function loadVulnerabilityFeed() {
  const list = document.getElementById('intel-list');
  const status = document.getElementById('intel-status');
  const updated = document.getElementById('intel-updated');
  if (!list || !status || !updated) return;

  const primaryUrl = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
  const fallbackUrl = 'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json';
  const cacheKey = 'mostafa-cisa-kev-v1';
  const cacheTtl = 30 * 60 * 1000;
  const development = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const log = (...args) => { if (development) console.info('[KEV]', ...args); };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const text = value => typeof value === 'string' ? value.trim() : '';

  function normalizeCatalog(data) {
    if (!data || !Array.isArray(data.vulnerabilities)) throw new Error('Unexpected CISA catalog shape');
    const vulnerabilities = data.vulnerabilities.map(item => ({
      cveID: text(item.cveID), vendorProject: text(item.vendorProject), product: text(item.product),
      vulnerabilityName: text(item.vulnerabilityName), dateAdded: text(item.dateAdded),
      shortDescription: text(item.shortDescription), dueDate: text(item.dueDate),
      knownRansomwareCampaignUse: text(item.knownRansomwareCampaignUse)
    })).filter(item => item.cveID && item.dateAdded && item.vulnerabilityName);
    if (!vulnerabilities.length) throw new Error('CISA catalog contained no usable entries');
    vulnerabilities.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    return { vulnerabilities, updated: text(data.dateReleased) || text(data.catalogVersion) || '' };
  }

  function readCache() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      return cached && Date.now() - cached.timestamp < cacheTtl ? cached : null;
    } catch { return null; }
  }

  async function request(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return normalizeCatalog(await response.json());
    } finally { clearTimeout(timeout); }
  }

  function render(catalog, source) {
    list.innerHTML = catalog.vulnerabilities.slice(0, 5).map(item => {
      const ransomware = item.knownRansomwareCampaignUse.toLowerCase() === 'known';
      const vendorProduct = [item.vendorProject, item.product].filter(Boolean).join(' / ') || 'Vendor or product not listed';
      return `<article class="intel-item${ransomware ? ' intel-ransomware' : ''}">
        <div class="intel-item-top"><span class="intel-cve">${escapeHtml(item.cveID)}</span><time class="intel-date">ADDED ${escapeHtml(item.dateAdded)}</time></div>
        <strong class="intel-name">${escapeHtml(item.vulnerabilityName)}</strong>
        <span class="intel-vendor">${escapeHtml(vendorProduct)}</span>
        <p class="intel-description">${escapeHtml(item.shortDescription || 'No description provided by the catalog.')}</p>
        <div class="intel-item-foot"><span>DUE ${escapeHtml(item.dueDate || 'N/A')}</span>${ransomware ? '<b>RANSOMWARE CAMPAIGN USE: KNOWN</b>' : '<span>RANSOMWARE: NOT LISTED</span>'}</div>
      </article>`;
    }).join('');
    status.textContent = source === 'CISA' ? 'LIVE // CISA KEV DATA' : 'LIVE // CISA MIRROR DATA';
    updated.textContent = `LAST UPDATED ${escapeHtml(catalog.updated || catalog.vulnerabilities[0].dateAdded)}`;
  }

  const cached = readCache();
  if (cached) { render(cached.catalog, cached.source); return; }
  try {
    let catalog; let source = 'CISA';
    try { catalog = await request(primaryUrl); }
    catch (primaryError) { log('Official CISA feed failed; trying maintained mirror.', primaryError); source = 'CISA MIRROR'; catalog = await request(fallbackUrl); }
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), source, catalog })); } catch { /* Storage can be unavailable in private browsing. */ }
    render(catalog, source);
  } catch (error) {
    status.textContent = 'CISA KEV // UPDATE FAILED';
    updated.textContent = 'LAST UPDATED --';
    list.innerHTML = '<div class="intel-error" lang="ar" dir="rtl">تعذر تحديث بيانات الثغرات حاليًا</div>';
    log('Both CISA KEV sources failed.', error);
  }
})();

// ── 10. PROJECT CASE STUDIES ─────────────────────────────
(function initProjectShowcase() {
  const projects = {
    'network-sniffer': {
      title: 'Network Sniffer', category: 'NETWORK SECURITY',
      overview: 'A Python networking project that captures and analyzes raw packets in real time, extracting useful addressing and protocol information.',
      features: ['Raw packet capture', 'IP and MAC address extraction', 'Protocol identification', 'Payload inspection', 'Real-time packet output'],
      contribution: ['Implemented packet capture flow', 'Parsed packet headers and addressing data', 'Displayed protocol and payload information', 'Structured output for practical traffic analysis'],
      technologies: ['Python', 'Networking', 'Packet Analysis'],
      security: 'A hands-on network security and traffic analysis project for learning how packet data is observed and interpreted.'
    },
    'weather-pipeline': {
      title: 'Weather Pipeline', category: 'DATA ENGINEERING',
      overview: 'An automated machine-learning pipeline that fetches weather data, processes it through Apache Airflow, stores it in PostgreSQL, and runs XGBoost predictions.',
      features: ['Weather data ingestion', 'Apache Airflow workflow orchestration', 'PostgreSQL storage', 'Data processing', 'XGBoost prediction workflow'],
      contribution: ['Configured the automated workflow', 'Connected ingestion, processing, and storage stages', 'Integrated PostgreSQL persistence', 'Connected the prediction step to the pipeline'],
      technologies: ['Apache Airflow', 'XGBoost', 'PostgreSQL', 'Python', 'Machine Learning'],
      security: 'A data engineering project. Security is not presented as a primary project claim.'
    },
    'law-office': {
      title: 'Law Office System', category: 'SOFTWARE DEVELOPMENT',
      overview: 'A full-featured desktop application with complete CRUD operations and a relational SQL Server schema for case and client management.',
      features: ['Case management', 'Client management', 'Create, read, update, and delete operations', 'Relational data storage', 'Desktop user interface'],
      contribution: ['Designed CRUD workflows', 'Worked with the SQL Server data model', 'Connected case and client records', 'Implemented application data handling'],
      technologies: ['SQL Server', 'Desktop Application', 'CRUD', 'Relational Database'],
      security: 'A practical software development project. It is not presented as a penetration test or security assessment.'
    },
    restaurant: {
      title: 'Restaurant Ordering & Management System', category: 'FULL-STACK WEB DEVELOPMENT',
      overview: 'A full-stack restaurant management and ordering system built with ASP.NET Core MVC, C#, Entity Framework Core, and SQL Server.',
      features: ['Customer registration and login', 'Admin / Customer roles', 'Menu browsing and session-based cart', 'Checkout, order placement, and status tracking', 'Ingredient and inventory management', 'Feedback, order history, dashboard, search, and pagination', 'Invoice and order details'],
      contribution: ['MVC controllers and CRUD operations', 'ApplicationDbContext, LINQ, entity relationships, and navigation properties', 'Session-based shopping cart and order placement logic', 'Inventory availability checks and automatic inventory deduction', 'Role-based access checks, validation, search, and Razor Views integration'],
      technologies: ['C#', 'ASP.NET Core MVC', 'Entity Framework Core', 'SQL Server', 'LINQ', 'Razor Views', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
      security: 'Role-based access checks, session-based authentication state, ValidateAntiForgeryToken protection, server-side validation, and data annotation validation.'
    },
    techcourses: {
      title: 'TechCourses', category: 'FULL-STACK WEB DEVELOPMENT',
      overview: 'A full-stack web platform designed to help users discover and organize technical learning resources in one place. It links to original course providers rather than hosting courses itself.',
      features: ['Technical learning tracks', 'Course discovery and learning roadmaps', 'Technology academies, books, and learning resources', 'Direct links to original providers', 'Responsive navigation and mobile menu', 'Reusable UI sections, dynamic content, and backend integration'],
      contribution: ['Frontend structure and navigation', 'Learning-resource sections, academy cards, and roadmaps', 'Reusable UI components and application data handling', 'Node.js backend logic and MongoDB integration'],
      technologies: ['Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'HTML5', 'CSS3', 'REST-style routes', 'Git', 'GitHub'],
      security: 'Basic web security awareness and server-side data handling. This project is not presented as penetration tested.'
    },
    workfiy: {
      title: 'Workfiy', category: 'FULL-STACK WEB DEVELOPMENT // APPLICATION SECURITY',
      overview: 'A full-stack web platform designed to help users discover and manage jobs, internships, and scholarship opportunities through one organized interface.',
      features: ['Jobs, internships, and scholarships sections', 'Opportunity listings with search and filtering', 'Structured opportunity data', 'User interaction and application-related workflows', 'Responsive interface and dynamic content'],
      contribution: ['Frontend and backend development', 'Data handling and opportunity management', 'User-related workflows and application logic', 'Search, filtering, responsive UI, and frontend/backend integration'],
      technologies: ['Node.js', 'Express.js', 'JavaScript', 'HTML5', 'CSS3', 'MongoDB', 'REST APIs', 'Git', 'GitHub'],
      security: 'Input validation, backend-side data handling, authentication and access-control concepts, and awareness of common web application security risks. Security implementation is not overstated.'
    }
  };
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  const title = document.getElementById('modal-title');
  const category = document.getElementById('modal-category');
  const overview = document.getElementById('modal-overview');
  const features = document.getElementById('modal-features');
  const contribution = document.getElementById('modal-contribution');
  const technologies = document.getElementById('modal-technologies');
  const security = document.getElementById('modal-security');
  const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); };
  document.querySelectorAll('.case-study-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (matchMedia('(max-width: 900px)').matches) return;
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -3;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 3;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    const detailsButton = card.querySelector('button.details-btn');
    if (!detailsButton) return;
    detailsButton.addEventListener('click', () => {
      const project = projects[card.dataset.project];
      title.textContent = project.title; category.textContent = project.category; overview.textContent = project.overview; security.textContent = project.security;
      features.innerHTML = project.features.map(item => `<li>${item}</li>`).join('');
      contribution.innerHTML = project.contribution.map(item => `<li>${item}</li>`).join('');
      technologies.innerHTML = project.technologies.map(item => `<span>${item}</span>`).join('');
      modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
    });
  });
  modal.querySelectorAll('[data-modal-close]').forEach(element => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
})();

// ── 11. CERTIFICATION CARD TILT ──────────────────────────
(function initCertificationCards() {
  if (matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.certificate-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -2.5;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 2.5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
})();

// ── 12. CERTIFICATE PREVIEW MODAL ─────────────────────────
(async function renderCertificatePreviews() {
  const canvases = [...document.querySelectorAll('.certificate-pdf-preview')];
  if (!canvases.length) return;
  try {
    const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
    await Promise.all(canvases.map(async canvas => {
      try {
        const pdf = await pdfjs.getDocument(canvas.dataset.pdf).promise;
        const page = await pdf.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(1, canvas.parentElement.clientWidth - 28);
        const scale = availableWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * pixelRatio);
        canvas.height = Math.ceil(viewport.height * pixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : null }).promise;
      } catch {
        canvas.classList.add('certificate-preview-error');
        canvas.setAttribute('aria-label', 'Certificate preview unavailable; use Show Certificate');
      }
    }));
  } catch {
    canvases.forEach(canvas => canvas.classList.add('certificate-preview-error'));
  }
})();

// ── 13. CERTIFICATE PREVIEW MODAL ─────────────────────────
(function initCertificatePreview() {
  const modal = document.getElementById('certificate-modal');
  const content = document.getElementById('certificate-modal-content');
  if (!modal || !content) return;
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); content.replaceChildren(); };
  document.querySelectorAll('.certificate-button:not(:disabled)').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.certificate-card');
      const file = card && card.dataset.file;
      if (!file) return;
      const isImage = /\.(jpe?g|png|webp)$/i.test(file);
      const preview = isImage ? document.createElement('img') : document.createElement('iframe');
      preview.src = `./${file}`;
      preview.className = 'certificate-modal-media';
      preview.title = `${card.querySelector('h3').textContent} certificate`;
      if (isImage) preview.alt = preview.title;
      preview.addEventListener('error', () => window.open(`./${file}`, '_blank', 'noopener,noreferrer'));
      content.appendChild(preview);
      modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
    });
  });
  modal.querySelectorAll('[data-certificate-close]').forEach(element => element.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) close(); });
})();

// ── 10. MOBILE HAMBURGER ──────────────────────────────────
const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close sidebar when nav link clicked on mobile
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
});

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});
