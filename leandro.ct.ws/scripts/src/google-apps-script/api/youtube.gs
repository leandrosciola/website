function youtube(e) {
  return sampleData(); // Dev - Sample data

  const API_KEY = 'SUA_CHAVE_API_AQUI'; 
  const CHANNEL_ID = 'SEU_CHANNEL_ID_AQUI';
  const MAX_RESULTS = 6;

  const pageToken = (e && e.parameter && e.parameter.pageToken) ? e.parameter.pageToken : '';
  
  try {
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${CHANNEL_ID}&part=contentDetails`;
    const channelRes = UrlFetchApp.fetch(channelUrl, { muteHttpExceptions: true });
    const channelData = JSON.parse(channelRes.getContentText());
    
    if (channelData.error) {
      throw new Error("Erro na API do YouTube (Canal): " + channelData.error.message);
    }
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error("Canal não encontrado.");
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${MAX_RESULTS}&pageToken=${pageToken}`;
    const playlistRes = UrlFetchApp.fetch(playlistUrl, { muteHttpExceptions: true });
    const playlistData = JSON.parse(playlistRes.getContentText());
    
    if (playlistData.error) {
      throw new Error("Erro na API do YouTube (Playlist): " + playlistData.error.message);
    }
    if (!playlistData.items || playlistData.items.length === 0) {
      return printJSON({ items: [], nextPageToken: '' });
    }

    const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,statistics`;
    const videosRes = UrlFetchApp.fetch(videosUrl, { muteHttpExceptions: true });
    const videosData = JSON.parse(videosRes.getContentText());
    
    if (videosData.error) {
      throw new Error("Erro na API do YouTube (Vídeos): " + videosData.error.message);
    }

    const videoDetailsMap = {};
    if (videosData.items) {
      videosData.items.forEach(video => {
        videoDetailsMap[video.id] = {
          duration: video.contentDetails.duration,
          viewCount: video.statistics.viewCount || '0'
        };
      });
    }

    const finalItems = playlistData.items.map(item => {
      const vId = item.snippet.resourceId.videoId;
      const details = videoDetailsMap[vId] || { duration: 'PT0S', viewCount: '0' };

      let thumbUrl = '';
      const thumbs = item.snippet.thumbnails;
      if (thumbs) {
        thumbUrl = thumbs.medium ? thumbs.medium.url : (thumbs.default ? thumbs.default.url : '');
      }

      return {
        id: vId,
        title: item.snippet.title,
        //description: item.snippet.description,
        thumbnail: thumbUrl,
        publishedAt: item.snippet.publishedAt,
        duration: details.duration,
        //views: details.viewCount
      };
    });

    const responsePayload = {
      nextPageToken: playlistData.nextPageToken || '',
      items: finalItems
    };

    return printJSON(responsePayload);
                         
  } catch (error) {
    return printJSON({ error: true, message: error.toString() });
  }
}

function sampleData() {
  return printJSON({
    "nextPageToken": "CAYQAA",
    "items": [
      {
        "id": "v1_video_id",
        "title": "Como Programar em Google Apps Script para Iniciantes",
        "thumbnail": "https://ytimg.com",
        "publishedAt": "2026-08-25T14:00:00Z",
        "duration": "PT12M45S"
      },
      {
        "id": "v2_video_id",
        "title": "Consumindo a API do YouTube v3 sem Mistérios",
        "thumbnail": "https://ytimg.com",
        "publishedAt": "2026-08-20T18:30:00Z",
        "duration": "PT8M20S"
      },
      {
        "id": "v3_video_id",
        "title": "Dicas de Produtividade no Google Workspace",
        "thumbnail": "https://ytimg.com",
        "publishedAt": "2026-08-15T11:15:00Z",
        "duration": "PT15M02S"
      },
      {
        "id": "v4_video_id",
        "title": "Criando uma API REST com Apps Script em 10 Minutos",
        "thumbnail": "https://ytimg.com",
        "publishedAt": "2026-08-10T09:00:00Z",
        "duration": "PT10M11S"
      },
      {
        "id": "v5_video_id",
        "title": "Análise de Dados com Python e Planilhas Google",
        "thumbnail": "https://ytimg.com",
        "publishedAt": "2026-08-05T20:00:00Z",
        "duration": "PT22M35S"
      },
      {
        "id": "v6_video_id",
        "title": "Novidades do Desenvolvimento Low-Code para 2026",
        "thumbnail": "https://ytimg.com",
        "publishedAt": "2026-08-01T13:00:00Z",
        "duration": "PT6M50S"
      }
    ]
  });
}
