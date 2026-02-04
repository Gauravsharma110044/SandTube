/**
 * Backend API Service for SandTube Engines
 * Provides real-time sync with Firebase and REST API endpoints
 */

import { database } from '../config/firebase.ts';
import { ref, set, get, push, onValue, update, remove, query, orderByChild, limitToLast } from 'firebase/database';

export class BackendAPI {
    /**
     * Videos API
     */
    static async createVideo(videoData: any) {
        const videoRef = push(ref(database, 'videos'));
        await set(videoRef, {
            ...videoData,
            createdAt: Date.now(),
            views: 0,
            likes: 0,
            dislikes: 0
        });
        return videoRef.key;
    }

    static async getAllVideos() {
        const videosRef = ref(database, 'videos');
        const snapshot = await get(videosRef);
        const videos: any[] = [];
        snapshot.forEach((child) => {
            videos.push({ id: child.key, ...child.val() });
        });
        return videos;
    }

    static async getVideosByChannel(channelId: string) {
        const videosRef = ref(database, 'videos');
        const snapshot = await get(videosRef);
        const videos: any[] = [];
        snapshot.forEach((child) => {
            const video = child.val();
            if (video.snippet?.channelId === channelId) {
                videos.push({ id: child.key, ...video });
            }
        });
        return videos;
    }

    static async getVideo(videoId: string) {
        const snapshot = await get(ref(database, `videos/${videoId}`));
        return snapshot.val();
    }

    static async updateVideoStats(videoId: string, stats: any) {
        await update(ref(database, `videos/${videoId}`), stats);
    }

    static async deleteVideo(videoId: string) {
        await remove(ref(database, `videos/${videoId}`));
        // Also remove comments and analytics
        await remove(ref(database, `comments/${videoId}`));
        await remove(ref(database, `analytics/${videoId}`));
        await remove(ref(database, `likes/${videoId}`));
        await remove(ref(database, `dislikes/${videoId}`));
    }

    /**
     * Comments API - Real-time
     */
    static async postComment(videoId: string, commentData: any) {
        const commentRef = push(ref(database, `comments/${videoId}`));
        await set(commentRef, {
            ...commentData,
            timestamp: Date.now(),
            likes: 0,
            replies: []
        });
        return commentRef.key;
    }

    static subscribeToComments(videoId: string, callback: (comments: any[]) => void) {
        const commentsRef = ref(database, `comments/${videoId}`);
        return onValue(commentsRef, (snapshot) => {
            const comments: any[] = [];
            snapshot.forEach((child) => {
                comments.push({ id: child.key, ...child.val() });
            });
            callback(comments);
        });
    }

    static async deleteComment(videoId: string, commentId: string) {
        await remove(ref(database, `comments/${videoId}/${commentId}`));
    }

    static async likeComment(videoId: string, commentId: string) {
        const commentRef = ref(database, `comments/${videoId}/${commentId}/likes`);
        const snapshot = await get(commentRef);
        const currentLikes = snapshot.val() || 0;
        await set(commentRef, currentLikes + 1);
    }

    /**
     * Likes/Dislikes API - Real-time
     */
    static async likeVideo(videoId: string, userId: string) {
        const likeRef = ref(database, `likes/${videoId}/${userId}`);
        const dislikeRef = ref(database, `dislikes/${videoId}/${userId}`);

        // Remove dislike if exists
        await remove(dislikeRef);

        // Toggle like
        const snapshot = await get(likeRef);
        if (snapshot.exists()) {
            await remove(likeRef);
            return { action: 'removed' };
        } else {
            await set(likeRef, true);
            return { action: 'added' };
        }
    }

    static async dislikeVideo(videoId: string, userId: string) {
        const likeRef = ref(database, `likes/${videoId}/${userId}`);
        const dislikeRef = ref(database, `dislikes/${videoId}/${userId}`);

        // Remove like if exists
        await remove(likeRef);

        // Toggle dislike
        const snapshot = await get(dislikeRef);
        if (snapshot.exists()) {
            await remove(dislikeRef);
            return { action: 'removed' };
        } else {
            await set(dislikeRef, true);
            return { action: 'added' };
        }
    }

    static async getLikedVideosByUser(userId: string) {
        const videosRef = ref(database, 'videos');
        const snapshot = await get(videosRef);

        const videoPromises: Promise<any>[] = [];
        snapshot.forEach((child) => {
            const videoId = child.key;
            videoPromises.push(
                get(ref(database, `likes/${videoId}/${userId}`)).then(likeSnap => {
                    if (likeSnap.exists()) {
                        return { id: videoId, ...child.val() };
                    }
                    return null;
                })
            );
        });

        const results = await Promise.all(videoPromises);
        return results.filter(v => v !== null);
    }

    static subscribeToLikes(videoId: string, callback: (count: number) => void) {
        const likesRef = ref(database, `likes/${videoId}`);
        return onValue(likesRef, (snapshot) => {
            const count = snapshot.size;
            callback(count);
        });
    }

    static subscribeToDislikes(videoId: string, callback: (count: number) => void) {
        const dislikesRef = ref(database, `dislikes/${videoId}`);
        return onValue(dislikesRef, (snapshot) => {
            const count = snapshot.size;
            callback(count);
        });
    }

    /**
     * Analytics API - Real-time
     */
    static async trackView(videoId: string, userId: string, watchDuration: number) {
        const viewRef = push(ref(database, `analytics/${videoId}/views`));
        await set(viewRef, {
            userId,
            watchDuration,
            timestamp: Date.now()
        });

        // Update total view count
        const videoRef = ref(database, `videos/${videoId}/views`);
        const snapshot = await get(videoRef);
        const currentViews = snapshot.val() || 0;
        await set(videoRef, currentViews + 1);
    }

    static async getAnalytics(videoId: string) {
        const snapshot = await get(ref(database, `analytics/${videoId}`));
        return snapshot.val();
    }

    static subscribeToViewCount(videoId: string, callback: (count: number) => void) {
        const viewsRef = ref(database, `videos/${videoId}/views`);
        return onValue(viewsRef, (snapshot) => {
            callback(snapshot.val() || 0);
        });
    }

    /**
     * Notifications API - Real-time
     */
    static async createNotification(userId: string, notificationData: any) {
        const notifRef = push(ref(database, `notifications/${userId}`));
        await set(notifRef, {
            ...notificationData,
            timestamp: Date.now(),
            read: false
        });
        return notifRef.key;
    }

    static subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
        const notifRef = query(
            ref(database, `notifications/${userId}`),
            orderByChild('timestamp'),
            limitToLast(50)
        );
        return onValue(notifRef, (snapshot) => {
            const notifications: any[] = [];
            snapshot.forEach((child) => {
                notifications.push({ id: child.key, ...child.val() });
            });
            callback(notifications.reverse());
        });
    }

    static async markNotificationAsRead(userId: string, notificationId: string) {
        await update(ref(database, `notifications/${userId}/${notificationId}`), {
            read: true
        });
    }

    /**
     * Subscriptions API - Real-time
     */
    static async subscribe(userId: string, channelId: string) {
        await set(ref(database, `subscriptions/${userId}/${channelId}`), true);

        // Update subscriber count
        const channelRef = ref(database, `channels/${channelId}/subscribers`);
        const snapshot = await get(channelRef);
        const currentSubs = snapshot.val() || 0;
        await set(channelRef, currentSubs + 1);
    }

    static async unsubscribe(userId: string, channelId: string) {
        await remove(ref(database, `subscriptions/${userId}/${channelId}`));

        // Update subscriber count
        const channelRef = ref(database, `channels/${channelId}/subscribers`);
        const snapshot = await get(channelRef);
        const currentSubs = snapshot.val() || 0;
        await set(channelRef, Math.max(0, currentSubs - 1));
    }

    static subscribeToSubscriberCount(channelId: string, callback: (count: number) => void) {
        const subsRef = ref(database, `channels/${channelId}/subscribers`);
        return onValue(subsRef, (snapshot) => {
            callback(snapshot.val() || 0);
        });
    }

    static async isSubscribed(userId: string, channelId: string): Promise<boolean> {
        const snapshot = await get(ref(database, `subscriptions/${userId}/${channelId}`));
        return snapshot.exists();
    }

    static async getUserSubscriptions(userId: string) {
        const subsRef = ref(database, `subscriptions/${userId}`);
        const snapshot = await get(subsRef);
        const subs: string[] = [];
        snapshot.forEach((child) => {
            subs.push(child.key);
        });
        return subs;
    }

    /**
     * Channels API
     */
    static async updateChannelProfile(userId: string, profileData: any) {
        await update(ref(database, `channels/${userId}`), {
            ...profileData,
            updatedAt: Date.now()
        });
    }

    static async getChannelProfile(userId: string) {
        const snapshot = await get(ref(database, `channels/${userId}`));
        return snapshot.val();
    }

    /**
     * Watch Later API
     */
    static async addToWatchLater(userId: string, videoId: string, videoData: any) {
        await set(ref(database, `watchLater/${userId}/${videoId}`), {
            ...videoData,
            savedAt: Date.now()
        });
    }

    static async removeFromWatchLater(userId: string, videoId: string) {
        await remove(ref(database, `watchLater/${userId}/${videoId}`));
    }

    static async getWatchLaterByUser(userId: string) {
        const wlRef = ref(database, `watchLater/${userId}`);
        const snapshot = await get(wlRef);
        const videos: any[] = [];
        snapshot.forEach((child) => {
            videos.push({ id: child.key, ...child.val() });
        });
        // Sort by savedAt descending
        return videos.sort((a, b) => b.savedAt - a.savedAt);
    }

    /**
     * Search API
     */
    static async searchVideos(query: string) {
        // This would typically use Algolia or Elasticsearch for better search
        // For now, using Firebase query
        const videosRef = ref(database, 'videos');
        const snapshot = await get(videosRef);

        const results: any[] = [];
        snapshot.forEach((child) => {
            const video = child.val();
            if (video.title?.toLowerCase().includes(query.toLowerCase()) ||
                video.description?.toLowerCase().includes(query.toLowerCase())) {
                results.push({ id: child.key, ...video });
            }
        });

        return results;
    }

    /**
     * Trending API
     */
    static async getTrendingVideos(limit: number = 20) {
        const videosRef = query(
            ref(database, 'videos'),
            orderByChild('views'),
            limitToLast(limit)
        );
        const snapshot = await get(videosRef);

        const videos: any[] = [];
        snapshot.forEach((child) => {
            videos.push({ id: child.key, ...child.val() });
        });

        return videos.reverse();
    }

    /**
     * User Presence - Real-time
     */
    static async setUserOnline(userId: string) {
        await set(ref(database, `presence/${userId}`), {
            online: true,
            lastSeen: Date.now()
        });
    }

    static async setUserOffline(userId: string) {
        await set(ref(database, `presence/${userId}`), {
            online: false,
            lastSeen: Date.now()
        });
    }

    static subscribeToUserPresence(userId: string, callback: (online: boolean) => void) {
        const presenceRef = ref(database, `presence/${userId}/online`);
        return onValue(presenceRef, (snapshot) => {
            callback(snapshot.val() || false);
        });
    }

    /**
     * Live Streaming API
     */
    static async startLiveStream(channelId: string, streamData: any) {
        const streamRef = push(ref(database, 'live-streams'));
        await set(streamRef, {
            ...streamData,
            channelId,
            startedAt: Date.now(),
            viewers: 0,
            active: true
        });
        return streamRef.key;
    }

    static async endLiveStream(streamId: string) {
        await update(ref(database, `live-streams/${streamId}`), {
            active: false,
            endedAt: Date.now()
        });
    }

    static subscribeToLiveViewers(streamId: string, callback: (count: number) => void) {
        const viewersRef = ref(database, `live-streams/${streamId}/viewers`);
        return onValue(viewersRef, (snapshot) => {
            callback(snapshot.val() || 0);
        });
    }

    /**
     * Super Chat API
     */
    static async sendSuperChat(streamId: string, superChatData: any) {
        const chatRef = push(ref(database, `super-chats/${streamId}`));
        await set(chatRef, {
            ...superChatData,
            timestamp: Date.now()
        });
        return chatRef.key;
    }

    static subscribeToSuperChats(streamId: string, callback: (chats: any[]) => void) {
        const chatsRef = query(
            ref(database, `super-chats/${streamId}`),
            orderByChild('timestamp'),
            limitToLast(100)
        );
        return onValue(chatsRef, (snapshot) => {
            const chats: any[] = [];
            snapshot.forEach((child) => {
                chats.push({ id: child.key, ...child.val() });
            });
            callback(chats);
        });
    }

    /**
     * Premium Subscription API
     */
    static async saveUserPreference(userId: string, key: string, value: any) {
        await set(ref(database, `preferences/${userId}/${key}`), value);
    }

    static async getUserPreference(userId: string, key: string): Promise<any> {
        const snapshot = await get(ref(database, `preferences/${userId}/${key}`));
        return snapshot.val();
    }

    static subscribeToUserPreference(userId: string, key: string, callback: (value: any) => void) {
        const prefRef = ref(database, `preferences/${userId}/${key}`);
        return onValue(prefRef, (snapshot) => {
            callback(snapshot.val());
        });
    }

    static async createWatchParty(userId: string, videoId: string) {
        const partyId = Math.random().toString(36).substring(7).toUpperCase();
        const partyData = {
            hostId: userId,
            videoId,
            currentTime: 0,
            isPlaying: true,
            members: { [userId]: true }
        };
        await set(ref(database, `watchParties/${partyId}`), partyData);
        return partyId;
    }

    static subscribeToWatchParty(partyId: string, callback: (data: any) => void) {
        const partyRef = ref(database, `watchParties/${partyId}`);
        return onValue(partyRef, (snapshot) => {
            callback(snapshot.val());
        });
    }

    static async updateWatchParty(partyId: string, updates: any) {
        await update(ref(database, `watchParties/${partyId}`), updates);
    }

    static async getPremiumStatus(userId: string): Promise<boolean> {
        const snapshot = await get(ref(database, `premium/${userId}`));
        return snapshot.exists() && snapshot.val().active;
    }

    static subscribeToPremiumStatus(userId: string, callback: (active: boolean) => void) {
        const premiumRef = ref(database, `premium/${userId}/active`);
        return onValue(premiumRef, (snapshot) => {
            callback(snapshot.val() || false);
        });
    }

    static async subscribeToPremium(userId: string, plan: string) {
        await set(ref(database, `premium/${userId}`), {
            active: true,
            plan,
            subscribedAt: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        });
    }

    static async cancelPremium(userId: string) {
        await update(ref(database, `premium/${userId}`), {
            active: false,
            cancelledAt: Date.now()
        });
    }

    /**
     * Downloads API (Premium Feature)
     */
    static async saveOfflineVideo(userId: string, video: any) {
        const downloadRef = ref(database, `downloads/${userId}/${video.id.videoId || video.id}`);
        await set(downloadRef, {
            ...video,
            downloadedAt: Date.now()
        });
    }

    static async getOfflineVideos(userId: string) {
        const snapshot = await get(ref(database, `downloads/${userId}`));
        const videos: any[] = [];
        snapshot.forEach((child) => {
            videos.push({ id: child.key, ...child.val() });
        });
        return videos;
    }
}

export default BackendAPI;
