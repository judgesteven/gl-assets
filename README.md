# GameLayer Mission Card Component

A complete, self-contained mission card component for GameLayer gamification platforms. This component provides a beautiful, responsive UI for displaying mission information with real-time data integration.

## 🚀 Features

- **Mobile-First Design**: iOS-inspired design language with Android compatibility
- **Real-Time Data**: GameLayer API integration for live mission updates
- **Multiple States**: Active, completed, upcoming, locked, and expired missions
- **Responsive Layout**: Works seamlessly across all device sizes
- **Event-Driven**: Custom events for easy integration with your application
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Self-Contained**: No external dependencies required
- **Cross-Platform**: Works on iOS, Android, and web platforms

## 📱 Screenshots

The component includes three example states:
- **Active Mission**: Daily check-in challenge with progress tracking
- **Completed Mission**: Weekly achievement hunt with claimable rewards
- **Urgent Mission**: Time-sensitive challenge with countdown timer

## 🛠️ Quick Start

### 1. Download the Component

Download these files to your project:
- `mission.js` - Main component logic
- `mission.css` - Component-specific styles
- `assets.css` - Shared design system and utilities

### 2. Include the Files

```html
<!-- In your HTML head -->
<link rel="stylesheet" href="assets.css">
<link rel="stylesheet" href="mission.css">

<!-- Before closing body tag -->
<script src="mission.js"></script>
```

### 3. Configure Your API Credentials

Update the configuration in `mission.js`:

```javascript
const GAMELAYER_CONFIG = {
    baseURL: 'https://api.gamelayer.co/api/v0',
    apiKey: 'your-actual-api-key-here',
    defaultPlayer: 'your-player-id',
    accountId: 'your-account-id',
    debugMode: false
};
```

### 4. Add Mission Card HTML

```html
<div class="mission-card" data-mission-id="your-mission-id">
    <div class="mission-card__image" style="background: linear-gradient(135deg, #007AFF, #5AC8FA);">
        <div class="mission-card__image-placeholder">🚀</div>
        <div class="mission-card__rewards-overlay">
            <div class="mission-card__reward">
                <span class="mission-card__reward-label">⭐</span>
                <span class="mission-card__reward-value">500</span>
            </div>
            <div class="mission-card__reward">
                <span class="mission-card__reward-label">💎</span>
                <span class="mission-card__reward-value">50</span>
            </div>
        </div>
        <div class="mission-card__category-overlay">Daily</div>
    </div>
    <div class="mission-card__content">
        <div class="mission-card__header">
            <div class="mission-card__timer">⏰ 4 days remaining</div>
            <h3 class="mission-card__title">Mission Title</h3>
            <p class="mission-card__description">Mission description goes here.</p>
        </div>
        <div class="mission-card__progress">
            <div class="mission-card__progress-info">
                <span class="mission-card__progress-text">Progress</span>
                <span class="mission-card__progress-value">3/7</span>
            </div>
            <div class="mission-card__progress-bar">
                <div class="mission-card__progress-fill" style="width: 42.86%"></div>
            </div>
        </div>
        <div class="mission-card__actions">
            <button class="mission-card__btn mission-card__btn--primary">Start</button>
            <button class="mission-card__btn mission-card__btn--secondary">View Details</button>
        </div>
    </div>
</div>
```

### 5. Initialize (Auto-initializes)

The component automatically initializes when the page loads. No additional setup required!

## 🔧 Configuration

### Required API Credentials

- **Base URL**: Your GameLayer API endpoint (default: `https://api.gamelayer.co/api/v0`)
- **API Key**: Your GameLayer API key for authentication
- **Default Player**: Your player ID for API calls
- **Account ID**: Your GameLayer account ID

### API Endpoints

The component uses these GameLayer API endpoints:
- `GET /missions/{id}?account={accountId}` - Get single mission
- `GET /missions?account={accountId}` - Get all missions

### Required Headers

```javascript
{
    "Content-Type": "application/json",
    "Accept": "application/json",
    "api-key": "your-api-key"
}
```

## 📊 Data Structure

The component expects mission data with this structure:

```javascript
{
    "id": "mission-id",
    "name": "Mission Name",
    "description": "Mission description",
    "category": "daily|weekly|monthly|elite|special",
    "imgUrl": "https://example.com/mission-image.jpg", // Optional
    "active": {
        "to": "2024-01-01T00:00:00Z"  // Mission end time
    },
    "reward": {
        "points": 500,    // Points awarded upon completion
        "credits": 50     // Credits awarded upon completion
    },
    "objectives": {
        "events": [
            {
                "currentcount": 3,  // Current progress
                "count": 7          // Total required
            }
        ]
    }
}
```

## 🎯 Component States

The component automatically handles different mission states:

- **Active**: Mission in progress with countdown timer
- **Completed**: Mission finished with claimable rewards
- **Upcoming**: Mission not yet available
- **Locked**: Mission requires specific conditions to unlock
- **Expired**: Mission past its deadline

## 📡 Events

The component emits custom events for easy integration:

```javascript
// Listen for mission events
document.addEventListener('mission:primary-action', (e) => {
    console.log('Primary action:', e.detail);
    // Handle primary button clicks
});

document.addEventListener('mission:secondary-action', (e) => {
    console.log('Secondary action:', e.detail);
    // Handle secondary button clicks
});

document.addEventListener('mission:details', (e) => {
    console.log('Mission details:', e.detail);
    // Handle card clicks for details
});

document.addEventListener('mission:rendered', (e) => {
    console.log('Mission rendered:', e.detail);
    // Handle when mission data is loaded
});
```

## 🎨 Customization

### CSS Custom Properties

The component uses CSS custom properties for easy theming:

```css
:root {
    --gl-primary: #007AFF;      /* Primary brand color */
    --gl-secondary: #5856D6;    /* Secondary brand color */
    --gl-success: #34C759;      /* Success state color */
    --gl-warning: #FF9500;      /* Warning state color */
    --gl-danger: #FF3B30;       /* Danger state color */
    --gl-gray-50: #f5f5f7;      /* Light background */
    --gl-gray-900: #1d1d1f;     /* Dark text */
}
```

### Styling Overrides

You can override any component styles using standard CSS:

```css
.mission-card {
    /* Custom card styling */
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.mission-card__title {
    /* Custom title styling */
    font-size: 1.25rem;
    color: #your-brand-color;
}
```

## 📱 Responsive Design

The component is built with a mobile-first approach:

- **Mobile**: Single column layout with optimized touch targets
- **Tablet**: Responsive grid with 2-3 columns
- **Desktop**: Multi-column grid with hover effects

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Graceful degradation for older browsers

## 🚀 Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/stevenjudge/gl-assets.git
cd gl-assets

# Start local server
npm run dev
# or
python3 -m http.server 8000

# Open demo page
open http://localhost:8000/demo.html
```

### Building for Production

The component is ready for production use. Simply include the files in your project:

1. Copy `mission.js`, `mission.css`, and `assets.css` to your project
2. Update the API configuration with your credentials
3. Add the HTML structure to your pages
4. The component will auto-initialize

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the demo page for examples
- Review the code comments for implementation details

## 🔮 Roadmap

Future versions will include:
- Additional UI components (leaderboards, achievements, etc.)
- More customization options
- Enhanced accessibility features
- Performance optimizations
- TypeScript definitions

---

**Built with ❤️ for the GameLayer community**

