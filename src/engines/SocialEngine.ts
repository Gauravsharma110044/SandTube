/**
 * SandTube Social Engine
 * Like/Dislike system, comments, shares, and social interactions
 */

interface SocialInteraction {
    userId: string;
    videoId: string;
    type: 'like' | 'dislike' | 'share' | 'save';
    timestamp: number;
}

interface Comment {
    id: string;
    videoId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    timestamp: number;
    likes: number;
    dislikes: number;
    replies: Comment[];
    edited: boolean;
    pinned: boolean;
    heartedByCreator: boolean;
}

interface ShareData {
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copy';
    videoId: string;
    timestamp: number;
}

export class SocialEngine {
    private interactions: Map<string, SocialInteraction[]> = new Map();
    private comments: Map<string, Comment[]> = new Map();
    private shares: ShareData[] = [];

    constructor() {
        this.loadInteractions();
        this.loadComments();
    }

    /**
     * Load interactions from storage
     */
    private loadInteractions(): void {
        const stored = localStorage.getItem('sandtube_interactions');
        if (stored) {
            this.interactions = new Map(JSON.parse(stored));
        }
    }

    /**
     * Save interactions
     */
    private saveInteractions(): void {
        localStorage.setItem('sandtube_interactions', JSON.stringify(Array.from(this.interactions.entries())));
    }

    /**
     * Load comments from storage
     */
    private loadComments(): void {
        const stored = localStorage.getItem('sandtube_comments');
        if (stored) {
            this.comments = new Map(JSON.parse(stored));
        }
    }

    /**
     * Save comments
     */
    private saveComments(): void {
        localStorage.setItem('sandtube_comments', JSON.stringify(Array.from(this.comments.entries())));
    }

    /**
     * Like a video
     */
    public likeVideo(videoId: string, userId: string): { success: boolean; action: 'added' | 'removed' } {
        const userInteractions = this.getUserInteractions(userId);
        const existingLike = userInteractions.find(i => i.videoId === videoId && i.type === 'like');
        const existingDislike = userInteractions.find(i => i.videoId === videoId && i.type === 'dislike');

        // Remove dislike if exists
        if (existingDislike) {
            this.removeInteraction(userId, videoId, 'dislike');
        }

        // Toggle like
        if (existingLike) {
            this.removeInteraction(userId, videoId, 'like');
            return { success: true, action: 'removed' };
        } else {
            this.addInteraction(userId, videoId, 'like');
            return { success: true, action: 'added' };
        }
    }

    /**
     * Dislike a video
     */
    public dislikeVideo(videoId: string, userId: string): { success: boolean; action: 'added' | 'removed' } {
        const userInteractions = this.getUserInteractions(userId);
        const existingDislike = userInteractions.find(i => i.videoId === videoId && i.type === 'dislike');
        const existingLike = userInteractions.find(i => i.videoId === videoId && i.type === 'like');

        // Remove like if exists
        if (existingLike) {
            this.removeInteraction(userId, videoId, 'like');
        }

        // Toggle dislike
        if (existingDislike) {
            this.removeInteraction(userId, videoId, 'dislike');
            return { success: true, action: 'removed' };
        } else {
            this.addInteraction(userId, videoId, 'dislike');
            return { success: true, action: 'added' };
        }
    }

    /**
     * Save video to playlist
     */
    public saveVideo(videoId: string, userId: string): boolean {
        this.addInteraction(userId, videoId, 'save');
        return true;
    }

    /**
     * Add interaction
     */
    private addInteraction(userId: string, videoId: string, type: SocialInteraction['type']): void {
        const userInteractions = this.getUserInteractions(userId);
        userInteractions.push({
            userId,
            videoId,
            type,
            timestamp: Date.now()
        });
        this.interactions.set(userId, userInteractions);
        this.saveInteractions();
    }

    /**
     * Remove interaction
     */
    private removeInteraction(userId: string, videoId: string, type: SocialInteraction['type']): void {
        const userInteractions = this.getUserInteractions(userId);
        const filtered = userInteractions.filter(i => !(i.videoId === videoId && i.type === type));
        this.interactions.set(userId, filtered);
        this.saveInteractions();
    }

    /**
     * Get user interactions
     */
    private getUserInteractions(userId: string): SocialInteraction[] {
        return this.interactions.get(userId) || [];
    }

    /**
     * Get video like count
     */
    public getLikeCount(videoId: string): number {
        let count = 0;
        this.interactions.forEach(interactions => {
            count += interactions.filter(i => i.videoId === videoId && i.type === 'like').length;
        });
        return count;
    }

    /**
     * Get video dislike count
     */
    public getDislikeCount(videoId: string): number {
        let count = 0;
        this.interactions.forEach(interactions => {
            count += interactions.filter(i => i.videoId === videoId && i.type === 'dislike').length;
        });
        return count;
    }

    /**
     * Check if user liked video
     */
    public hasUserLiked(videoId: string, userId: string): boolean {
        const userInteractions = this.getUserInteractions(userId);
        return userInteractions.some(i => i.videoId === videoId && i.type === 'like');
    }

    /**
     * Check if user disliked video
     */
    public hasUserDisliked(videoId: string, userId: string): boolean {
        const userInteractions = this.getUserInteractions(userId);
        return userInteractions.some(i => i.videoId === videoId && i.type === 'dislike');
    }

    /**
     * Post a comment
     */
    public postComment(
        videoId: string,
        userId: string,
        userName: string,
        userAvatar: string,
        text: string,
        parentCommentId?: string
    ): Comment {
        const comment: Comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            videoId,
            authorId: userId,
            authorName: userName,
            authorAvatar: userAvatar,
            text,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            replies: [],
            edited: false,
            pinned: false,
            heartedByCreator: false
        };

        if (parentCommentId) {
            // Add as reply
            const videoComments = this.getComments(videoId);
            const parentComment = this.findComment(videoComments, parentCommentId);
            if (parentComment) {
                parentComment.replies.push(comment);
                this.comments.set(videoId, videoComments);
            }
        } else {
            // Add as top-level comment
            const videoComments = this.getComments(videoId);
            videoComments.unshift(comment);
            this.comments.set(videoId, videoComments);
        }

        this.saveComments();
        return comment;
    }

    /**
     * Edit comment
     */
    public editComment(commentId: string, videoId: string, newText: string): boolean {
        const videoComments = this.getComments(videoId);
        const comment = this.findComment(videoComments, commentId);

        if (comment) {
            comment.text = newText;
            comment.edited = true;
            this.comments.set(videoId, videoComments);
            this.saveComments();
            return true;
        }

        return false;
    }

    /**
     * Delete comment
     */
    public deleteComment(commentId: string, videoId: string): boolean {
        const videoComments = this.getComments(videoId);
        const filtered = this.removeCommentById(videoComments, commentId);
        this.comments.set(videoId, filtered);
        this.saveComments();
        return true;
    }

    /**
     * Like comment
     */
    public likeComment(commentId: string, videoId: string): boolean {
        const videoComments = this.getComments(videoId);
        const comment = this.findComment(videoComments, commentId);

        if (comment) {
            comment.likes++;
            this.comments.set(videoId, videoComments);
            this.saveComments();
            return true;
        }

        return false;
    }

    /**
     * Pin comment
     */
    public pinComment(commentId: string, videoId: string): boolean {
        const videoComments = this.getComments(videoId);

        // Unpin all other comments
        videoComments.forEach(c => c.pinned = false);

        const comment = this.findComment(videoComments, commentId);
        if (comment) {
            comment.pinned = true;
            this.comments.set(videoId, videoComments);
            this.saveComments();
            return true;
        }

        return false;
    }

    /**
     * Heart comment (creator only)
     */
    public heartComment(commentId: string, videoId: string): boolean {
        const videoComments = this.getComments(videoId);
        const comment = this.findComment(videoComments, commentId);

        if (comment) {
            comment.heartedByCreator = !comment.heartedByCreator;
            this.comments.set(videoId, videoComments);
            this.saveComments();
            return true;
        }

        return false;
    }

    /**
     * Get comments for video
     */
    public getComments(videoId: string, sortBy: 'top' | 'newest' = 'top'): Comment[] {
        const comments = this.comments.get(videoId) || [];

        if (sortBy === 'top') {
            return comments.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.likes - a.likes;
            });
        } else {
            return comments.sort((a, b) => b.timestamp - a.timestamp);
        }
    }

    /**
     * Get comment count
     */
    public getCommentCount(videoId: string): number {
        const comments = this.getComments(videoId);
        let count = comments.length;

        // Count replies
        comments.forEach(comment => {
            count += this.countReplies(comment);
        });

        return count;
    }

    /**
     * Count replies recursively
     */
    private countReplies(comment: Comment): number {
        let count = comment.replies.length;
        comment.replies.forEach(reply => {
            count += this.countReplies(reply);
        });
        return count;
    }

    /**
     * Find comment by ID
     */
    private findComment(comments: Comment[], commentId: string): Comment | null {
        for (const comment of comments) {
            if (comment.id === commentId) return comment;

            const found = this.findComment(comment.replies, commentId);
            if (found) return found;
        }
        return null;
    }

    /**
     * Remove comment by ID
     */
    private removeCommentById(comments: Comment[], commentId: string): Comment[] {
        return comments.filter(comment => {
            if (comment.id === commentId) return false;
            comment.replies = this.removeCommentById(comment.replies, commentId);
            return true;
        });
    }

    /**
     * Share video
     */
    public shareVideo(
        videoId: string,
        platform: ShareData['platform'],
        videoTitle: string,
        videoUrl: string
    ): { success: boolean; url?: string } {
        this.shares.push({
            platform,
            videoId,
            timestamp: Date.now()
        });

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${encodeURIComponent(videoUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`${videoTitle} ${videoUrl}`)}`,
            email: `mailto:?subject=${encodeURIComponent(videoTitle)}&body=${encodeURIComponent(videoUrl)}`,
            copy: videoUrl
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(videoUrl);
            return { success: true };
        }

        return { success: true, url: shareUrls[platform] };
    }

    /**
     * Get share count
     */
    public getShareCount(videoId: string): number {
        return this.shares.filter(s => s.videoId === videoId).length;
    }

    /**
     * Get engagement metrics
     */
    public getEngagementMetrics(videoId: string): {
        likes: number;
        dislikes: number;
        comments: number;
        shares: number;
        ratio: number;
    } {
        const likes = this.getLikeCount(videoId);
        const dislikes = this.getDislikeCount(videoId);
        const comments = this.getCommentCount(videoId);
        const shares = this.getShareCount(videoId);

        const total = likes + dislikes;
        const ratio = total > 0 ? (likes / total) * 100 : 0;

        return { likes, dislikes, comments, shares, ratio };
    }
}

// Singleton instance
export const socialEngine = new SocialEngine();
