import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtube = axios.create({
    baseURL: BASE_URL,
    params: {
        key: API_KEY,
    }
});

export const getPopularVideos = async () => {
    const response = await youtube.get('/videos', {
        params: {
            part: 'snippet,contentDetails,statistics',
            chart: 'mostPopular',
            maxResults: 20,
            regionCode: 'US'
        }
    });
    return response.data.items;
};

export const searchVideos = async (query: string) => {
    const response = await youtube.get('/search', {
        params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 20
        }
    });
    return response.data.items;
};

export const getVideoDetails = async (videoId: string) => {
    const response = await youtube.get('/videos', {
        params: {
            part: 'snippet,contentDetails,statistics',
            id: videoId
        }
    });
    return response.data.items[0];
};

export const getRelatedVideos = async (videoId: string) => {
    const response = await youtube.get('/search', {
        params: {
            part: 'snippet',
            relatedToVideoId: videoId,
            type: 'video',
            maxResults: 10
        }
    });
    return response.data.items;
};

export const getChannelDetails = async (channelId: string) => {
    const response = await youtube.get('/channels', {
        params: {
            part: 'snippet,statistics',
            id: channelId
        }
    });
    return response.data.items[0];
};

// Authenticated Methods
export const getMySubscriptions = async (accessToken: string) => {
    const response = await axios.get(`${BASE_URL}/subscriptions`, {
        params: {
            part: 'snippet,contentDetails',
            mine: true,
            maxResults: 10
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.items;
};

export const getMyLikedVideos = async (accessToken: string) => {
    const response = await axios.get(`${BASE_URL}/videos`, {
        params: {
            part: 'snippet,contentDetails,statistics',
            myRating: 'like',
            maxResults: 10
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.items;
};

export const getMyChannel = async (accessToken: string) => {
    const response = await axios.get(`${BASE_URL}/channels`, {
        params: {
            part: 'snippet,statistics,contentDetails',
            mine: true
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.items[0];
};

export const getMyPlaylists = async (accessToken: string) => {
    const response = await axios.get(`${BASE_URL}/playlists`, {
        params: {
            part: 'snippet,contentDetails',
            mine: true,
            maxResults: 10
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.items;
};

export const getPlaylistItems = async (playlistId: string) => {
    const response = await youtube.get('/playlistItems', {
        params: {
            part: 'snippet,contentDetails',
            playlistId: playlistId,
            maxResults: 10
        }
    });
    return response.data.items;
};

export const getMyActivities = async (accessToken: string) => {
    const response = await axios.get(`${BASE_URL}/activities`, {
        params: {
            part: 'snippet,contentDetails',
            mine: true,
            maxResults: 20
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.items;
};

export const getVideoComments = async (videoId: string) => {
    const response = await youtube.get('/commentThreads', {
        params: {
            part: 'snippet,replies',
            videoId: videoId,
            maxResults: 50,
            order: 'relevance'
        }
    });
    return response.data.items;
};

export const getShorts = async () => {
    const response = await youtube.get('/search', {
        params: {
            part: 'snippet',
            q: '#shorts',
            type: 'video',
            videoDuration: 'short',
            maxResults: 20
        }
    });
    return response.data.items;
};
