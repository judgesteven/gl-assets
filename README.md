# GameLayer Assets

A complete, production-ready demo application showcasing GameLayer's gamification platform. This repository provides ready-made UI components and integration examples that developers can use as a reference for building their own GameLayer-powered applications.

## 🎯 What is GameLayer?

GameLayer is a comprehensive gamification platform that provides APIs for:
- **Player Management** - User profiles, levels, and progression
- **Missions & Challenges** - Dynamic task creation and completion tracking
- **Leaderboards** - Competitive rankings and social features
- **Rewards & Achievements** - Recognition and incentive systems
- **Real-time Updates** - Live data synchronization

## 🚀 Features

This demo application includes:

### 📱 **Profile Component**
- Player statistics and progress tracking
- Level progression visualization
- Achievement display
- Real-time data updates

### 🎮 **Missions Component**
- Dynamic mission loading from API
- Mission completion tracking
- Progress visualization
- Category-based organization

### 🏆 **Leaderboard Component**
- Real-time player rankings
- Pagination support
- Current user highlighting
- Score-based sorting

### 🎁 **Rewards Component**
- Available rewards display
- Expiry date tracking
- Stock management
- Category filtering

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Custom Properties
- **API**: GameLayer REST API
- **Build**: No build step required - pure HTML/CSS/JS
- **Server**: Simple HTTP server (Python/Node.js)

## 📦 Installation

### Prerequisites
- Modern web browser
- Python 3.x or Node.js
- GameLayer API credentials

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/gamelayer/assets.git
   cd assets
   ```

2. **Configure your API credentials**
   
   Open `js/api.js` and update the configuration:
   ```javascript
   this.config = {
       baseURL: 'https://api.gamelayer.co/api/v0',
       apiKey: 'YOUR_API_KEY_HERE',
       defaultPlayer: 'YOUR_PLAYER_ID',
       accountId: 'YOUR_ACCOUNT_ID'
   };
   ```

3. **Start the development server**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   ```

4. **Open your browser**
   Navigate to `http://localhost:8000`

## 🔧 Configuration

### API Configuration

The application uses a centralized API configuration in `js/api.js`:

```javascript
class GameLayerAPI {
    constructor(config = {}) {
        this.config = {
            baseURL: 'https://api.gamelayer.co/api/v0',
            apiKey: 'your-api-key',
            defaultPlayer: 'player-id',
            accountId: 'account-id',
            ...config
        };
    }
}
```

### Component Configuration

Each component can be configured independently:

```javascript
// Initialize with custom options
const profile = new ProfileComponent(api);
const missions = new MissionManager(container, { 
    playerId: 'custom-player-id',
    autoLoad: true 
});
```

## 📚 API Integration Examples

### Fetching Player Data
```javascript
const api = new GameLayerAPI();
const playerProfile = await api.getPlayerProfile('player-123');
```

### Loading Missions
```javascript
const missions = await api.getPlayerMissions('player-123');
const missionManager = new MissionManager(container);
await missionManager.loadMissions();
```

### Updating Leaderboard
```javascript
const leaderboard = new LeaderboardComponent(api);
await leaderboard.load();
```

## 🎨 Customization

### Styling
The application uses CSS Custom Properties for easy theming:

```css
:root {
    --gl-primary: #007AFF;
    --gl-secondary: #5AC8FA;
    --gl-success: #34C759;
    --gl-warning: #FF9500;
    --gl-danger: #FF3B30;
}
```

### Component Styling
Each component has its own CSS file for easy customization:
- `components/profile/profile.css`
- `components/missions/mission.css`
- `components/leaderboard/leaderboard.css`
- `components/rewards/rewards.css`

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify your API key and account ID
   - Check network connectivity
   - Ensure CORS is properly configured

2. **No Data Displayed**
   - Verify player ID exists in your account
   - Check browser console for errors
   - Ensure API endpoints are accessible

3. **Styling Issues**
   - Clear browser cache
   - Verify CSS files are loading
   - Check for CSS conflicts

### Debug Mode

Enable detailed logging by setting:
```javascript
localStorage.setItem('gamelayer-debug', 'true');
```

## 📖 API Reference

### Core Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `getPlayerProfile(playerId)` | Fetch player information | `playerId` (optional) |
| `getPlayerMissions(playerId)` | Get player's missions | `playerId` (optional) |
| `getLeaderboardWithRankings(id)` | Fetch leaderboard data | `leaderboardId` |
| `getPrizes()` | Get available rewards | None |
| `getLevels()` | Fetch level definitions | None |

### Event System

The application uses a custom event system for component communication:

```javascript
// Listen for events
document.addEventListener('mission:completed', (e) => {
    console.log('Mission completed:', e.detail);
});

// Emit events
document.dispatchEvent(new CustomEvent('player:updated', {
    detail: { playerId: 'player-123' }
}));
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.gamelayer.co](https://docs.gamelayer.co)
- **API Reference**: [api.gamelayer.co](https://api.gamelayer.co)
- **Community**: [community.gamelayer.co](https://community.gamelayer.co)
- **Issues**: [GitHub Issues](https://github.com/gamelayer/assets/issues)

## 🙏 Acknowledgments

- GameLayer team for the amazing platform
- Contributors and community members
- Open source projects that made this possible

---

**Ready to build amazing gamified experiences?** 🚀

Start with this demo, customize it for your needs, and create engaging applications that keep users motivated and engaged!

