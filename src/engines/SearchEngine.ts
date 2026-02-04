/**
 * SandTube Search Engine
 * Advanced search with filters, autocomplete, and ranking
 */

interface SearchResult {
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    viewCount: number;
    relevanceScore: number;
}

interface SearchFilters {
    uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
    duration?: 'short' | 'medium' | 'long';
    sortBy?: 'relevance' | 'date' | 'viewCount' | 'rating';
    channelId?: string;
}

export class SearchEngine {
    private searchHistory: string[] = [];
    private searchCache: Map<string, SearchResult[]> = new Map();

    constructor() {
        this.loadSearchHistory();
    }

    /**
     * Load search history from localStorage
     */
    private loadSearchHistory(): void {
        this.searchHistory = JSON.parse(localStorage.getItem('sandtube_search_history') || '[]');
    }

    /**
     * Save search to history
     */
    public saveSearch(query: string): void {
        if (!query.trim()) return;

        this.searchHistory = [
            query,
            ...this.searchHistory.filter(q => q !== query)
        ].slice(0, 50);

        localStorage.setItem('sandtube_search_history', JSON.stringify(this.searchHistory));
    }

    /**
     * Get search suggestions based on query
     */
    public getSuggestions(query: string, limit: number = 10): string[] {
        if (!query.trim()) return this.searchHistory.slice(0, limit);

        const lowerQuery = query.toLowerCase();

        // Filter history for matches
        const historySuggestions = this.searchHistory
            .filter(item => item.toLowerCase().includes(lowerQuery))
            .slice(0, 5);

        // Common search patterns
        const commonSuggestions = [
            `${query} tutorial`,
            `${query} review`,
            `${query} explained`,
            `how to ${query}`,
            `${query} 2026`
        ].filter(s => !historySuggestions.includes(s));

        return [...historySuggestions, ...commonSuggestions].slice(0, limit);
    }

    /**
     * Calculate relevance score for a search result
     */
    private calculateRelevance(result: any, query: string): number {
        const lowerQuery = query.toLowerCase();
        const titleLower = result.snippet.title.toLowerCase();
        const descLower = (result.snippet.description || '').toLowerCase();

        let score = 0;

        // Exact title match (highest priority)
        if (titleLower === lowerQuery) score += 100;

        // Title starts with query
        if (titleLower.startsWith(lowerQuery)) score += 50;

        // Title contains query
        if (titleLower.includes(lowerQuery)) score += 30;

        // Description contains query
        if (descLower.includes(lowerQuery)) score += 10;

        // Query words in title
        const queryWords = lowerQuery.split(' ');
        queryWords.forEach(word => {
            if (titleLower.includes(word)) score += 5;
        });

        // Boost recent videos
        const daysSincePublish = (Date.now() - new Date(result.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublish < 7) score += 15;
        else if (daysSincePublish < 30) score += 10;

        // Boost popular videos
        const viewCount = parseInt(result.statistics?.viewCount || '0');
        if (viewCount > 1000000) score += 20;
        else if (viewCount > 100000) score += 10;
        else if (viewCount > 10000) score += 5;

        return score;
    }

    /**
     * Apply search filters
     */
    private applyFilters(results: any[], filters: SearchFilters): any[] {
        let filtered = [...results];

        // Upload date filter
        if (filters.uploadDate) {
            const now = Date.now();
            const timeRanges = {
                hour: 60 * 60 * 1000,
                today: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000,
                year: 365 * 24 * 60 * 60 * 1000
            };

            const range = timeRanges[filters.uploadDate];
            filtered = filtered.filter(r => {
                const publishTime = new Date(r.snippet.publishedAt).getTime();
                return now - publishTime <= range;
            });
        }

        // Duration filter (requires video details)
        if (filters.duration) {
            // This would need actual duration data from video details
            // For now, we'll skip this filter
        }

        // Channel filter
        if (filters.channelId) {
            filtered = filtered.filter(r => r.snippet.channelId === filters.channelId);
        }

        return filtered;
    }

    /**
     * Sort search results
     */
    private sortResults(results: any[], sortBy: string): any[] {
        switch (sortBy) {
            case 'date':
                return results.sort((a, b) =>
                    new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
                );
            case 'viewCount':
                return results.sort((a, b) =>
                    parseInt(b.statistics?.viewCount || '0') - parseInt(a.statistics?.viewCount || '0')
                );
            case 'rating':
                return results.sort((a, b) => {
                    const ratingA = parseInt(a.statistics?.likeCount || '0') / Math.max(parseInt(a.statistics?.viewCount || '1'), 1);
                    const ratingB = parseInt(b.statistics?.likeCount || '0') / Math.max(parseInt(b.statistics?.viewCount || '1'), 1);
                    return ratingB - ratingA;
                });
            case 'relevance':
            default:
                return results; // Already sorted by relevance
        }
    }

    /**
     * Perform search with ranking and filters
     */
    public async search(
        query: string,
        filters: SearchFilters = {},
        useCache: boolean = true
    ): Promise<SearchResult[]> {
        const cacheKey = `${query}_${JSON.stringify(filters)}`;

        // Check cache
        if (useCache && this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey)!;
        }

        // Save to history
        this.saveSearch(query);

        try {
            // This would integrate with your YouTube API service
            // For now, returning empty array as placeholder
            const results: any[] = [];

            // Calculate relevance scores
            const scoredResults = results.map(result => ({
                ...result,
                relevanceScore: this.calculateRelevance(result, query)
            }));

            // Apply filters
            let filtered = this.applyFilters(scoredResults, filters);

            // Sort results
            filtered = this.sortResults(filtered, filters.sortBy || 'relevance');

            // Cache results
            this.searchCache.set(cacheKey, filtered);

            return filtered;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    /**
     * Clear search history
     */
    public clearHistory(): void {
        this.searchHistory = [];
        localStorage.removeItem('sandtube_search_history');
    }

    /**
     * Remove specific search from history
     */
    public removeFromHistory(query: string): void {
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        localStorage.setItem('sandtube_search_history', JSON.stringify(this.searchHistory));
    }

    /**
     * Get popular searches (trending)
     */
    public getPopularSearches(): string[] {
        // This would come from a backend analytics service
        // For now, returning mock data
        return [
            'Sand art tutorials',
            'Beach destinations 2026',
            'Desert photography',
            'Minimalist design',
            'Tech reviews'
        ];
    }

    /**
     * Voice search processing
     */
    public async voiceSearch(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                reject(new Error('Speech recognition not supported'));
                return;
            }

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };

            recognition.onerror = (event: any) => {
                reject(new Error(event.error));
            };

            recognition.start();
        });
    }
}

// Singleton instance
export const searchEngine = new SearchEngine();
