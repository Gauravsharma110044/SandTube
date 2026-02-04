# SandTube Engines Documentation

This directory contains all the core engines that power SandTube's advanced features. Each engine is designed as a singleton and handles specific functionality.

## 📦 Available Engines

### 1. **Recommendation Engine** (`RecommendationEngine.ts`)
Provides personalized video recommendations using collaborative filtering and content-based algorithms.

**Features:**
- Personalized recommendations based on watch history
- Trending videos calculation
- Related videos suggestions
- Similarity scoring between videos
- User preference tracking

**Usage:**
```typescript
import { recommendationEngine } from './engines';

// Get personalized recommendations
const recommendations = recommendationEngine.getRecommendations(currentVideoId, 20);

// Get trending videos
const trending = recommendationEngine.getTrending(24); // Last 24 hours

// Track user interaction
recommendationEngine.trackInteraction(videoId, 'view');
```

---

### 2. **Search Engine** (`SearchEngine.ts`)
Advanced search with filters, autocomplete, and relevance ranking.

**Features:**
- Intelligent search with relevance scoring
- Search history management
- Autocomplete suggestions
- Advanced filters (date, duration, sort)
- Voice search support
- Search caching

**Usage:**
```typescript
import { searchEngine } from './engines';

// Perform search
const results = await searchEngine.search('sand art', {
    uploadDate: 'week',
    sortBy: 'relevance'
});

// Get suggestions
const suggestions = searchEngine.getSuggestions('sand');

// Voice search
const query = await searchEngine.voiceSearch();
```

---

### 3. **Analytics Engine** (`AnalyticsEngine.ts`)
Real-time analytics, metrics tracking, and insights generation.

**Features:**
- View tracking and watch time
- Engagement metrics (likes, comments, shares)
- Traffic source tracking
- Retention curve analysis
- Revenue reporting
- Real-time metrics
- Data export (JSON/CSV)

**Usage:**
```typescript
import { analyticsEngine } from './engines';

// Track video view
analyticsEngine.trackView(videoId, watchDuration, userId);

// Track engagement
analyticsEngine.trackEngagement(videoId, 'like');

// Get analytics
const analytics = analyticsEngine.getVideoAnalytics(videoId);

// Get real-time metrics
const realtime = analyticsEngine.getRealtimeMetrics(videoId);
```

---

### 4. **Notification Engine** (`NotificationEngine.ts`)
Push notifications, email digests, and real-time alerts.

**Features:**
- Browser push notifications
- Multiple notification types (upload, comment, like, etc.)
- Email digest generation
- Notification preferences
- Real-time event listeners
- Unread count tracking

**Usage:**
```typescript
import { notificationEngine } from './engines';

// Create notification
notificationEngine.notifyUpload(channelName, videoTitle, videoId, thumbnail);

// Subscribe to notifications
const unsubscribe = notificationEngine.subscribe((notification) => {
    console.log('New notification:', notification);
});

// Get unread count
const unreadCount = notificationEngine.getUnreadCount();

// Mark as read
notificationEngine.markAsRead(notificationId);
```

---

### 5. **Monetization Engine** (`MonetizationEngine.ts`)
Ad placement, revenue tracking, and monetization features.

**Features:**
- Dynamic ad placement (pre-roll, mid-roll, post-roll)
- Revenue tracking by stream (ads, memberships, etc.)
- Super Chat processing
- Membership management
- Merchandise sales
- Earnings estimation
- Monetization eligibility checking

**Usage:**
```typescript
import { monetizationEngine } from './engines';

// Generate ad placements
const ads = monetizationEngine.generateAdPlacements(videoId, videoDuration);

// Track ad impression
monetizationEngine.trackAdImpression(videoId, adId);

// Process Super Chat
const result = monetizationEngine.processSuperChat(videoId, amount, message, userId);

// Get revenue
const revenue = monetizationEngine.getVideoRevenue(videoId);

// Estimate earnings
const estimated = monetizationEngine.estimateEarnings(views, engagementRate);
```

---

### 6. **Moderation Engine** (`ModerationEngine.ts`)
Content filtering, spam detection, and community guidelines enforcement.

**Features:**
- Toxicity analysis
- Spam detection
- Keyword filtering
- Automated moderation actions
- Manual review queue
- Custom moderation rules
- Copyright checking
- User report processing

**Usage:**
```typescript
import { moderationEngine } from './engines';

// Moderate comment
const result = moderationEngine.moderateComment(commentId, text, authorId);

// Analyze toxicity
const toxicity = moderationEngine.analyzeToxicity(text);

// Get moderation queue
const queue = moderationEngine.getModerationQueue();

// Add custom rule
moderationEngine.addRule({
    type: 'keyword',
    pattern: 'spam',
    action: 'delete',
    severity: 'high'
});
```

---

### 7. **Social Engine** (`SocialEngine.ts`)
Like/dislike system, comments, shares, and social interactions.

**Features:**
- Like/dislike functionality
- Threaded comments
- Comment editing and deletion
- Comment pinning and hearting
- Video sharing (multiple platforms)
- Engagement metrics
- Social interaction tracking

**Usage:**
```typescript
import { socialEngine } from './engines';

// Like video
const result = socialEngine.likeVideo(videoId, userId);

// Post comment
const comment = socialEngine.postComment(
    videoId, userId, userName, userAvatar, text
);

// Share video
const shareResult = socialEngine.shareVideo(
    videoId, 'twitter', videoTitle, videoUrl
);

// Get engagement metrics
const metrics = socialEngine.getEngagementMetrics(videoId);
```

---

### 8. **Content Delivery Engine** (`ContentDeliveryEngine.ts`)
Adaptive bitrate streaming, quality selection, and playback optimization.

**Features:**
- Adaptive bitrate streaming (ABR)
- Quality level selection (144p - 4K)
- Bandwidth monitoring
- Buffer health calculation
- Automatic quality adaptation
- Data saver mode
- CDN server selection
- Thumbnail sprite generation

**Usage:**
```typescript
import { contentDeliveryEngine } from './engines';

// Select optimal quality
const quality = contentDeliveryEngine.selectOptimalQuality();

// Set quality manually
contentDeliveryEngine.setQuality('1080p');

// Enable auto quality
contentDeliveryEngine.enableAutoQuality();

// Calculate buffer health
const health = contentDeliveryEngine.calculateBufferHealth(currentTime, buffered);

// Enable data saver
contentDeliveryEngine.enableDataSaver();
```

---

## 🚀 Initialization

All engines are initialized automatically as singletons when imported. To initialize all engines at once:

```typescript
import { initializeEngines, getEngineStatus } from './engines';

// Initialize all engines
initializeEngines();

// Check engine status
const status = getEngineStatus();
console.log(status);
```

---

## 💾 Data Persistence

All engines use `localStorage` for data persistence. The following keys are used:

- `sandtube_history` - Watch history
- `sandtube_liked_videos` - Liked videos
- `sandtube_search_history` - Search history
- `sandtube_analytics` - Analytics data
- `sandtube_notifications` - Notifications
- `sandtube_notification_preferences` - Notification settings
- `sandtube_revenue` - Revenue data
- `sandtube_monetization_settings` - Monetization settings
- `sandtube_moderation_rules` - Custom moderation rules
- `sandtube_moderation_actions` - Moderation actions
- `sandtube_interactions` - Social interactions
- `sandtube_comments` - Comments data

---

## 🔧 Configuration

Each engine can be configured through its respective methods. Common patterns:

```typescript
// Recommendation Engine
recommendationEngine.updateVideoDatabase(videos);

// Search Engine
searchEngine.savePreferences({ /* preferences */ });

// Notification Engine
notificationEngine.savePreferences({
    uploads: true,
    emailDigest: 'daily'
});

// Monetization Engine
monetizationEngine.saveSettings({
    adsEnabled: true,
    adTypes: { preRoll: true, midRoll: true }
});
```

---

## 🎯 Best Practices

1. **Always use singleton instances** - Import engines from `./engines/index.ts`
2. **Handle errors gracefully** - All engines return safe defaults
3. **Respect user preferences** - Check notification/monetization settings
4. **Monitor performance** - Use analytics to track engine performance
5. **Clean up listeners** - Unsubscribe from notification listeners when done

---

## 📊 Performance Considerations

- Engines use lazy loading where possible
- Data is cached to reduce localStorage reads
- Batch operations are preferred over individual calls
- Real-time features use throttling/debouncing

---

## 🔐 Privacy & Security

- All data is stored locally (localStorage)
- No data is sent to external servers without user consent
- Sensitive operations require user authentication
- Moderation engine protects against malicious content

---

## 🛠️ Future Enhancements

- [ ] IndexedDB support for larger datasets
- [ ] Web Workers for heavy computations
- [ ] Service Worker integration for offline support
- [ ] Real backend API integration
- [ ] Machine learning models for better recommendations
- [ ] Advanced analytics dashboards
- [ ] Multi-language support for moderation

---

## 📝 License

Part of the SandTube project. All rights reserved.
