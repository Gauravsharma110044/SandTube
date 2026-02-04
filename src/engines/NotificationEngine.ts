/**
 * SandTube Notification Engine
 * Real-time notifications, push alerts, and email digests
 */

interface Notification {
    id: string;
    type: 'upload' | 'comment' | 'like' | 'subscribe' | 'mention' | 'milestone';
    title: string;
    message: string;
    thumbnail?: string;
    link: string;
    timestamp: number;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    metadata?: {
        videoId?: string;
        channelId?: string;
        commentId?: string;
    };
}

interface NotificationPreferences {
    uploads: boolean;
    comments: boolean;
    likes: boolean;
    subscribes: boolean;
    mentions: boolean;
    milestones: boolean;
    emailDigest: 'none' | 'daily' | 'weekly';
    pushEnabled: boolean;
}

export class NotificationEngine {
    private notifications: Notification[] = [];
    private preferences: NotificationPreferences;
    private listeners: Set<(notification: Notification) => void> = new Set();

    constructor() {
        this.loadNotifications();
        this.preferences = this.loadPreferences();
        this.requestPushPermission();
    }

    /**
     * Load notifications from localStorage
     */
    private loadNotifications(): void {
        const stored = localStorage.getItem('sandtube_notifications');
        if (stored) {
            this.notifications = JSON.parse(stored);
        }
    }

    /**
     * Save notifications to localStorage
     */
    private saveNotifications(): void {
        localStorage.setItem('sandtube_notifications', JSON.stringify(this.notifications));
    }

    /**
     * Load user preferences
     */
    private loadPreferences(): NotificationPreferences {
        const stored = localStorage.getItem('sandtube_notification_preferences');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            uploads: true,
            comments: true,
            likes: true,
            subscribes: true,
            mentions: true,
            milestones: true,
            emailDigest: 'daily',
            pushEnabled: false
        };
    }

    /**
     * Save preferences
     */
    public savePreferences(prefs: Partial<NotificationPreferences>): void {
        this.preferences = { ...this.preferences, ...prefs };
        localStorage.setItem('sandtube_notification_preferences', JSON.stringify(this.preferences));
    }

    /**
     * Request push notification permission
     */
    private async requestPushPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.preferences.pushEnabled = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.preferences.pushEnabled = permission === 'granted';
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Create a new notification
     */
    public createNotification(
        type: Notification['type'],
        title: string,
        message: string,
        options: Partial<Notification> = {}
    ): Notification {
        // Check if this type is enabled
        if (!this.preferences[type]) {
            return null as any;
        }

        const notification: Notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            message,
            timestamp: Date.now(),
            read: false,
            priority: 'medium',
            link: '/',
            ...options
        };

        this.notifications.unshift(notification);
        this.saveNotifications();

        // Trigger push notification
        if (this.preferences.pushEnabled) {
            this.sendPushNotification(notification);
        }

        // Notify listeners
        this.notifyListeners(notification);

        return notification;
    }

    /**
     * Send browser push notification
     */
    private sendPushNotification(notification: Notification): void {
        if (Notification.permission === 'granted') {
            const browserNotif = new Notification(notification.title, {
                body: notification.message,
                icon: notification.thumbnail || '/logo.svg',
                badge: '/logo.svg',
                tag: notification.id,
                requireInteraction: notification.priority === 'high',
                data: {
                    url: notification.link
                }
            });

            browserNotif.onclick = () => {
                window.focus();
                window.location.href = notification.link;
                browserNotif.close();
            };
        }
    }

    /**
     * Mark notification as read
     */
    public markAsRead(notificationId: string): void {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    /**
     * Mark all as read
     */
    public markAllAsRead(): void {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
    }

    /**
     * Delete notification
     */
    public deleteNotification(notificationId: string): void {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
    }

    /**
     * Clear all notifications
     */
    public clearAll(): void {
        this.notifications = [];
        this.saveNotifications();
    }

    /**
     * Get all notifications
     */
    public getNotifications(limit?: number): Notification[] {
        const notifs = [...this.notifications];
        return limit ? notifs.slice(0, limit) : notifs;
    }

    /**
     * Get unread count
     */
    public getUnreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    /**
     * Get notifications by type
     */
    public getNotificationsByType(type: Notification['type']): Notification[] {
        return this.notifications.filter(n => n.type === type);
    }

    /**
     * Subscribe to notifications
     */
    public subscribe(callback: (notification: Notification) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(notification: Notification): void {
        this.listeners.forEach(callback => callback(notification));
    }

    /**
     * Notify about new upload
     */
    public notifyUpload(channelName: string, videoTitle: string, videoId: string, thumbnail: string): void {
        this.createNotification(
            'upload',
            `${channelName} uploaded a new video`,
            videoTitle,
            {
                thumbnail,
                link: `/watch/${videoId}`,
                priority: 'high',
                metadata: { videoId }
            }
        );
    }

    /**
     * Notify about new comment
     */
    public notifyComment(
        authorName: string,
        commentText: string,
        videoId: string,
        commentId: string
    ): void {
        this.createNotification(
            'comment',
            `${authorName} commented on your video`,
            commentText.substring(0, 100),
            {
                link: `/watch/${videoId}#comment-${commentId}`,
                priority: 'medium',
                metadata: { videoId, commentId }
            }
        );
    }

    /**
     * Notify about new like
     */
    public notifyLike(videoTitle: string, videoId: string, count: number): void {
        if (count % 100 === 0) { // Only notify on milestones
            this.createNotification(
                'like',
                `Your video reached ${count} likes!`,
                videoTitle,
                {
                    link: `/watch/${videoId}`,
                    priority: 'low',
                    metadata: { videoId }
                }
            );
        }
    }

    /**
     * Notify about new subscriber
     */
    public notifySubscribe(subscriberName: string, channelId: string): void {
        this.createNotification(
            'subscribe',
            `${subscriberName} subscribed to your channel`,
            'You have a new subscriber!',
            {
                link: `/channel/${channelId}`,
                priority: 'medium',
                metadata: { channelId }
            }
        );
    }

    /**
     * Notify about mention
     */
    public notifyMention(
        mentionerName: string,
        context: string,
        link: string
    ): void {
        this.createNotification(
            'mention',
            `${mentionerName} mentioned you`,
            context,
            {
                link,
                priority: 'high'
            }
        );
    }

    /**
     * Notify about milestone
     */
    public notifyMilestone(
        milestone: string,
        description: string,
        link: string
    ): void {
        this.createNotification(
            'milestone',
            `Milestone achieved: ${milestone}`,
            description,
            {
                link,
                priority: 'high'
            }
        );
    }

    /**
     * Generate email digest
     */
    public generateEmailDigest(period: 'daily' | 'weekly'): string {
        const now = Date.now();
        const periodMs = period === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

        const recentNotifs = this.notifications.filter(n =>
            now - n.timestamp <= periodMs
        );

        if (recentNotifs.length === 0) {
            return 'No new notifications in this period.';
        }

        const grouped = recentNotifs.reduce((acc, notif) => {
            if (!acc[notif.type]) acc[notif.type] = [];
            acc[notif.type].push(notif);
            return acc;
        }, {} as Record<string, Notification[]>);

        let digest = `<h2>Your ${period} SandTube Digest</h2>`;

        Object.entries(grouped).forEach(([type, notifs]) => {
            digest += `<h3>${type.charAt(0).toUpperCase() + type.slice(1)}s (${notifs.length})</h3><ul>`;
            notifs.forEach(n => {
                digest += `<li><strong>${n.title}</strong>: ${n.message}</li>`;
            });
            digest += '</ul>';
        });

        return digest;
    }

    /**
     * Schedule digest emails (would integrate with backend)
     */
    public scheduleDigests(): void {
        const checkInterval = 60 * 60 * 1000; // Check every hour

        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();

            // Send daily digest at 9 AM
            if (this.preferences.emailDigest === 'daily' && hour === 9) {
                const digest = this.generateEmailDigest('daily');
                console.log('Daily digest:', digest);
                // Would send email here
            }

            // Send weekly digest on Monday at 9 AM
            if (this.preferences.emailDigest === 'weekly' && now.getDay() === 1 && hour === 9) {
                const digest = this.generateEmailDigest('weekly');
                console.log('Weekly digest:', digest);
                // Would send email here
            }
        }, checkInterval);
    }
}

// Singleton instance
export const notificationEngine = new NotificationEngine();
