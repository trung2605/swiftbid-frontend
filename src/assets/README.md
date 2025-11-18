# Assets Folder

This folder contains static assets used throughout the application.

## Structure

- **images/**: Store all image files (PNG, JPG, SVG, etc.)
- **fonts/**: Store custom font files (WOFF, WOFF2, TTF, etc.)
- **icons/**: Store icon files (SVG, PNG)

## Usage Example

```javascript
import logo from '../../assets/images/logo.png';
import customFont from '../../assets/fonts/custom-font.woff2';
import icon from '../../assets/icons/star.svg';

// In component
<img src={logo} alt="Logo" />
```

## Best Practices

1. Use SVG for icons when possible (better scalability)
2. Optimize images before adding them (use tools like TinyPNG)
3. Use descriptive file names (e.g., `product-placeholder.png`)
4. Keep file sizes small for better performance
