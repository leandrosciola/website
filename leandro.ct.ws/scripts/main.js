// --- CONFIGURAÇÃO ---
const CONFIG = {
  API_KEY: 'SUA_CHAVE_API_AQUI',
  CHANNEL_ID: 'SEU_CHANNEL_ID_AQUI',
  MAX_RESULTS: 6,
  GOOGLE_SCRIPT_ID: 'AKfycbzZlY7YzNS7dA-lpLlMh02jz8C7ys2X9aM-Nz9ZHLD9BWpnFA2jnH1qeeqxPOXjJBNk'
};

// --- ELEMENTOS DO DOM ---
const DOM = {
  gallery: document.getElementById('gallery'),
  loadMoreBtn: document.getElementById('loadMoreBtn'),
  loadingMsg: document.getElementById('loadingMsg'),
  errorMsg: document.getElementById('errorMsg'),
  ytLink: document.getElementById('ytLink'),
  subscribeForm: document.getElementById('subscribe'),
  dialog: document.getElementById('my-dialog'),
  dialogText: document.querySelector('#my-dialog p'),
  dialogClose: document.getElementById('close'),
  header: document.querySelector('header'),
  hero: document.querySelector('header .hero'),
  mainContainer: document.querySelector('main .container')
};

// --- ESTADO DA APLICAÇÃO ---
let nextPageToken = '';
let uploadsPlaylistId = '';

// --- FUNÇÕES DE FORMATAÇÃO ---
const formatDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const formatViews = (views) => {
  const num = parseInt(views, 10);
  const formatter = new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' });
  return formatter.format(num).toLowerCase();
};

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return rtf.format(-count, interval.label);
  }
  return 'agora';
};

// --- COMPONENTES DE INTERFACE ---
const createVideoCard = (video) => {
  const videoId = video.snippet.resourceId.videoId;
  const title = video.snippet.title;
  const thumb = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url;
  const publishedAt = timeAgo(video.snippet.publishedAt);
  const duration = formatDuration(video.contentDetails.duration);
  const views = formatViews(video.statistics.viewCount);

  return `
    <a class="video-card" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">
      <div class="thumb">
        <img src="${thumb}" width="640" height="360" alt="Thumbnail: ${title}" loading="lazy">
        <div class="play-icon"></div>
        <span class="duration">${duration}</span>
      </div>
      <div class="video-info">
        <h2 class="video-title">${title}</h2>
        <p class="video-meta">${views} de visualizações • ${publishedAt}</p>
      </div>
    </a>
  `;
};

// --- REQUISIÇÕES DA API DO YOUTUBE ---
const getUploadsPlaylist = async () => {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CONFIG.CHANNEL_ID}&key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error.message);
  if (!data.items?.length) throw new Error('Canal não encontrado');
  
  uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
  if (DOM.ytLink) DOM.ytLink.href = `https://www.youtube.com/channel/${CONFIG.CHANNEL_ID}`;
};

const fetchVideos = async () => {
  if (!uploadsPlaylistId) {
    await getUploadsPlaylist();
  }

  DOM.loadingMsg.style.display = 'block';
  DOM.errorMsg.style.display = 'none';
  DOM.loadMoreBtn.disabled = true;

  try {
    let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${CONFIG.MAX_RESULTS}&key=${CONFIG.API_KEY}`;
    if (nextPageToken) playlistUrl += `&pageToken=${nextPageToken}`;

    const playlistRes = await fetch(playlistUrl);
    const playlistData = await playlistRes.json();
    
    if (playlistData.error) throw new Error(playlistData.error.message);
    if (!playlistData.items?.length) throw new Error('Nenhum vídeo encontrado');

    nextPageToken = playlistData.nextPageToken || '';
    
    const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${CONFIG.API_KEY}`;
    
    const videosRes = await fetch(videosUrl);
    const videosData = await videosRes.json();
    
    if (videosData.error) throw new Error(videosData.error.message);
    
    videosData.items.forEach(video => {
      DOM.gallery.insertAdjacentHTML('beforeend', createVideoCard(video));
    });
  } catch (err) {
    console.error(err);
    DOM.errorMsg.textContent = `Erro ao carregar vídeos: ${err.message}`;
    DOM.errorMsg.style.display = 'block';
  } finally {
    DOM.loadingMsg.style.display = 'none';
    DOM.loadMoreBtn.disabled = !nextPageToken;
    DOM.loadMoreBtn.textContent = nextPageToken ? 'Ver mais vídeos' : 'Não há mais vídeos';
  }
};

// --- NAVEGAÇÃO E INTERFACE DE USUÁRIO ---
const showContent = (id) => {
  DOM.header?.classList.remove('min-vh-100');
  DOM.hero?.classList.add('d-none');
  
  const contentTemplate = document.getElementById(id);
  if (DOM.mainContainer && contentTemplate) {
    DOM.mainContainer.innerHTML = contentTemplate.innerHTML;
  }

  window.scrollTo({ top: 0 });
};

const toggleProfile = () => {
  const viewProfile = document.getElementById('view-profile');
  const profile = document.getElementById('profile');
  if (!viewProfile || !profile) return;

  const isActive = viewProfile.classList.toggle('active');
  profile.classList.toggle('d-none', isActive);
  viewProfile.classList.toggle('d-none', !isActive);

  if (isActive) {
    window.scrollTo({ top: 0 });
  } else {
    const headerTopHeight = document.querySelector('header .header-top')?.offsetHeight || 0;
    profile.scrollIntoView({ block: 'start' });
    window.scrollTo({ top: window.scrollY - headerTopHeight - 10 });
  }
};

// --- FORMULÁRIO DE INSCRIÇÃO ---
if (DOM.subscribeForm) {
  DOM.dialogClose?.addEventListener('click', () => DOM.dialog?.close());

  DOM.subscribeForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bodyData = new URLSearchParams(formData.entries());
    const formElements = Array.from(DOM.subscribeForm.elements);

    formElements.forEach(el => el.style.display = 'none');
    DOM.subscribeForm.classList.add('loader');

    try {
      const response = await fetch(`https://script.google.com/macros/s/${CONFIG.GOOGLE_SCRIPT_ID}/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
      });

      if (!response.ok) throw new Error(`Status HTTP: ${response.status}`);

      const result = await response.json();

      if (result.status === 200) {
        DOM.dialogText.innerText = 'E-mail cadastrado com sucesso!';
        DOM.subscribeForm.reset();
      } else {
        throw new Error(`Status HTTP: ${result.status}`);
      }
    } catch (error) {
      DOM.dialogText.innerText = `Erro ao cadastrar o e-mail!\n\n${error.message || error}`;
    } finally {
      DOM.dialog?.showModal();
      DOM.subscribeForm.classList.remove('loader');
      formElements.forEach(el => el.style.display = 'inline');
    }
  };
}

// --- INICIALIZAÇÃO ---
DOM.loadMoreBtn?.addEventListener('click', fetchVideos);

if (CONFIG.API_KEY === 'SUA_CHAVE_API_AQUI' || CONFIG.CHANNEL_ID === 'SEU_CHANNEL_ID_AQUI') {
  if (DOM.errorMsg) {
    DOM.errorMsg.textContent = 'Configure sua API_KEY e CHANNEL_ID no script para carregar vídeos reais.';
    DOM.errorMsg.style.display = 'block';
  }
  if (DOM.loadMoreBtn) DOM.loadMoreBtn.disabled = true;
} else {
  fetchVideos();
}

