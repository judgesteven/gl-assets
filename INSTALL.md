# Installation Guide

## Quick Setup

### 1. Download Files
Download these three files to your project:
- `mission.js` - Main component
- `mission.css` - Component styles  
- `assets.css` - Design system

### 2. Include in HTML
```html
<head>
    <link rel="stylesheet" href="assets.css">
    <link rel="stylesheet" href="mission.css">
</head>
<body>
    <!-- Your mission cards here -->
    
    <script src="mission.js"></script>
</body>
```

### 3. Configure API
Update `mission.js` with your credentials:
```javascript
const GAMELAYER_CONFIG = {
    baseURL: 'https://api.gamelayer.co/api/v0',
    apiKey: 'your-api-key-here',
    defaultPlayer: 'your-player-id',
    accountId: 'your-account-id',
    debugMode: false
};
```

### 4. Add Mission Card HTML
```html
<div class="mission-card" data-mission-id="your-mission-id">
    <!-- Copy the HTML structure from demo.html -->
</div>
```

## That's It! 🎉

The component auto-initializes and connects to your GameLayer API.

## Need Help?

- Check `demo.html` for working examples
- Review `README.md` for detailed documentation
- Create an issue on GitHub for support
