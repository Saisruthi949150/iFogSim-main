# Fog Computing Optimization Dashboard

**Part 3: Web Dashboard Visualization**

## Overview

This is a static web dashboard designed to visualize and compare the performance of three optimization algorithms used in fog computing simulations:

- **SCPSO** (Sequence Cover Particle Swarm Optimization)
- **SCCSO** (Sequence Cover Cat Swarm Optimization)
- **GWO** (Grey Wolf Optimization)

The dashboard displays four key performance metrics:
1. Execution Time (ms)
2. Average Delay (ms)
3. Energy Consumption (J)
4. Network Usage (Bytes)

## Folder Structure

```
dashboard/
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Chart creation and data handling
└── README.md       # This file
```

## Technologies Used

- **HTML5**: Page structure and content
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Interactive functionality
- **Chart.js v4.4.0**: Bar chart visualization library (loaded via CDN)

## How to Run the Dashboard

### Method 1: Direct File Opening (Simplest)

1. Navigate to the `dashboard` folder in your file explorer
2. Double-click on `index.html`
3. The dashboard will open in your default web browser

### Method 2: Using a Local Web Server (Recommended)

#### Option A: Python HTTP Server

**For Python 3:**
```bash
# Navigate to the dashboard folder
cd dashboard

# Start the server
python -m http.server 8000
```

**For Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

Then open your browser and go to: `http://localhost:8000`

#### Option B: Node.js HTTP Server

If you have Node.js installed:
```bash
# Install http-server globally (one-time setup)
npm install -g http-server

# Navigate to the dashboard folder
cd dashboard

# Start the server
http-server
```

Then open your browser and go to: `http://localhost:8080`

#### Option C: VS Code Live Server

If you're using Visual Studio Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Features

### 1. Algorithm Information Cards
- Three cards displaying each algorithm's full name
- Color-coded for easy identification

### 2. Performance Metrics Visualization
- Four interactive bar charts (one for each metric)
- Color-coded bars for each algorithm:
  - **SCPSO**: Blue
  - **SCCSO**: Green
  - **GWO**: Yellow/Gold
- Hover tooltips showing exact values
- Responsive design that adapts to screen size

### 3. Summary Comparison Table
- Comprehensive table showing all metrics side-by-side
- Easy-to-read format for quick comparison
- Highlights the best performer for each metric

### 4. Responsive Design
- Works on desktop, tablet, and mobile devices
- Grid layout automatically adjusts to screen size
- Touch-friendly interface for mobile users

## Data Source

The dashboard currently uses **sample/hardcoded data** that represents typical performance values for the three algorithms. The data is defined in `script.js` within the `performanceData` object.

### Current Sample Data:

| Algorithm | Execution Time (ms) | Delay (ms) | Energy (J) | Network Usage (Bytes) |
|-----------|---------------------|------------|------------|----------------------|
| SCPSO     | 125.5               | 45.2       | 185.3      | 1024.5               |
| SCCSO     | 138.7               | 52.1       | 198.6      | 1156.8               |
| GWO       | 142.3               | 48.9       | 192.4      | 1089.2               |

### Updating with Real Data

To use actual simulation results:

1. Open `script.js`
2. Locate the `performanceData` object (around line 20)
3. Replace the sample values with your actual results from `results.csv`
4. Save the file and refresh the browser

**Example:**
```javascript
const performanceData = {
    scpso: {
        executionTime: YOUR_SCPSO_EXECUTION_TIME,
        delay: YOUR_SCPSO_DELAY,
        energy: YOUR_SCPSO_ENERGY,
        networkUsage: YOUR_SCPSO_NETWORK_USAGE
    },
    // ... update other algorithms similarly
};
```

## Browser Compatibility

The dashboard works on all modern browsers:
- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Opera

**Note:** Internet Explorer is not supported. Please use a modern browser.

## Troubleshooting

### Charts Not Displaying

1. **Check Internet Connection**: Chart.js is loaded from a CDN. Ensure you have internet access.
2. **Check Browser Console**: Press F12 to open developer tools and check for JavaScript errors.
3. **Clear Browser Cache**: Try refreshing the page with Ctrl+F5 (Windows) or Cmd+Shift+R (Mac).

### Layout Issues

1. **Zoom Level**: Ensure browser zoom is set to 100%
2. **Screen Resolution**: The dashboard is optimized for 1920x1080 but works on smaller screens
3. **Browser Compatibility**: Try a different browser if issues persist

### Data Not Updating

1. **Hard Refresh**: Clear cache and reload (Ctrl+F5 or Cmd+Shift+R)
2. **Check JavaScript File**: Ensure `script.js` is in the same folder as `index.html`
3. **Check File Paths**: All files should be in the same `dashboard` folder

## Project Context

### How This Dashboard Fits into the Overall Project

**Part 1**: Core iFogSim simulation system (Java)
- Implements fog computing architecture
- Runs optimization algorithms (SCPSO, SCCSO, GWO)
- Generates performance metrics
- Outputs results to `results.csv`

**Part 2**: Python-based plotting (Completed)
- Reads data from `results.csv`
- Creates static PNG graphs
- Located in `visualizer/plot_results.py`

**Part 3**: Web Dashboard (This component)
- Interactive web-based visualization
- User-friendly interface for reviewers
- No backend required (static frontend only)
- Complements Part 2 with interactive charts

### Design Philosophy

This dashboard is designed to be:
- **Simple**: Easy to understand for non-technical reviewers
- **Clear**: Visual comparisons make performance differences obvious
- **Professional**: Academic presentation suitable for capstone project
- **Accessible**: Works without installation or complex setup

## Future Enhancements (Optional)

If you want to extend this dashboard in the future, consider:
- Loading data dynamically from `results.csv` using JavaScript File API
- Adding export functionality (PDF, PNG)
- Implementing data filtering and sorting
- Adding more chart types (line charts, radar charts)
- Creating algorithm-specific detail pages

## Support

For issues or questions:
1. Check this README first
2. Review the code comments in `script.js` and `style.css`
3. Check browser console for error messages

## License

This dashboard is part of a final-year engineering capstone project.

---

**Last Updated**: Dashboard created for Part 3 of iFogSim Optimization Project
