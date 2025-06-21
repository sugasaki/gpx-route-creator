export const MAP_CONSTANTS = {
  // Map style
  STYLE_URL: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  
  // Initial view state
  INITIAL_VIEW_STATE: {
    longitude: 139.7528, // Tokyo Imperial Palace
    latitude: 35.6854,
    zoom: 14
  },
  
  // Interaction thresholds
  HOVER_THRESHOLD_PIXELS: 20 as const,
  
  // Colors
  COLORS: {
    LINE: '#3b82f6',
    MARKER_FIRST: '#3b82f6',
    MARKER_LAST: '#f59e0b',
    MARKER_MIDDLE: '#6b7280',
    MARKER_SELECTED: '#10b981',
    MARKER_DRAGGING: '#ef4444'
  },
  
  // Line styles
  LINE_WIDTH: 4,
  LINE_OPACITY: 0.8,
  LINE_HOVER_WIDTH: 12,
  LINE_HOVER_OPACITY: 0.2
} as const