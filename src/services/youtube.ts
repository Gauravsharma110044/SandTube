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

export const searchVideos = async (query: string, filters: any = {}) => {
    const response = await youtube.get('/search', {
        params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 20,
            ...filters
        }
    });
    return response.data.items;
};

export const getEnrichedSearchResults = async (query: string, filters: any = {}) => {
    const searchItems = await searchVideos(query, filters);
    if (!searchItems || searchItems.length === 0) return [];

    const videoIds = searchItems.map((item: any) => item.id.videoId).join(',');
    const channelIds = Array.from(new Set(searchItems.map((item: any) => item.snippet.channelId))).join(',');

    const [videosResponse, channelsResponse] = await Promise.all([
        youtube.get('/videos', { params: { part: 'snippet,contentDetails,statistics', id: videoIds } }),
        youtube.get('/channels', { params: { part: 'snippet,statistics', id: channelIds } })
    ]);

    const videoDetails = videosResponse.data.items;
    const channelDetails = channelsResponse.data.items;

    return searchItems.map((item: any) => {
        const fullVideo = videoDetails.find((v: any) => v.id === item.id.videoId);
        const fullChannel = channelDetails.find((c: any) => c.id === item.snippet.channelId);
        return {
            ...item,
            statistics: fullVideo?.statistics,
            contentDetails: fullVideo?.contentDetails,
            channelDetails: fullChannel
        };
    });
};

export const getSearchSuggestions = async (query: string) => {
    // Note: This uses a non-official endpoint often used for suggestions
    try {
        const response = await axios.get(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
        return response.data[1];
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
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
            part: 'snippet,statistics,brandingSettings',
            id: channelId
        }
    });
    return response.data.items[0];
};

export const getChannelVideos = async (channelId: string) => {
    const response = await youtube.get('/search', {
        params: {
            part: 'snippet',
            channelId: channelId,
            order: 'date',
            type: 'video',
            maxResults: 20
        }
    });
    return response.data.items;
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
