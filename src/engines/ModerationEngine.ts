/**
 * SandTube Moderation Engine
 * Content filtering, comment moderation, and community guidelines enforcement
 */

interface ModerationRule {
    id: string;
    type: 'keyword' | 'regex' | 'spam' | 'toxicity' | 'copyright';
    pattern: string | RegExp;
    action: 'flag' | 'hide' | 'delete' | 'warn';
    severity: 'low' | 'medium' | 'high';
}

interface ModerationAction {
    id: string;
    contentId: string;
    contentType: 'video' | 'comment' | 'description';
    action: 'flagged' | 'hidden' | 'deleted' | 'warned';
    reason: string;
    timestamp: number;
    reviewedBy?: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface ToxicityScore {
    overall: number;
    categories: {
        profanity: number;
        insult: number;
        threat: number;
        spam: number;
        sexual: number;
    };
}

export class ModerationEngine {
    private rules: ModerationRule[] = [];
    private actions: ModerationAction[] = [];
    private blockedWords: Set<string> = new Set();
    private allowedWords: Set<string> = new Set();
    private spamPatterns: RegExp[] = [];

    constructor() {
        this.initializeDefaultRules();
        this.loadCustomRules();
        this.loadActions();
    }

    /**
     * Initialize default moderation rules
     */
    private initializeDefaultRules(): void {
        // Profanity filter
        const profanityWords = [
            'spam', 'scam', 'fake', 'bot', 'click here', 'free money',
            // Add more as needed
        ];
        profanityWords.forEach(word => this.blockedWords.add(word.toLowerCase()));

        // Spam patterns
        this.spamPatterns = [
            /(.)\1{10,}/gi, // Repeated characters
            /https?:\/\/[^\s]+/gi, // URLs (can be customized)
            /\b\d{10,}\b/g, // Long numbers (phone numbers)
            /[A-Z]{10,}/g, // Excessive caps
        ];

        // Default rules
        this.rules = [
            {
                id: 'rule_spam_links',
                type: 'regex',
                pattern: /https?:\/\/[^\s]+/gi,
                action: 'flag',
                severity: 'medium'
            },
            {
                id: 'rule_excessive_caps',
                type: 'regex',
                pattern: /[A-Z]{10,}/g,
                action: 'warn',
                severity: 'low'
            },
            {
                id: 'rule_repeated_chars',
                type: 'regex',
                pattern: /(.)\1{10,}/gi,
                action: 'flag',
                severity: 'low'
            }
        ];
    }

    /**
     * Load custom rules from storage
     */
    private loadCustomRules(): void {
        const stored = localStorage.getItem('sandtube_moderation_rules');
        if (stored) {
            const customRules = JSON.parse(stored);
            this.rules = [...this.rules, ...customRules];
        }
    }

    /**
     * Load moderation actions
     */
    private loadActions(): void {
        const stored = localStorage.getItem('sandtube_moderation_actions');
        if (stored) {
            this.actions = JSON.parse(stored);
        }
    }

    /**
     * Save actions
     */
    private saveActions(): void {
        localStorage.setItem('sandtube_moderation_actions', JSON.stringify(this.actions));
    }

    /**
     * Analyze text for toxicity
     */
    public analyzeToxicity(text: string): ToxicityScore {
        const lowerText = text.toLowerCase();

        const score: ToxicityScore = {
            overall: 0,
            categories: {
                profanity: 0,
                insult: 0,
                threat: 0,
                spam: 0,
                sexual: 0
            }
        };

        // Check for blocked words
        this.blockedWords.forEach(word => {
            if (lowerText.includes(word)) {
                score.categories.profanity += 0.3;
            }
        });

        // Check spam patterns
        this.spamPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                score.categories.spam += 0.2;
            }
        });

        // Check for excessive caps (shouting)
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > 0.5) {
            score.categories.insult += 0.2;
        }

        // Check for repeated characters
        if (/(.)\1{5,}/.test(text)) {
            score.categories.spam += 0.1;
        }

        // Calculate overall score
        score.overall = Object.values(score.categories).reduce((sum, val) => sum + val, 0) / 5;
        score.overall = Math.min(score.overall, 1); // Cap at 1.0

        return score;
    }

    /**
     * Moderate comment
     */
    public moderateComment(
        commentId: string,
        text: string,
        authorId: string
    ): { allowed: boolean; reason?: string; action?: ModerationAction } {
        // Analyze toxicity
        const toxicity = this.analyzeToxicity(text);

        // Check if toxicity exceeds threshold
        if (toxicity.overall > 0.7) {
            const action = this.createAction(
                commentId,
                'comment',
                'deleted',
                'High toxicity score detected'
            );
            return { allowed: false, reason: 'Content violates community guidelines', action };
        }

        if (toxicity.overall > 0.5) {
            const action = this.createAction(
                commentId,
                'comment',
                'flagged',
                'Medium toxicity score detected'
            );
            return { allowed: true, reason: 'Content flagged for review', action };
        }

        // Check custom rules
        for (const rule of this.rules) {
            if (this.checkRule(text, rule)) {
                const action = this.createAction(
                    commentId,
                    'comment',
                    rule.action === 'delete' ? 'deleted' : rule.action === 'hide' ? 'hidden' : 'flagged',
                    `Matched rule: ${rule.id}`
                );

                if (rule.action === 'delete') {
                    return { allowed: false, reason: 'Content violates moderation rules', action };
                }

                return { allowed: true, reason: 'Content flagged', action };
            }
        }

        return { allowed: true };
    }

    /**
     * Check if text matches a rule
     */
    private checkRule(text: string, rule: ModerationRule): boolean {
        switch (rule.type) {
            case 'keyword':
                return text.toLowerCase().includes((rule.pattern as string).toLowerCase());
            case 'regex':
                return (rule.pattern as RegExp).test(text);
            case 'spam':
                return this.isSpam(text);
            case 'toxicity':
                const toxicity = this.analyzeToxicity(text);
                return toxicity.overall > 0.5;
            default:
                return false;
        }
    }

    /**
     * Check if text is spam
     */
    private isSpam(text: string): boolean {
        // Check for repeated patterns
        const words = text.split(/\s+/);
        const uniqueWords = new Set(words);

        if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
            return true; // Too much repetition
        }

        // Check spam patterns
        return this.spamPatterns.some(pattern => pattern.test(text));
    }

    /**
     * Create moderation action
     */
    private createAction(
        contentId: string,
        contentType: ModerationAction['contentType'],
        action: ModerationAction['action'],
        reason: string
    ): ModerationAction {
        const moderationAction: ModerationAction = {
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contentId,
            contentType,
            action,
            reason,
            timestamp: Date.now(),
            status: 'pending'
        };

        this.actions.push(moderationAction);
        this.saveActions();

        return moderationAction;
    }

    /**
     * Review flagged content
     */
    public reviewContent(
        actionId: string,
        decision: 'approve' | 'reject',
        reviewerId: string
    ): boolean {
        const action = this.actions.find(a => a.id === actionId);
        if (!action) return false;

        action.status = decision === 'approve' ? 'approved' : 'rejected';
        action.reviewedBy = reviewerId;
        this.saveActions();

        return true;
    }

    /**
     * Get pending moderation queue
     */
    public getModerationQueue(): ModerationAction[] {
        return this.actions.filter(a => a.status === 'pending');
    }

    /**
     * Add custom rule
     */
    public addRule(rule: Omit<ModerationRule, 'id'>): void {
        const newRule: ModerationRule = {
            id: `rule_${Date.now()}`,
            ...rule
        };
        this.rules.push(newRule);
        this.saveCustomRules();
    }

    /**
     * Remove rule
     */
    public removeRule(ruleId: string): void {
        this.rules = this.rules.filter(r => r.id !== ruleId);
        this.saveCustomRules();
    }

    /**
     * Save custom rules
     */
    private saveCustomRules(): void {
        const customRules = this.rules.filter(r => r.id.startsWith('rule_custom'));
        localStorage.setItem('sandtube_moderation_rules', JSON.stringify(customRules));
    }

    /**
     * Block word
     */
    public blockWord(word: string): void {
        this.blockedWords.add(word.toLowerCase());
        this.saveBlockedWords();
    }

    /**
     * Unblock word
     */
    public unblockWord(word: string): void {
        this.blockedWords.delete(word.toLowerCase());
        this.saveBlockedWords();
    }

    /**
     * Save blocked words
     */
    private saveBlockedWords(): void {
        localStorage.setItem('sandtube_blocked_words', JSON.stringify(Array.from(this.blockedWords)));
    }

    /**
     * Check for copyright infringement (simplified)
     */
    public checkCopyright(
        videoId: string,
        metadata: { title: string; description: string }
    ): { infringing: boolean; matches: string[] } {
        // This would integrate with a copyright detection service
        // For now, simple keyword matching
        const copyrightKeywords = ['official', 'full movie', 'full album', 'leaked'];
        const matches: string[] = [];

        const text = `${metadata.title} ${metadata.description}`.toLowerCase();

        copyrightKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                matches.push(keyword);
            }
        });

        return {
            infringing: matches.length > 0,
            matches
        };
    }

    /**
     * Auto-moderate based on user reports
     */
    public processUserReport(
        contentId: string,
        contentType: 'video' | 'comment',
        reason: string,
        reporterId: string
    ): ModerationAction {
        return this.createAction(
            contentId,
            contentType,
            'flagged',
            `User report: ${reason}`
        );
    }

    /**
     * Get moderation statistics
     */
    public getStatistics(): {
        totalActions: number;
        pending: number;
        approved: number;
        rejected: number;
        byType: Record<string, number>;
    } {
        return {
            totalActions: this.actions.length,
            pending: this.actions.filter(a => a.status === 'pending').length,
            approved: this.actions.filter(a => a.status === 'approved').length,
            rejected: this.actions.filter(a => a.status === 'rejected').length,
            byType: this.actions.reduce((acc, action) => {
                acc[action.contentType] = (acc[action.contentType] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }
}

// Singleton instance
export const moderationEngine = new ModerationEngine();
