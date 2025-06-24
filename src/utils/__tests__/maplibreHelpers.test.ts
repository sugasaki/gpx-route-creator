import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isNearExistingWaypoint, isNearRenderedFeatures } from '../maplibreHelpers'
import { Waypoint } from '@/types'
import { MapRef } from 'react-map-gl/maplibre'

describe('maplibreHelpers', () => {
  describe('isNearExistingWaypoint', () => {
    let mockMapRef: MapRef

    beforeEach(() => {
      mockMapRef = {
        project: vi.fn()
      } as unknown as MapRef
    })

    it('should return true when click is near a waypoint', () => {
      const waypoints: Waypoint[] = [
        {
          id: '1',
          lat: 35.6762,
          lng: 139.6503,
          name: 'Test Waypoint',
          type: 'pin'
        }
      ]

      // Mock project to return a point near the click
      vi.mocked(mockMapRef.project).mockReturnValue({ x: 105, y: 205 })

      const result = isNearExistingWaypoint(100, 200, waypoints, mockMapRef)
      expect(result).toBe(true)
    })

    it('should return false when click is far from all waypoints', () => {
      const waypoints: Waypoint[] = [
        {
          id: '1',
          lat: 35.6762,
          lng: 139.6503,
          name: 'Test Waypoint',
          type: 'pin'
        }
      ]

      // Mock project to return a point far from the click
      vi.mocked(mockMapRef.project).mockReturnValue({ x: 150, y: 250 })

      const result = isNearExistingWaypoint(100, 200, waypoints, mockMapRef)
      expect(result).toBe(false)
    })

    it('should handle multiple waypoints', () => {
      const waypoints: Waypoint[] = [
        {
          id: '1',
          lat: 35.6762,
          lng: 139.6503,
          name: 'Waypoint 1',
          type: 'pin'
        },
        {
          id: '2',
          lat: 35.6795,
          lng: 139.6475,
          name: 'Waypoint 2',
          type: 'food'
        }
      ]

      // First waypoint is far, second is near
      vi.mocked(mockMapRef.project)
        .mockReturnValueOnce({ x: 150, y: 250 })
        .mockReturnValueOnce({ x: 108, y: 195 })

      const result = isNearExistingWaypoint(100, 200, waypoints, mockMapRef)
      expect(result).toBe(true)
    })

    it('should return false for empty waypoints array', () => {
      const result = isNearExistingWaypoint(100, 200, [], mockMapRef)
      expect(result).toBe(false)
    })

    it('should handle null projection result', () => {
      const waypoints: Waypoint[] = [
        {
          id: '1',
          lat: 35.6762,
          lng: 139.6503,
          name: 'Test Waypoint',
          type: 'pin'
        }
      ]

      vi.mocked(mockMapRef.project).mockReturnValue(null)

      const result = isNearExistingWaypoint(100, 200, waypoints, mockMapRef)
      expect(result).toBe(false)
    })
  })

  describe('isNearRenderedFeatures', () => {
    let mockMapRef: MapRef

    beforeEach(() => {
      mockMapRef = {
        queryRenderedFeatures: vi.fn()
      } as unknown as MapRef
    })

    it('should return true when features are found', () => {
      vi.mocked(mockMapRef.queryRenderedFeatures).mockReturnValue([{ type: 'Feature' }] as any)

      const result = isNearRenderedFeatures(100, 200, mockMapRef, {
        layers: ['test-layer']
      })
      expect(result).toBe(true)
    })

    it('should return false when no features are found', () => {
      vi.mocked(mockMapRef.queryRenderedFeatures).mockReturnValue([])

      const result = isNearRenderedFeatures(100, 200, mockMapRef, {
        layers: ['test-layer']
      })
      expect(result).toBe(false)
    })

    it('should use custom click radius pixels', () => {
      vi.mocked(mockMapRef.queryRenderedFeatures).mockReturnValue([])

      isNearRenderedFeatures(100, 200, mockMapRef, {
        layers: ['test-layer'],
        clickRadiusPixels: 20
      })

      expect(mockMapRef.queryRenderedFeatures).toHaveBeenCalledWith(
        [[80, 180], [120, 220]],
        { layers: ['test-layer'] }
      )
    })

    it('should use custom click radius multiplier', () => {
      vi.mocked(mockMapRef.queryRenderedFeatures).mockReturnValue([])

      isNearRenderedFeatures(100, 200, mockMapRef, {
        layers: ['test-layer'],
        clickRadiusMultiplier: 2.0
      })

      expect(mockMapRef.queryRenderedFeatures).toHaveBeenCalledWith(
        [[92, 192], [108, 208]], // 4 * 2.0 = 8 pixel radius
        { layers: ['test-layer'] }
      )
    })

    it('should query multiple layers', () => {
      vi.mocked(mockMapRef.queryRenderedFeatures).mockReturnValue([])

      isNearRenderedFeatures(100, 200, mockMapRef, {
        layers: ['layer1', 'layer2', 'layer3']
      })

      expect(mockMapRef.queryRenderedFeatures).toHaveBeenCalledWith(
        expect.any(Array),
        { layers: ['layer1', 'layer2', 'layer3'] }
      )
    })

    it('should handle undefined queryRenderedFeatures result', () => {
      vi.mocked(mockMapRef.queryRenderedFeatures).mockReturnValue(undefined as any)

      const result = isNearRenderedFeatures(100, 200, mockMapRef, {
        layers: ['test-layer']
      })
      expect(result).toBe(false)
    })
  })

})