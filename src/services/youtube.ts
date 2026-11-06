import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtube = axios.create({
    baseURL: BASE_URL,
    params: {
        key: API_KEY,
    }
});

// YouTube API returns HTML entities (&amp; &#39; ...) in text fields; decode them.
const decodeEntities = (text: any) => {
    if (typeof text !== 'string' || !text.includes('&')) return text;
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
};
const cleanItem = (item: any) => {
    if (item?.snippet) {
        item.snippet.title = decodeEntities(item.snippet.title);
        item.snippet.description = decodeEntities(item.snippet.description);
        item.snippet.channelTitle = decodeEntities(item.snippet.channelTitle);
    }
    return item;
};
const cleanItems = (items: any[]) => (items || []).map(cleanItem);

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
        return cleanItems(response.data.items);
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
        return cleanItems(response.data.items);
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

    let videoDetails: any[] = [];
    let channelDetails: any[] = [];
    try {
        const [videosResponse, channelsResponse] = await Promise.all([
            youtube.get('/videos', { params: { part: 'snippet,contentDetails,statistics', id: videoIds } }),
            youtube.get('/channels', { params: { part: 'snippet,statistics', id: channelIds } })
        ]);
        videoDetails = videosResponse.data.items;
        channelDetails = channelsResponse.data.items;
    } catch (error: any) {
        console.error("YouTube API Error (Enrich):", error.response?.data?.error?.message || error.message);
    }

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
        return cleanItem(response.data.items[0]);
    } catch (error: any) {
        console.error("YouTube API Error (VideoDetails):", error.response?.data?.error?.message || error.message);
        // Fallback for mock videos if they are opened directly
        const mock = MOCK_VIDEOS.find(v => v.id === videoId);
        return mock || null;
    }
};

// Add statistics and duration (search results don't carry them).
const withDetails = async (items: any[]) => {
    const ids = items.map((i: any) => i.id?.videoId || i.id).filter(Boolean).join(',');
    if (!ids) return items;
    try {
        const r = await youtube.get('/videos', { params: { part: 'contentDetails,statistics', id: ids } });
        const byId: any = {};
        (r.data.items || []).forEach((v: any) => { byId[v.id] = v; });
        return items.map((i: any) => {
            const d = byId[i.id?.videoId || i.id];
            return d ? { ...i, statistics: d.statistics, contentDetails: d.contentDetails } : i;
        });
    } catch {
        return items;
    }
};

export const getRelatedVideos = async (videoId: string) => {
    // YouTube removed the relatedToVideoId search option, so build "related" from
    // a search on this video's title, falling back to popular videos.
    try {
        const detail = await youtube.get('/videos', { params: { part: 'snippet', id: videoId } });
        const title = decodeEntities(detail.data.items?.[0]?.snippet?.title || '');
        const q = title.split(/\s+/).slice(0, 6).join(' ');
        if (q) {
            const response = await youtube.get('/search', {
                params: { part: 'snippet', q, type: 'video', maxResults: 12 }
            });
            const items = cleanItems(response.data.items || []).filter((i: any) => i.id?.videoId && i.id.videoId !== videoId);
            if (items.length > 0) return await withDetails(items);
        }
        throw new Error('No related results');
    } catch (error: any) {
        console.error("YouTube API Error (Related):", error.response?.data?.error?.message || error.message);
        try {
            const popular = await getPopularVideos();
            return popular
                .filter((v: any) => v.id !== videoId && !String(v.id).endsWith('_mock'))
                .map((v: any) => ({ ...v, id: { videoId: v.id } }));
        } catch {
            return [];
        }
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

const isoToSeconds = (iso?: string) => {
    const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '');
    if (!m) return 9999;
    return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0');
};

export const getShorts = async () => {
    try {
        const response = await youtube.get('/search', {
            params: {
                part: 'snippet',
                q: '#shorts sand art satisfying',
                type: 'video',
                videoDuration: 'short',
                maxResults: 30
            }
        });

        const seen = new Set<string>();
        const searchItems = (response.data.items || []).filter((item: any) => {
            const id = item.id?.videoId;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });
        if (searchItems.length === 0) return [];

        const statsResponse = await youtube.get('/videos', {
            params: {
                part: 'statistics,contentDetails',
                id: searchItems.map((item: any) => item.id.videoId).join(',')
            }
        });
        const videoDetails = statsResponse.data.items || [];

        return searchItems
            .map((item: any) => {
                const details = videoDetails.find((v: any) => v.id === item.id.videoId);
                return {
                    ...item,
                    snippet: { ...item.snippet, title: decodeEntities(item.snippet.title) },
                    statistics: details?.statistics,
                    contentDetails: details?.contentDetails
                };
            })
            .filter((v: any) => v.contentDetails && isoToSeconds(v.contentDetails.duration) <= 60);
    } catch (error: any) {
        console.error("YouTube API Error (Shorts):", error.response?.data?.error?.message || error.message);
        return [];
    }
};
