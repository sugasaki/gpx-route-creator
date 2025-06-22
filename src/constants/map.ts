// Map style types
export type MapStyleId = 'dark' | 'streets' | 'satellite' | 'outdoor'

export interface MapStyle {
  id: MapStyleId
  name: string
  url: string
  needsApiKey: boolean
}

// Get MapTiler API key from environment
const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_KEY

// Map styles configuration
export const MAP_STYLES: Record<MapStyleId, MapStyle> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    needsApiKey: false
  },
  streets: {
    id: 'streets',
    name: 'Streets',
    url: MAPTILER_API_KEY
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`
      : '',
    needsApiKey: true
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: MAPTILER_API_KEY
      ? `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`
      : '',
    needsApiKey: true
  },
  outdoor: {
    id: 'outdoor',
    name: 'Outdoor',
    url: MAPTILER_API_KEY
      ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_API_KEY}`
      : '',
    needsApiKey: true
  }
}

export const MAP_CONSTANTS = {
  // Default map style
  DEFAULT_STYLE: 'streets' as MapStyleId,

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