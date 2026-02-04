/**
 * Demo: How to use SandTube Engines in your components
 * These examples work RIGHT NOW without any backend
 */

import {
    socialEngine,
    notificationEngine,
    analyticsEngine,
    searchEngine,
    recommendationEngine
} from '../engines';

// ✅ EXAMPLE 1: Like a video (works immediately)
export const handleLikeVideo = (videoId: string, userId: string) => {
    const result = socialEngine.likeVideo(videoId, userId);

    if (result.action === 'added') {
        // Track in analytics
        analyticsEngine.trackEngagement(videoId, 'like');

        // Send notification
        notificationEngine.notifyLike('My Video', videoId,
            socialEngine.getLikeCount(videoId)
        );
    }

    console.log(`Like count: ${socialEngine.getLikeCount(videoId)}`);
};

// ✅ EXAMPLE 2: Post a comment (works immediately)
export const handlePostComment = (
    videoId: string,
    userId: string,
    userName: string,
    text: string
) => {
    const comment = socialEngine.postComment(
        videoId, userId, userName,
        'https://i.pravatar.cc/150',
        text
    );

    // Track in analytics
    analyticsEngine.trackEngagement(videoId, 'comment');

    // Notify video owner
    notificationEngine.notifyComment(userName, text, videoId, comment.id);

    return comment;
};

// ✅ EXAMPLE 3: Track video view (works immediately)
export const handleVideoView = (videoId: string, watchDuration: number) => {
    // Track in analytics
    analyticsEngine.trackView(videoId, watchDuration);

    // Update recommendations
    recommendationEngine.trackInteraction(videoId, 'view');

    // Get analytics
    const analytics = analyticsEngine.getVideoAnalytics(videoId);
    console.log('Video analytics:', analytics);
};

// ✅ EXAMPLE 4: Voice search (works immediately)
export const handleVoiceSearch = async () => {
    try {
        const query = await searchEngine.voiceSearch();
        console.log('Voice search query:', query);

        // Perform search
        const results = await searchEngine.search(query);
        return results;
    } catch (error) {
        console.error('Voice search failed:', error);
    }
};

// ✅ EXAMPLE 5: Get personalized recommendations (works immediately)
export const getPersonalizedFeed = () => {
    const recommendations = recommendationEngine.getRecommendations(undefined, 20);
    console.log('Personalized recommendations:', recommendations);
    return recommendations;
};

// ✅ EXAMPLE 6: Real-time notification listener (works immediately)
export const setupNotificationListener = () => {
    const unsubscribe = notificationEngine.subscribe((notification) => {
        console.log('🔔 New notification:', notification);

        // Show browser notification
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.svg'
            });
        }
    });

    return unsubscribe; // Call this to stop listening
};

// ✅ EXAMPLE 7: Get engagement metrics (works immediately)
export const getVideoMetrics = (videoId: string) => {
    const metrics = socialEngine.getEngagementMetrics(videoId);
    console.log('Engagement metrics:', metrics);
    // Returns: { likes, dislikes, comments, shares, ratio }
    return metrics;
};

// ✅ EXAMPLE 8: Share video (works immediately)
export const handleShareVideo = (
    videoId: string,
    platform: 'twitter' | 'facebook' | 'whatsapp',
    title: string
) => {
    const url = `https://sandtube.com/watch/${videoId}`;
    const result = socialEngine.shareVideo(videoId, platform, title, url);

    if (result.url) {
        window.open(result.url, '_blank');
    }

    // Track in analytics
    analyticsEngine.trackEngagement(videoId, 'share');
};

export default {
    handleLikeVideo,
    handlePostComment,
    handleVideoView,
    handleVoiceSearch,
    getPersonalizedFeed,
    setupNotificationListener,
    getVideoMetrics,
    handleShareVideo
};
