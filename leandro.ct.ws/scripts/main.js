// CONFIGURAÇÃO: Substitua pelos seus dados
const API_KEY = 'SUA_CHAVE_API_AQUI';
const CHANNEL_ID = 'SEU_CHANNEL_ID_AQUI';
const MAX_RESULTS = 6;

const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadingMsg = document.getElementById('loadingMsg');
const errorMsg = document.getElementById('errorMsg');

let nextPageToken = '';
let uploadsPlaylistId = '';

function formatDuration(iso) {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatViews(views) {
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' mi';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' mil';
    return num;
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'ano', seconds: 31536000 },
        { label: 'mês', seconds: 2592000 },
        { label: 'semana', seconds: 604800 },
        { label: 'dia', seconds: 86400 },
        { label: 'hora', seconds: 3600 },
        { label: 'minuto', seconds: 60 }
    ];
    for (const i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if (count >= 1) return `há ${count} ${i.label}${count > 1? 's' : ''}`;
    }
    return 'agora';
}

function createVideoCard(video) {
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
                <p class="video-meta">${views} visualizações • ${publishedAt}</p>
            </div>
        </a>
    `;
}

async function getUploadsPlaylist() {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.items?.length) throw new Error('Canal não encontrado');
    uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
    const channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}`;
    //document.getElementById('subscribeBtn').href = `${channelUrl}?sub_confirmation=1`;
    document.getElementById('ytLink').href = channelUrl;
}

async function fetchVideos() {
    if (!uploadsPlaylistId) await getUploadsPlaylist();
    loadingMsg.style.display = 'block';
    errorMsg.style.display = 'none';
    loadMoreBtn.disabled = true;

    try {
        let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
        if (nextPageToken) playlistUrl += `&pageToken=${nextPageToken}`;
        const playlistRes = await fetch(playlistUrl);
        const playlistData = await playlistRes.json();
        if (playlistData.error) throw new Error(playlistData.error.message);
        if (!playlistData.items?.length) throw new Error('Nenhum vídeo encontrado');
        nextPageToken = playlistData.nextPageToken || '';
        const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId).join(',');
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
        const videosRes = await fetch(videosUrl);
        const videosData = await videosRes.json();
        if (videosData.error) throw new Error(videosData.error.message);
        videosData.items.forEach(video => {
            gallery.insertAdjacentHTML('beforeend', createVideoCard(video));
        });
    } catch (err) {
        console.error(err);
        errorMsg.textContent = `Erro ao carregar vídeos: ${err.message}`;
        errorMsg.style.display = 'block';
    } finally {
        loadingMsg.style.display = 'none';
        loadMoreBtn.disabled =!nextPageToken;
        loadMoreBtn.textContent = nextPageToken? 'Ver mais vídeos' : 'Não há mais vídeos';
    }
}

loadMoreBtn.addEventListener('click', fetchVideos);

if (API_KEY === 'SUA_CHAVE_API_AQUI' || CHANNEL_ID === 'SEU_CHANNEL_ID_AQUI') {
    errorMsg.textContent = 'Configure sua API_KEY e CHANNEL_ID no script para carregar vídeos reais.';
    errorMsg.style.display = 'block';
    loadMoreBtn.disabled = true;
} else {
    fetchVideos();
}

function content(id) {
    document.querySelector("header").classList.remove("min-vh-100");
    document.querySelector("header .hero").classList.add("d-none");
    document.querySelector("main .container").innerHTML = document.getElementById(id).innerHTML;
    window.scrollTo({ top: 0 });
}
function profile() {
    const viewProfile = document.getElementById("view-profile");
    const profile     = document.getElementById("profile");
    if (viewProfile.classList.toggle("active")) {
        profile.classList.add("d-none");
        viewProfile.classList.remove("d-none");
        window.scrollTo({ top: 0 });
    } else {
        let header = document.querySelector("header .header-top").offsetHeight;
        profile.classList.remove("d-none");
        viewProfile.classList.add("d-none");
        profile.scrollIntoView({ block: "start" });
        window.scrollTo({
          top: (window.scrollY - header) - 10
        });
    }
}

const form = document.getElementById("subscribe");
form.onsubmit = async e => {
    e.preventDefault();
    Array.from(form.elements).forEach(element => {
            element.style.display = "none";
    });
    form.classList.add("loader");
    const formData = new FormData(e.target);
    const data     = new URLSearchParams(formData.entries());
    const dialog   = document.getElementById("my-dialog");
    document.getElementById("close").addEventListener("click", () => dialog.close());
    //const data     = Object.fromEntries(formData.entries()); // JSON
    try {
        var response = await fetch("https://script.google.com/macros/s/AKfycbzZlY7YzNS7dA-lpLlMh02jz8C7ys2X9aM-Nz9ZHLD9BWpnFA2jnH1qeeqxPOXjJBNk/exec", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: data
        });
        if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
        }
        response = await response.json();
        if (response.status === 200) {
            dialog.showModal();
            dialog.getElementsByTagName("p")[0].innerText = "E-mail cadastrado com sucesso!";
            form.reset();
        } else {
            throw new Error(`HTTP status: ${response.status}`);
        }
    } catch (error) {
        dialog.showModal();
        dialog.getElementsByTagName("p")[0].innerText = "Erro ao cadastrar o e-mail!\n\n" + error;
    }
    form.classList.remove("loader");
    Array.from(form.elements).forEach(element => {
        element.style.display = "inline";
    });
};
