/**
 * SandTube Engine Index
 * Central export point for all SandTube engines
 */

import { RecommendationEngine, recommendationEngine } from './RecommendationEngine.ts';
import { SearchEngine, searchEngine } from './SearchEngine.ts';
import { AnalyticsEngine, analyticsEngine } from './AnalyticsEngine.ts';
import { NotificationEngine, notificationEngine } from './NotificationEngine.ts';
import { MonetizationEngine, monetizationEngine } from './MonetizationEngine.ts';
import { ModerationEngine, moderationEngine } from './ModerationEngine.ts';
import { SocialEngine, socialEngine } from './SocialEngine.ts';
import { ContentDeliveryEngine, contentDeliveryEngine } from './ContentDeliveryEngine.ts';

export {
    RecommendationEngine, recommendationEngine,
    SearchEngine, searchEngine,
    AnalyticsEngine, analyticsEngine,
    NotificationEngine, notificationEngine,
    MonetizationEngine, monetizationEngine,
    ModerationEngine, moderationEngine,
    SocialEngine, socialEngine,
    ContentDeliveryEngine, contentDeliveryEngine
};

/**
 * Initialize all engines
 */
export const initializeEngines = () => {
    console.log('🚀 Initializing SandTube Engines...');

    // Engines are initialized as singletons on import
    console.log('✅ Recommendation Engine ready');
    console.log('✅ Search Engine ready');
    console.log('✅ Analytics Engine ready');
    console.log('✅ Notification Engine ready');
    console.log('✅ Monetization Engine ready');
    console.log('✅ Moderation Engine ready');
    console.log('✅ Social Engine ready');
    console.log('✅ Content Delivery Engine ready');

    console.log('🎉 All SandTube Engines initialized successfully!');
};

/**
 * Get engine status
 */
export const getEngineStatus = () => {
    return {
        recommendation: !!recommendationEngine,
        search: !!searchEngine,
        analytics: !!analyticsEngine,
        notification: !!notificationEngine,
        monetization: !!monetizationEngine,
        moderation: !!moderationEngine,
        social: !!socialEngine,
        contentDelivery: !!contentDeliveryEngine
    };
};
