# Amy SDK - AI-Powered UI Customization for Any Website

Drop-in JavaScript SDK that adds an AI assistant to customize your website's UI in real-time.

## Quick Start

### 1. Include the SDK

```html
<!-- At the end of your <body> -->
<script src="https://your-cdn.com/amy-sdk.js"></script>
<script>
  Amy.init({
    apiUrl: 'https://your-backend.com'
  });
</script>
```

### 2. Mark Controllable Elements

Add `data-amy` attributes to elements you want Amy to control:

```html
<div data-amy="sidebar" data-amy-size="small" data-amy-order="0">
  Your sidebar content
</div>

<div data-amy="chart" data-amy-size="large" data-amy-order="1">
  Your chart component
</div>

<div data-amy="notifications" data-amy-visible="false">
  Hidden by default - Amy can show it
</div>
```

### 3. Use a Grid Container (Optional)

```html
<!-- Include optional CSS -->
<link rel="stylesheet" href="amy-sdk.min.css">

<!-- Use amy-grid class for automatic grid layout -->
<div class="amy-grid">
  <div data-amy="sidebar">...</div>
  <div data-amy="main">...</div>
</div>
```

## Configuration Options

```javascript
Amy.init({
  // Required
  apiUrl: 'https://your-backend.com',
  
  // Optional
  theme: 'dark',           // 'dark' | 'light' | 'auto'
  accentColor: '#ff444f',  // Any hex color
  position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  language: 'en',
  
  // Widget customization
  bubbleSize: 60,          // Chat bubble size in pixels
  panelWidth: 380,         // Chat panel width
  panelHeight: 500,        // Chat panel max height
  zIndex: 9999,
  
  // Custom greeting
  greeting: "Hi! I'm Amy, your AI assistant...",
  
  // Debug mode
  debug: false
});
```

## Data Attributes

| Attribute | Description | Values |
|-----------|-------------|--------|
| `data-amy` | Component name (required) | Any unique string |
| `data-amy-size` | Initial size | `small`, `medium`, `large`, `full` |
| `data-amy-order` | Display order | Number (0-99) |
| `data-amy-visible` | Initial visibility | `true`, `false` |

## Size Reference

| Size | Grid (12-col) | Flex |
|------|---------------|------|
| `small` | 3 columns (25%) | 25% |
| `medium` | 4 columns (33%) | 33% |
| `large` | 6 columns (50%) + 2 rows | 50% |
| `full` | 12 columns (100%) | 100% |

## JavaScript API

```javascript
// Toggle chat panel
Amy.toggle();

// Manual control
Amy.show('sidebar');      // Show element
Amy.hide('sidebar');      // Hide element
Amy.resize('chart', 'full');  // Resize element
Amy.reorder('news', 0);   // Move to first position

// Theme & colors
Amy.setTheme('dark');
Amy.setAccentColor('#0066ff');

// Get state
Amy.getElements();  // Returns all tracked elements
Amy.getConfig();    // Returns current config

// Refresh after dynamic content
Amy.refresh();
```

## Events

Listen for Amy's changes:

```javascript
// Theme changed
window.addEventListener('amy:themeChange', (e) => {
  console.log('New theme:', e.detail.theme);
});

// Any UI change
window.addEventListener('amy:uiChange', (e) => {
  console.log('Changes:', e.detail);
});

// Specific events
window.addEventListener('amy:accentColorChange', (e) => {...});
window.addEventListener('amy:languageChange', (e) => {...});
```

## Website Requirements

1. **Semantic Structure**: Elements should be in a container (grid or flex)
2. **Data Attributes**: Mark controllable elements with `data-amy`
3. **CSS Variables** (Optional): Use `--amy-*` variables for theme support

### Recommended Container CSS

```css
/* Grid layout */
.amy-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

/* Or Flexbox */
.amy-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
```

### Theme Support (Optional)

Your CSS can react to theme changes:

```css
.amy-theme-dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

.amy-theme-light {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

## Example Commands Users Can Say

- "Hide the sidebar"
- "Make the chart bigger"
- "Show settings"
- "Move notifications to the top"
- "Switch to dark theme"
- "Change color to blue"
- "Make everything visible"

## Backend API

The SDK expects a POST endpoint at `{apiUrl}/chat`:

**Request:**
```json
{
  "message": "Hide the sidebar",
  "layoutDescription": "Visible: sidebar, chart, stats. Hidden: settings",
  "currentUI": {
    "theme": "light",
    "accentColor": "#ff444f"
  }
}
```

**Response:**
```json
{
  "message": "I've hidden the sidebar for you!",
  "uiChanges": {
    "components": {
      "sidebar": { "visible": false }
    },
    "theme": "dark"
  }
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT

