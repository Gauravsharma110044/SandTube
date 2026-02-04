/**
 * SandTube Content Delivery Engine
 * Video quality adaptation, buffering, and playback optimization
 */

interface QualityLevel {
    label: string;
    height: number;
    bitrate: number;
    url: string;
}

interface BufferSegment {
    start: number;
    end: number;
    quality: string;
}

interface PlaybackStats {
    currentTime: number;
    duration: number;
    buffered: BufferSegment[];
    currentQuality: string;
    bandwidth: number;
    droppedFrames: number;
    bufferHealth: number;
}

export class ContentDeliveryEngine {
    private qualityLevels: QualityLevel[] = [];
    private currentQuality: QualityLevel | null = null;
    private autoQuality: boolean = true;
    private bandwidth: number = 0;
    private bufferTarget: number = 30; // seconds
    private playbackStats: PlaybackStats;

    constructor() {
        this.initializeQualityLevels();
        this.playbackStats = this.createDefaultStats();
        this.startBandwidthMonitoring();
    }

    /**
     * Initialize available quality levels
     */
    private initializeQualityLevels(): void {
        this.qualityLevels = [
            { label: '144p', height: 144, bitrate: 200000, url: '' },
            { label: '240p', height: 240, bitrate: 400000, url: '' },
            { label: '360p', height: 360, bitrate: 800000, url: '' },
            { label: '480p', height: 480, bitrate: 1500000, url: '' },
            { label: '720p', height: 720, bitrate: 2500000, url: '' },
            { label: '1080p', height: 1080, bitrate: 5000000, url: '' },
            { label: '1440p', height: 1440, bitrate: 9000000, url: '' },
            { label: '2160p (4K)', height: 2160, bitrate: 18000000, url: '' }
        ];
    }

    /**
     * Create default playback stats
     */
    private createDefaultStats(): PlaybackStats {
        return {
            currentTime: 0,
            duration: 0,
            buffered: [],
            currentQuality: 'auto',
            bandwidth: 0,
            droppedFrames: 0,
            bufferHealth: 100
        };
    }

    /**
     * Start monitoring bandwidth
     */
    private startBandwidthMonitoring(): void {
        // Simulate bandwidth detection
        this.estimateBandwidth();

        setInterval(() => {
            this.estimateBandwidth();
        }, 10000); // Update every 10 seconds
    }

    /**
     * Estimate current bandwidth
     */
    private async estimateBandwidth(): Promise<number> {
        // In a real implementation, this would measure actual download speeds
        // For now, we'll simulate based on connection type
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        if (connection) {
            const effectiveType = connection.effectiveType;
            const bandwidthMap: Record<string, number> = {
                'slow-2g': 500000,      // 0.5 Mbps
                '2g': 1000000,          // 1 Mbps
                '3g': 3000000,          // 3 Mbps
                '4g': 10000000          // 10 Mbps
            };

            this.bandwidth = bandwidthMap[effectiveType] || 5000000;
        } else {
            // Default to 5 Mbps if connection API not available
            this.bandwidth = 5000000;
        }

        return this.bandwidth;
    }

    /**
     * Select optimal quality based on bandwidth
     */
    public selectOptimalQuality(): QualityLevel {
        if (!this.autoQuality && this.currentQuality) {
            return this.currentQuality;
        }

        // Find highest quality that fits within bandwidth
        const availableQualities = this.qualityLevels
            .filter(q => q.bitrate <= this.bandwidth * 0.8) // Use 80% of bandwidth for safety
            .sort((a, b) => b.bitrate - a.bitrate);

        if (availableQualities.length === 0) {
            return this.qualityLevels[0]; // Fallback to lowest quality
        }

        const selected = availableQualities[0];
        this.currentQuality = selected;
        this.playbackStats.currentQuality = selected.label;

        return selected;
    }

    /**
     * Set quality manually
     */
    public setQuality(qualityLabel: string): boolean {
        const quality = this.qualityLevels.find(q => q.label === qualityLabel);

        if (quality) {
            this.currentQuality = quality;
            this.autoQuality = false;
            this.playbackStats.currentQuality = quality.label;
            return true;
        }

        return false;
    }

    /**
     * Enable auto quality
     */
    public enableAutoQuality(): void {
        this.autoQuality = true;
        this.selectOptimalQuality();
    }

    /**
     * Get available quality levels
     */
    public getAvailableQualities(): QualityLevel[] {
        return [...this.qualityLevels];
    }

    /**
     * Calculate buffer health
     */
    public calculateBufferHealth(currentTime: number, buffered: TimeRanges): number {
        if (buffered.length === 0) return 0;

        let bufferedAhead = 0;

        for (let i = 0; i < buffered.length; i++) {
            const start = buffered.start(i);
            const end = buffered.end(i);

            if (currentTime >= start && currentTime <= end) {
                bufferedAhead = end - currentTime;
                break;
            }
        }

        // Calculate health as percentage of target buffer
        const health = Math.min((bufferedAhead / this.bufferTarget) * 100, 100);
        this.playbackStats.bufferHealth = health;

        return health;
    }

    /**
     * Adaptive bitrate streaming logic
     */
    public adaptBitrate(bufferHealth: number): void {
        if (!this.autoQuality) return;

        // If buffer is low, reduce quality
        if (bufferHealth < 30) {
            const currentIndex = this.qualityLevels.findIndex(q => q === this.currentQuality);
            if (currentIndex > 0) {
                this.currentQuality = this.qualityLevels[currentIndex - 1];
                this.playbackStats.currentQuality = this.currentQuality.label;
            }
        }
        // If buffer is healthy and bandwidth allows, increase quality
        else if (bufferHealth > 80) {
            this.selectOptimalQuality();
        }
    }

    /**
     * Preload video segments
     */
    public async preloadSegments(
        currentTime: number,
        duration: number,
        segmentDuration: number = 10
    ): Promise<void> {
        const segmentsToPreload = Math.ceil(this.bufferTarget / segmentDuration);
        const startSegment = Math.floor(currentTime / segmentDuration);

        for (let i = 0; i < segmentsToPreload; i++) {
            const segmentIndex = startSegment + i;
            const segmentStart = segmentIndex * segmentDuration;

            if (segmentStart >= duration) break;

            // In real implementation, would fetch segment here
            await this.fetchSegment();
        }
    }

    /**
     * Fetch video segment (placeholder)
     */
    private async fetchSegment(): Promise<void> {
        // Simulate network delay
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    /**
     * Handle playback stall
     */
    public handleStall(): void {
        // Reduce quality on stall
        if (this.autoQuality) {
            const currentIndex = this.qualityLevels.findIndex(q => q === this.currentQuality);
            if (currentIndex > 0) {
                this.currentQuality = this.qualityLevels[Math.max(0, currentIndex - 2)];
                this.playbackStats.currentQuality = this.currentQuality.label;
            }
        }
    }

    /**
     * Get playback statistics
     */
    public getPlaybackStats(): PlaybackStats {
        return { ...this.playbackStats };
    }

    /**
     * Update playback stats
     */
    public updateStats(stats: Partial<PlaybackStats>): void {
        this.playbackStats = { ...this.playbackStats, ...stats };
    }

    /**
     * Calculate optimal buffer size based on connection
     */
    public calculateOptimalBuffer(): number {
        if (this.bandwidth < 1000000) return 15; // 15s for slow connections
        if (this.bandwidth < 3000000) return 20; // 20s for medium connections
        return 30; // 30s for fast connections
    }

    /**
     * Enable/disable hardware acceleration
     */
    public setHardwareAcceleration(enabled: boolean): void {
        // This would interact with video element settings
        localStorage.setItem('sandtube_hw_accel', enabled.toString());
    }

    /**
     * Get recommended quality for device
     */
    public getRecommendedQuality(screenHeight: number): QualityLevel {
        // Match quality to screen resolution
        const matchingQualities = this.qualityLevels.filter(q => q.height <= screenHeight);

        if (matchingQualities.length === 0) {
            return this.qualityLevels[0];
        }

        // Return highest quality that fits screen
        return matchingQualities[matchingQualities.length - 1];
    }

    /**
     * Optimize for mobile data saving
     */
    public enableDataSaver(): void {
        // Limit to 480p max on mobile data
        const maxQuality = this.qualityLevels.find(q => q.label === '480p');
        if (maxQuality) {
            this.currentQuality = maxQuality;
            this.autoQuality = false;
        }
    }

    /**
     * Get CDN server based on location (simplified)
     */
    public selectCDNServer(): string {
        // In real implementation, would use geolocation
        const servers = [
            'cdn-us-east.sandtube.com',
            'cdn-us-west.sandtube.com',
            'cdn-eu.sandtube.com',
            'cdn-asia.sandtube.com'
        ];

        // Simple random selection for demo
        return servers[Math.floor(Math.random() * servers.length)];
    }

    /**
     * Generate thumbnail sprites for scrubbing
     */
    public generateThumbnailSprite(videoId: string, duration: number): {
        url: string;
        interval: number;
        columns: number;
        rows: number;
    } {
        const interval = 10; // Thumbnail every 10 seconds
        const totalThumbs = Math.ceil(duration / interval);
        const columns = 10;
        const rows = Math.ceil(totalThumbs / columns);

        return {
            url: `/thumbnails/${videoId}_sprite.jpg`,
            interval,
            columns,
            rows
        };
    }
}

// Singleton instance
export const contentDeliveryEngine = new ContentDeliveryEngine();
