import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtube = axios.create({
    baseURL: BASE_URL,
    params: {
        key: API_KEY,
    }
});

// Mock Data for Fallback
const MOCK_VIDEOS = [
    {
        id: "v1_mock",
        snippet: {
            title: "Expert Sand Art: Creating a Desert Oasis",
            channelTitle: "Sand Master",
            channelId: "ch1",
            publishedAt: new Date().toISOString(),
            thumbnails: { high: { url: "https://images.unsplash.com/photo-1509316785289-025f5d846b35?w=800" }, default: { url: "https://i.pravatar.cc/150?u=ch1" } },
            description: "Amazing sand art demonstration."
        },
        statistics: { viewCount: "125000" },
        contentDetails: { duration: "PT5M30S" }
    },
    {
        id: "v2_mock",
        snippet: {
            title: "Miniature Sand Sculptures - Step by Step",
            channelTitle: "Grain by Grain",
            channelId: "ch2",
            publishedAt: new Date().toISOString(),
            thumbnails: { high: { url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800" }, default: { url: "https://i.pravatar.cc/150?u=ch2" } },
            description: "Learn how to make tiny sand castles."
        },
        statistics: { viewCount: "89000" },
        contentDetails: { duration: "PT12M45S" }
    },
    {
        id: "v3_mock",
        snippet: {
            title: "The Physics of Sand: Why it Flows",
            channelTitle: "Science of Sand",
            channelId: "ch3",
            publishedAt: new Date().toISOString(),
            thumbnails: { high: { url: "https://images.unsplash.com/photo-1533240332313-0db49b459ad0?w=800" }, default: { url: "https://i.pravatar.cc/150?u=ch3" } },
            description: "Exploring the interesting properties of sand grains."
        },
        statistics: { viewCount: "450000" },
        contentDetails: { duration: "PT8M15S" }
    }
];

export const getPopularVideos = async () => {
    try {
        const response = await youtube.get('/videos', {
            params: {
                part: 'snippet,contentDetails,statistics',
                chart: 'mostPopular',
                maxResults: 20,
                regionCode: 'US'
            }
        });
        return response.data.items;
    } catch (error: any) {
        console.error("YouTube API Error (Popular):", error.response?.data?.error?.message || error.message);
        return MOCK_VIDEOS; // Fallback to mock data
    }
};

export const searchVideos = async (query: string, filters: any = {}) => {
    try {
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
    } catch (error: any) {
        console.error("YouTube API Error (Search):", error.response?.data?.error?.message || error.message);
        // Filter mock results for basic search fallback
        return MOCK_VIDEOS.filter(v =>
            v.snippet.title.toLowerCase().includes(query.toLowerCase()) ||
            query === "All" || query.length < 3
        ).map(v => ({ ...v, id: { videoId: v.id } }));
    }
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
    try {
        const response = await youtube.get('/videos', {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId
            }
        });
        return response.data.items[0];
    } catch (error: any) {
        console.error("YouTube API Error (VideoDetails):", error.response?.data?.error?.message || error.message);
        // Fallback for mock videos if they are opened directly
        const mock = MOCK_VIDEOS.find(v => v.id === videoId);
        return mock || null;
    }
};

export const getRelatedVideos = async (videoId: string) => {
    try {
        const response = await youtube.get('/search', {
            params: {
                part: 'snippet',
                relatedToVideoId: videoId,
                type: 'video',
                maxResults: 10
            }
        });
        return response.data.items || [];
    } catch (error: any) {
        console.error("YouTube API Error (Related):", error.response?.data?.error?.message || error.message);
        // Fallback: return popular videos as "related"
        return MOCK_VIDEOS.map(v => ({ ...v, id: { videoId: v.id } }));
    }
};

export const getChannelDetails = async (channelId: string) => {
    try {
        const response = await youtube.get('/channels', {
            params: {
                part: 'snippet,statistics,brandingSettings',
                id: channelId
            }
        });
        return response.data.items[0] || null;
    } catch (error: any) {
        console.error("YouTube API Error (ChannelDetails):", error.response?.data?.error?.message || error.message);
        return null;
    }
};

export const getChannelVideos = async (channelId: string) => {
    try {
        const response = await youtube.get('/search', {
            params: {
                part: 'snippet',
                channelId: channelId,
                order: 'date',
                type: 'video',
                maxResults: 20
            }
        });
        return response.data.items || [];
    } catch (error: any) {
        console.error("YouTube API Error (ChannelVideos):", error.response?.data?.error?.message || error.message);
        return [];
    }
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
    try {
        const response = await youtube.get('/commentThreads', {
            params: {
                part: 'snippet,replies',
                videoId: videoId,
                maxResults: 50,
                order: 'relevance'
            }
        });
        return response.data.items;
    } catch (error: any) {
        console.error("YouTube API Error (Comments):", error.response?.data?.error?.message || error.message);
        return [];
    }
};

export const getShorts = async () => {
    try {
        const response = await youtube.get('/search', {
            params: {
                part: 'snippet',
                q: '#shorts sand art',
                type: 'video',
                videoDuration: 'short',
                maxResults: 10
            }
        });

        const searchItems = response.data.items;
        if (!searchItems || searchItems.length === 0) return [];

        const videoIds = searchItems.map((item: any) => item.id.videoId).join(',');

        const statsResponse = await youtube.get('/videos', {
            params: {
                part: 'statistics,contentDetails',
                id: videoIds
            }
        });

        const videoDetails = statsResponse.data.items;

        return searchItems.map((item: any) => {
            const details = videoDetails.find((v: any) => v.id === item.id.videoId);
            return {
                ...item,
                statistics: details?.statistics,
                contentDetails: details?.contentDetails
            };
        });
    } catch (error: any) {
        console.error("YouTube API Error (Shorts):", error.response?.data?.error?.message || error.message);
        return [];
    }
};
