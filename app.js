(() => {
  'use strict';

  const SUPABASE_URL = 'https://lfdmbkzghnwvsapxypvt.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bRnkA6PA8-v073nrw9zxiQ_8rVGiOn1';
  const SESSION_KEY = 'movidalab_admin_session';
  const AVAILABLE_STATES = new Set(['disponible', 'beta', 'nueva']);
  const ICON_ACCENTS = {
    instrumento: '#007b85',
    sonometro: '#32d6d2',
    luxometro: '#ffb600',
    gases: '#b53b4a',
    anemometro: '#2a78b8',
    wbgt: '#e77d24',
    vibrometro: '#8b5cf6',
    geiger: '#70ad47'
  };

  const FALLBACK_SIMULATORS = [
    {
      id: 1,
      slug: 'sonometro-virtual',
      nombre: 'Sonómetro virtual',
      descripcion: 'Practica ponderaciones A, C y Z, respuesta temporal, rangos, Leq, máximos y análisis por bandas de octava y tercio de octava.',
      url: 'https://sonometro.movidasst.com',
      factor: 'Ruido ocupacional',
      medicion: 'Nivel de presión sonora · dB',
      icono: 'sonometro',
      etiquetas: ['Leq', 'dB(A)', 'Octavas', '1/3 de octava'],
      estado: 'Disponible',
      destacada: true,
      publicada: true,
      archivada: false,
      orden: 10
    },
    {
      id: 2,
      slug: 'luxometro-virtual',
      nombre: 'Luxómetro virtual',
      descripcion: 'Aprende a seleccionar el rango, ubicar el sensor y comprender la iluminancia antes de realizar una evaluación en puestos de trabajo.',
      url: 'https://luxometro.movidasst.com',
      factor: 'Iluminación',
      medicion: 'Iluminancia · lux',
      icono: 'luxometro',
      etiquetas: ['Iluminancia', 'Rango', 'Plano de trabajo'],
      estado: 'En desarrollo',
      destacada: false,
      publicada: true,
      archivada: false,
      orden: 20
    },
    {
      id: 3,
      slug: 'detector-multigas',
      nombre: 'Detector multigás',
      descripcion: 'Reconoce sensores, alarmas, comprobación funcional y lectura simultánea de gases en atmósferas potencialmente peligrosas.',
      url: null,
      factor: 'Agentes químicos',
      medicion: 'Concentración · ppm, %LEL y %vol',
      icono: 'gases',
      etiquetas: ['O₂', 'CO', 'H₂S', 'LEL'],
      estado: 'Próximamente',
      destacada: false,
      publicada: true,
      archivada: false,
      orden: 30
    },
    {
      id: 4,
      slug: 'anemometro-virtual',
      nombre: 'Anemómetro virtual',
      descripcion: 'Practica la medición de velocidad del aire y el recorrido de puntos para evaluar ventilación y corrientes en el ambiente laboral.',
      url: null,
      factor: 'Ventilación',
      medicion: 'Velocidad del aire · m/s',
      icono: 'anemometro',
      etiquetas: ['Ventilación', 'Caudal', 'Velocidad'],
      estado: 'Próximamente',
      destacada: false,
      publicada: true,
      archivada: false,
      orden: 40
    },
    {
      id: 5,
      slug: 'medidor-tgbh-wbgt',
      nombre: 'Medidor de estrés térmico TGBH / WBGT',
      descripcion: 'Comprende las temperaturas de globo, bulbo húmedo natural y bulbo seco que se combinan para estimar el estrés térmico.',
      url: null,
      factor: 'Estrés térmico',
      medicion: 'Índice TGBH / WBGT · °C',
      icono: 'wbgt',
      etiquetas: ['TGBH', 'WBGT', 'Carga térmica'],
      estado: 'Próximamente',
      destacada: false,
      publicada: true,
      archivada: false,
      orden: 50
    },
    {
      id: 6,
      slug: 'vibrometro-ocupacional',
      nombre: 'Vibrómetro ocupacional',
      descripcion: 'Explora la medición de vibraciones de mano-brazo y cuerpo entero, la selección de ejes y la interpretación inicial de la aceleración ponderada.',
      url: null,
      factor: 'Vibraciones',
      medicion: 'Aceleración ponderada · m/s²',
      icono: 'vibrometro',
      etiquetas: ['Mano-brazo', 'Cuerpo entero', 'A(8)', 'm/s²'],
      estado: 'Próximamente',
      destacada: false,
      publicada: true,
      archivada: false,
      orden: 60
    },
    {
      id: 7,
      slug: 'contador-geiger-muller',
      nombre: 'Contador Geiger-Müller',
      descripcion: 'Practica la comprobación de respuesta, el reconocimiento del fondo radiológico y la lectura de la tasa de conteo o de dosis sin confundir detección con dosimetría personal.',
      url: null,
      factor: 'Radiaciones ionizantes',
      medicion: 'Tasa de conteo y de dosis · CPM, CPS, µSv/h',
      icono: 'geiger',
      etiquetas: ['CPM', 'CPS', 'µSv/h', 'Fondo radiológico'],
      estado: 'Próximamente',
      destacada: false,
      publicada: true,
      archivada: false,
      orden: 70
    }
  ];

  const state = {
    simulators: [],
    adminSimulators: [],
    filter: 'todos',
    search: '',
    refreshPromise: null
  };

  const $ = (id) => document.getElementById(id);

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function isHttpsUrl(value) {
    if (!value) return false;
    try {
      const url = new URL(value);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function isAvailable(simulator) {
    return AVAILABLE_STATES.has(normalize(simulator.estado)) && isHttpsUrl(simulator.url);
  }

  function iconMarkup(name) {
    const icons = {
      instrumento: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="6" width="30" height="36" rx="7"/><path d="M16 14h16M16 21h16M17 34h14M24 26v8"/></svg>',
      sonometro: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5v8M18 5h12M17 13h14v29H17z"/><rect x="20" y="18" width="8" height="9" rx="1"/><path d="M20 33h8M35 16c3 4 3 12 0 16M39 12c6 7 6 18 0 25"/></svg>',
      luxometro: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="17" r="8"/><path d="M24 3v4M24 27v4M10 17H6M42 17h-4M14 7l3 3M34 7l-3 3M10 34h28v10H10zM16 39h9"/></svg>',
      gases: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="8" width="28" height="34" rx="6"/><rect x="15" y="14" width="18" height="10" rx="2"/><circle cx="18" cy="32" r="2"/><circle cx="24" cy="32" r="2"/><circle cx="30" cy="32" r="2"/><path d="M19 8V4h10v4"/></svg>',
      anemometro: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="22" r="4"/><path d="M24 18c-2-8 2-13 8-12 4 7 0 12-5 15M28 23c8-2 13 2 12 8-7 4-12 0-15-5M22 26c2 8-2 13-8 12-4-7 0-12 5-15M20 21c-8 2-13-2-12-8 7-4 12 0 15 5M24 26v17"/></svg>',
      wbgt: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 8a5 5 0 0 1 10 0v20a10 10 0 1 1-10 0z"/><path d="M24 12v21"/><circle cx="24" cy="35" r="4"/><path d="M35 9h7M35 15h5M35 21h7"/></svg>',
      vibrometro: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="7" width="30" height="34" rx="6"/><rect x="14" y="12" width="20" height="12" rx="2"/><path d="M17 20l3-4 4 6 3-8 4 6M16 31h16M20 36h8"/></svg>',
      geiger: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="7" width="32" height="34" rx="6"/><rect x="13" y="12" width="22" height="9" rx="2"/><circle cx="24" cy="31" r="3"/><path d="M24 28v-5M21.4 32.5l-4.4 2.5M26.6 32.5l4.4 2.5M14 27h4M30 27h4M14 37h8M26 37h8"/></svg>'
    };
    return icons[name] || icons.instrumento;
  }

  function setText(element, value) {
    element.textContent = value == null ? '' : String(value);
    return element;
  }

  async function request(path, { method = 'GET', body, accessToken } = {}) {
    const headers = { apikey: SUPABASE_KEY };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    let payload = null;
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = text; }
    }
    if (!response.ok) {
      const message = payload?.message || payload?.msg || payload?.error_description || payload?.details || 'No fue posible completar la solicitud.';
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function publicRpc(name, args = {}) {
    return request(`/rest/v1/rpc/${encodeURIComponent(name)}`, { method: 'POST', body: args });
  }

  function readSession() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return value?.access_token && value?.refresh_token ? value : null;
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    const expiresIn = Number(session.expires_in || 3600);
    const value = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ? Number(session.expires_at) * 1000 : Date.now() + expiresIn * 1000,
      user: { id: session.user?.id || '', email: session.user?.email || '' }
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    return value;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  async function refreshSession(session) {
    if (state.refreshPromise) return state.refreshPromise;
    state.refreshPromise = request('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: session.refresh_token }
    }).then(saveSession).catch((error) => {
      clearSession();
      throw error;
    }).finally(() => {
      state.refreshPromise = null;
    });
    return state.refreshPromise;
  }

  async function activeSession() {
    const session = readSession();
    if (!session) throw new Error('Debes iniciar sesión.');
    if (session.expires_at > Date.now() + 60_000) return session;
    return refreshSession(session);
  }

  async function adminRpc(name, args = {}) {
    const session = await activeSession();
    return request(`/rest/v1/rpc/${encodeURIComponent(name)}`, {
      method: 'POST',
      body: args,
      accessToken: session.access_token
    });
  }

  function createCard(simulator) {
    const card = document.createElement('article');
    card.className = `sim-card${simulator.destacada ? ' featured' : ''}`;
    card.style.setProperty('--accent', ICON_ACCENTS[simulator.icono] || ICON_ACCENTS.instrumento);

    const top = document.createElement('div');
    top.className = 'sim-card-top';
    const icon = document.createElement('div');
    icon.className = 'sim-icon';
    icon.innerHTML = iconMarkup(simulator.icono);
    const status = setText(document.createElement('span'), simulator.estado || 'Próximamente');
    status.className = 'status-pill';
    top.append(icon, status);

    const factor = setText(document.createElement('p'), simulator.factor || 'Higiene ocupacional');
    factor.className = 'sim-factor';
    const title = setText(document.createElement('h3'), simulator.nombre);
    const description = setText(document.createElement('p'), simulator.descripcion);
    description.className = 'sim-card-description';

    const measure = document.createElement('div');
    measure.className = 'measure-chip';
    measure.append(setText(document.createElement('span'), 'Qué mide'), setText(document.createElement('strong'), simulator.medicion || 'Variable ocupacional'));

    const tags = document.createElement('div');
    tags.className = 'sim-tags';
    (Array.isArray(simulator.etiquetas) ? simulator.etiquetas : []).slice(0, 5).forEach((tag) => tags.append(setText(document.createElement('span'), tag)));

    let action;
    if (isAvailable(simulator)) {
      action = setText(document.createElement('a'), 'Abrir simulador →');
      action.href = simulator.url;
      action.target = '_self';
      action.className = 'card-action';
      action.setAttribute('aria-label', `Abrir ${simulator.nombre}`);
    } else {
      action = setText(document.createElement('span'), simulator.estado === 'En desarrollo' ? 'En preparación' : 'Próximamente');
      action.className = 'card-action disabled';
      action.setAttribute('aria-disabled', 'true');
    }

    card.append(top, factor, title, description, measure, tags, action);
    return card;
  }

  function filteredSimulators() {
    return state.simulators.filter((simulator) => {
      const available = isAvailable(simulator);
      if (state.filter === 'disponibles' && !available) return false;
      if (state.filter === 'proximos' && available) return false;
      const haystack = normalize([
        simulator.nombre,
        simulator.descripcion,
        simulator.factor,
        simulator.medicion,
        ...(simulator.etiquetas || [])
      ].join(' '));
      return !state.search || haystack.includes(state.search);
    });
  }

  function renderCatalog() {
    const rows = filteredSimulators();
    const grid = $('simulatorGrid');
    grid.replaceChildren(...rows.map(createCard));
    $('emptyState').hidden = rows.length > 0;
    $('catalogStatus').textContent = `${rows.length} ${rows.length === 1 ? 'estación visible' : 'estaciones visibles'}`;

    const available = state.simulators.filter(isAvailable).length;
    $('totalCount').textContent = String(state.simulators.length).padStart(2, '0');
    $('availableCount').textContent = String(available).padStart(2, '0');
    $('upcomingCount').textContent = String(Math.max(0, state.simulators.length - available)).padStart(2, '0');
  }

  async function loadCatalog() {
    $('catalogStatus').textContent = 'Conectando con el laboratorio…';
    try {
      const rows = await publicRpc('laboratorio_simuladores_publicos');
      state.simulators = Array.isArray(rows) && rows.length ? rows : FALLBACK_SIMULATORS;
      $('catalogStatus').textContent = 'Catálogo actualizado';
    } catch (error) {
      console.warn('Se muestra el catálogo integrado porque no fue posible consultar Supabase.', error);
      state.simulators = FALLBACK_SIMULATORS;
      $('catalogStatus').textContent = 'Catálogo disponible en modo local';
    }
    renderCatalog();
  }

  function showLogin(message = '') {
    $('adminLogin').hidden = false;
    $('adminPanel').hidden = true;
    $('loginMessage').textContent = message;
    $('loginMessage').classList.remove('success');
  }

  function showAdminPanel(session) {
    $('adminLogin').hidden = true;
    $('adminPanel').hidden = false;
    $('adminName').textContent = session?.user?.email || 'Administrador';
  }

  function setBusy(button, busy, idleText) {
    button.disabled = busy;
    button.textContent = busy ? 'Procesando…' : idleText;
  }

  async function login(email, password) {
    const session = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password }
    });
    return saveSession(session);
  }

  async function logout() {
    const session = readSession();
    clearSession();
    if (session?.access_token) {
      try {
        await request('/auth/v1/logout', { method: 'POST', accessToken: session.access_token });
      } catch {
        // La sesión local ya quedó cerrada; no se bloquea la interfaz por un fallo de red.
      }
    }
  }

  function renderAdminList() {
    const list = $('adminList');
    const fragment = document.createDocumentFragment();
    state.adminSimulators.forEach((simulator) => {
      const item = document.createElement('article');
      item.className = `admin-item${simulator.archivada ? ' archived' : ''}`;
      const top = document.createElement('div');
      top.className = 'admin-item-top';
      const copy = document.createElement('div');
      copy.append(setText(document.createElement('h4'), simulator.nombre));
      copy.append(setText(document.createElement('p'), `${simulator.factor || 'Sin área'} · Orden ${simulator.orden ?? 100}`));
      const currentState = setText(document.createElement('span'), simulator.archivada ? 'Archivado' : simulator.publicada ? simulator.estado : 'Oculto');
      currentState.className = 'admin-item-state';
      top.append(copy, currentState);

      const actions = document.createElement('div');
      actions.className = 'admin-item-actions';
      const edit = setText(document.createElement('button'), 'Editar');
      edit.type = 'button';
      edit.dataset.action = 'edit';
      edit.dataset.id = simulator.id;
      const publish = setText(document.createElement('button'), simulator.publicada ? 'Ocultar' : 'Publicar');
      publish.type = 'button';
      publish.dataset.action = 'publish';
      publish.dataset.id = simulator.id;
      publish.dataset.value = String(!simulator.publicada);
      const archive = setText(document.createElement('button'), simulator.archivada ? 'Restaurar' : 'Archivar');
      archive.type = 'button';
      archive.dataset.action = 'archive';
      archive.dataset.id = simulator.id;
      archive.dataset.value = String(!simulator.archivada);
      actions.append(edit, publish, archive);
      item.append(top, actions);
      fragment.append(item);
    });
    list.replaceChildren(fragment);
    $('adminListCount').textContent = `${state.adminSimulators.length} ${state.adminSimulators.length === 1 ? 'registro' : 'registros'}`;
  }

  async function loadAdmin() {
    try {
      const session = await activeSession();
      const rows = await adminRpc('laboratorio_admin_listar');
      state.adminSimulators = Array.isArray(rows) ? rows : [];
      showAdminPanel(session);
      renderAdminList();
    } catch (error) {
      const unauthorized = /autoriz|jwt|sesión|session/i.test(error.message) || [401, 403].includes(error.status);
      if (unauthorized) clearSession();
      showLogin(unauthorized ? 'La cuenta no tiene permiso administrativo o la sesión venció.' : error.message);
    }
  }

  function resetEditor() {
    $('simulatorForm').reset();
    $('simulatorId').value = '';
    $('simOrder').value = '100';
    $('simStatus').value = 'Próximamente';
    $('simIcon').value = 'instrumento';
    $('editorTitle').textContent = 'Nuevo simulador';
    $('editorMessage').textContent = '';
    $('editorMessage').classList.remove('success');
  }

  function editSimulator(id) {
    const simulator = state.adminSimulators.find((row) => String(row.id) === String(id));
    if (!simulator) return;
    $('simulatorId').value = simulator.id;
    $('simName').value = simulator.nombre || '';
    $('simFactor').value = simulator.factor || '';
    $('simMeasure').value = simulator.medicion || '';
    $('simDescription').value = simulator.descripcion || '';
    $('simUrl').value = simulator.url || '';
    $('simStatus').value = simulator.estado || 'Próximamente';
    $('simIcon').value = simulator.icono || 'instrumento';
    $('simTags').value = (simulator.etiquetas || []).join(', ');
    $('simOrder').value = simulator.orden ?? 100;
    $('simPublished').checked = Boolean(simulator.publicada);
    $('simFeatured').checked = Boolean(simulator.destacada);
    $('editorTitle').textContent = `Editar: ${simulator.nombre}`;
    $('editorMessage').textContent = '';
    $('editorSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveSimulator() {
    const data = {
      id: $('simulatorId').value ? Number($('simulatorId').value) : null,
      nombre: $('simName').value.trim(),
      factor: $('simFactor').value.trim(),
      medicion: $('simMeasure').value.trim() || null,
      descripcion: $('simDescription').value.trim(),
      url: $('simUrl').value.trim() || null,
      estado: $('simStatus').value,
      icono: $('simIcon').value,
      etiquetas: $('simTags').value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
      orden: Number($('simOrder').value || 100),
      publicada: $('simPublished').checked,
      destacada: $('simFeatured').checked
    };
    if (!data.nombre || !data.factor || !data.descripcion) throw new Error('Completa el nombre, el área y la descripción.');
    if (data.url && !isHttpsUrl(data.url)) throw new Error('La dirección debe comenzar con https://');
    await adminRpc('laboratorio_admin_guardar', { p_datos: data });
  }

  async function updateAdminItem(action, id, value) {
    const functionName = action === 'publish' ? 'laboratorio_admin_publicar' : 'laboratorio_admin_archivar';
    const valueName = action === 'publish' ? 'p_publicada' : 'p_archivar';
    await adminRpc(functionName, { p_id: Number(id), [valueName]: value });
    await Promise.all([loadAdmin(), loadCatalog()]);
  }

  function bindEvents() {
    $('catalogSearch').addEventListener('input', (event) => {
      state.search = normalize(event.target.value);
      renderCatalog();
    });

    document.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        renderCatalog();
      });
    });

    $('clearFilters').addEventListener('click', () => {
      state.filter = 'todos';
      state.search = '';
      $('catalogSearch').value = '';
      document.querySelectorAll('[data-filter]').forEach((item) => {
        const active = item.dataset.filter === 'todos';
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderCatalog();
    });

    $('openAdmin').addEventListener('click', async () => {
      $('adminDialog').showModal();
      document.body.classList.add('dialog-open');
      if (readSession()) await loadAdmin();
      else showLogin();
    });

    $('closeAdmin').addEventListener('click', () => $('adminDialog').close());
    $('adminDialog').addEventListener('close', () => document.body.classList.remove('dialog-open'));
    $('adminDialog').addEventListener('click', (event) => {
      if (event.target === $('adminDialog')) $('adminDialog').close();
    });

    $('toggleAdminPassword').addEventListener('click', () => {
      const input = $('adminPassword');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('toggleAdminPassword').textContent = show ? 'Ocultar' : 'Mostrar';
      $('toggleAdminPassword').setAttribute('aria-pressed', String(show));
      $('toggleAdminPassword').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });

    $('loginForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = $('adminEmail').value.trim();
      const password = $('adminPassword').value;
      if (!email || !password) {
        showLogin('Escribe el correo administrativo y la contraseña.');
        return;
      }
      setBusy($('loginSubmit'), true, 'Entrar a administración');
      $('loginMessage').textContent = '';
      try {
        await login(email, password);
        $('adminPassword').value = '';
        await loadAdmin();
      } catch (error) {
        clearSession();
        showLogin(/invalid login/i.test(error.message) ? 'Correo o contraseña incorrectos.' : error.message);
      } finally {
        setBusy($('loginSubmit'), false, 'Entrar a administración');
      }
    });

    $('logoutAdmin').addEventListener('click', async () => {
      await logout();
      resetEditor();
      showLogin('Sesión cerrada correctamente.');
      $('loginMessage').classList.add('success');
    });

    $('newSimulator').addEventListener('click', () => {
      resetEditor();
      $('simName').focus();
    });
    $('cancelEdit').addEventListener('click', resetEditor);

    $('simulatorForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      setBusy($('saveSimulator'), true, 'Guardar simulador');
      $('editorMessage').textContent = '';
      $('editorMessage').classList.remove('success');
      try {
        await saveSimulator();
        resetEditor();
        $('editorMessage').textContent = 'Simulador guardado correctamente.';
        $('editorMessage').classList.add('success');
        await Promise.all([loadAdmin(), loadCatalog()]);
      } catch (error) {
        $('editorMessage').textContent = error.message;
      } finally {
        setBusy($('saveSimulator'), false, 'Guardar simulador');
      }
    });

    $('adminList').addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      if (button.dataset.action === 'edit') {
        editSimulator(button.dataset.id);
        return;
      }
      button.disabled = true;
      try {
        await updateAdminItem(button.dataset.action, button.dataset.id, button.dataset.value === 'true');
      } catch (error) {
        $('editorMessage').textContent = error.message;
        button.disabled = false;
      }
    });
  }

  bindEvents();
  resetEditor();
  loadCatalog();
})();
