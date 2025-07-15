# Bungendore Volunteer Rural Fire Brigade Website

## Overview

This project is a website for the Bungendore Volunteer Rural Fire Brigade. It provides information about fire preparation, fire information, membership, and events. The website also includes interactive features such as a map with markers indicating various locations and fire warnings.

## Features

- **Responsive Design**: The website is designed to be responsive and works well on various screen sizes.
- **Interactive Map**: The map displays markers for different fire warnings and locations, including the Bungendore RFS Station.
- **Dynamic Content**: The website dynamically updates content based on the bushfire danger period.
- **Dark Mode Support**: The website supports dark mode based on the user's `prefers-color-scheme` setting.
- **Optimized Assets**: Consolidated and optimized image assets and CSS for better performance.

## Technologies Used

- **HTML**: For the structure of the website.
- **CSS**: For styling the website, including responsive design and dark mode support.
- **JavaScript**: For interactive features such as the map and dynamic content updates.
- **Leaflet**: For the interactive map and markers.
- **Express.js**: Node.js web server for serving the application.

## Project Structure

```
/
├── public/
│   ├── Images/           # All website images and icons
│   ├── css/
│   │   └── main.css      # Main stylesheet (optimized)
│   ├── js/               # JavaScript files
│   └── index.html        # Main HTML file
├── Documentation/        # Project documentation
│   ├── ASSET_ORGANIZATION.md
│   └── CSS_OPTIMIZATION.md
├── favicon files         # Root-level favicon assets
└── server.js            # Express server
```

## Installation and Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Open in browser**: Navigate to `http://localhost:3000`

## Usage

### Bushfire Danger Period Indicator

The website includes a script that indicates whether the current date is within the bushfire danger period (October to the end of March). It displays a message and a table with checkboxes indicating the necessary actions.

### Interactive Map

The map displays markers for different fire warnings and locations. An additional marker for the Bungendore RFS Station is added with a custom icon and a popup that says "Bungendore RFS Station".

### Dark Mode Support

The website supports dark mode based on the user's `prefers-color-scheme` setting. The logo and background images change accordingly.

## Asset Organization

All images and icons are organized in the `/public/Images/` directory:
- **Logos**: `logo.png` (light), `logo-dark.png` (dark mode)
- **Hero Images**: `hero1.jpg`, `hero2.jpg`, `hero3.jpg`, `hero4.jpeg`
- **Alert Icons**: `advice.png`, `watch-and-act.png`, `emergency-warning.png`, `other.png`
- **Content Images**: Various images for sections and features

See `Documentation/ASSET_ORGANIZATION.md` for complete asset documentation.

## CSS Architecture

The main CSS file uses:
- **CSS Variables** for consistent theming and spacing
- **Utility Classes** for common patterns
- **Component-based Organization** for maintainability
- **Responsive Design** patterns
- **Dark Mode Support** via CSS custom properties

See `Documentation/CSS_OPTIMIZATION.md` for detailed CSS architecture information.

## Recent Optimizations (2024)

### Asset Consolidation
- Removed 45 duplicate and unused image files
- Consolidated favicon files to root directory
- Cleaned up macOS system artifacts
- Improved .gitignore for better maintenance

### CSS Optimization
- Reduced CSS file size by 37 lines (2.3% smaller)
- Removed unused CSS rules
- Consolidated duplicate styles
- Standardized naming conventions
- Reduced !important usage from 10 to 7 instances

### Performance Improvements
- Faster page load times due to fewer asset requests
- Improved maintainability with cleaner code organization
- Better caching efficiency with consolidated assets

## Contributing and Development Process

- **Main**: Protected Branch. Merged into from liveDev branch by Owner.
- **liveDev**: Combined feature testing branch, has a permanent URL for verification.
- **Individual issues and features** should be developed on their own Branch with a PR to merge into liveDev when ready.

## Documentation

Additional documentation can be found in the `/Documentation/` directory:
- `ASSET_ORGANIZATION.md` - Complete guide to image and icon assets
- `CSS_OPTIMIZATION.md` - CSS architecture and optimization details

## License

This project is for the Bungendore Volunteer Rural Fire Brigade community use.
