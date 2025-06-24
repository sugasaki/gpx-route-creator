import { describe, it, expect } from 'vitest'
import { getLineGeoJSON, getMarkerColor } from '../mapHelpers'
import { RoutePoint } from '@/types'

describe('mapHelpers', () => {
  describe('getLineGeoJSON', () => {
    it('should generate correct GeoJSON for route points', () => {
      const points: RoutePoint[] = [
        { id: '1', lat: 35.6762, lng: 139.6503 },
        { id: '2', lat: 35.6795, lng: 139.6475 },
        { id: '3', lat: 35.6820, lng: 139.6450 }
      ]

      const result = getLineGeoJSON(points)

      expect(result).toEqual({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [139.6503, 35.6762],
            [139.6475, 35.6795],
            [139.6450, 35.6820]
          ]
        }
      })
    })

    it('should handle empty points array', () => {
      const result = getLineGeoJSON([])

      expect(result).toEqual({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      })
    })
  })

  describe('getMarkerColor', () => {
    it('should return red color when dragging', () => {
      expect(getMarkerColor(true, false, false, false)).toBe('#ef4444')
    })

    it('should return green color when selected', () => {
      expect(getMarkerColor(false, true, false, false)).toBe('#10b981')
    })

    it('should return blue color for first point', () => {
      expect(getMarkerColor(false, false, true, false)).toBe('#3b82f6')
    })

    it('should return orange color for last point', () => {
      expect(getMarkerColor(false, false, false, true)).toBe('#f59e0b')
    })

    it('should return gray color for regular points', () => {
      expect(getMarkerColor(false, false, false, false)).toBe('#6b7280')
    })

    it('should prioritize dragging over other states', () => {
      expect(getMarkerColor(true, true, true, true)).toBe('#ef4444')
    })
  })

})