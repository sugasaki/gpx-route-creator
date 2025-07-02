import { describe, it, expect } from 'vitest'
import { RouteManager } from '../RouteManager'
import { Route } from '@/types'

describe('RouteManager', () => {
  const mockRoute: Route = {
    points: [
      { id: '1', lat: 35.6762, lng: 139.6503 },
      { id: '2', lat: 35.6795, lng: 139.6475 },
      { id: '3', lat: 35.6820, lng: 139.6450 }
    ],
    distance: 800
  }
  
  describe('addPoint', () => {
    it('should add a new point to the route', () => {
      const newPoint = { lat: 35.6850, lng: 139.6420 }
      const result = RouteManager.addPoint(mockRoute, newPoint)
      
      expect(result.points).toHaveLength(4)
      expect(result.points[3]).toMatchObject(newPoint)
      expect(result.points[3].id).toBeDefined()
      expect(result.distance).toBeGreaterThan(mockRoute.distance)
    })
    
    it('should handle empty route', () => {
      const emptyRoute: Route = { points: [], distance: 0 }
      const newPoint = { lat: 35.6762, lng: 139.6503 }
      const result = RouteManager.addPoint(emptyRoute, newPoint)
      
      expect(result.points).toHaveLength(1)
      expect(result.distance).toBe(0)
    })
  })
  
  describe('insertPoint', () => {
    it('should insert a point at specified index', () => {
      const newPoint = { lat: 35.6780, lng: 139.6490 }
      const result = RouteManager.insertPoint(mockRoute, 1, newPoint)
      
      expect(result.points).toHaveLength(4)
      expect(result.points[1]).toMatchObject(newPoint)
      expect(result.points[1].id).toBeDefined()
      expect(result.distance).toBeGreaterThan(0)
    })
    
    it('should handle insertion at beginning', () => {
      const newPoint = { lat: 35.6750, lng: 139.6510 }
      const result = RouteManager.insertPoint(mockRoute, 0, newPoint)
      
      expect(result.points[0]).toMatchObject(newPoint)
      expect(result.points).toHaveLength(4)
    })
    
    it('should handle insertion at end', () => {
      const newPoint = { lat: 35.6850, lng: 139.6420 }
      const result = RouteManager.insertPoint(mockRoute, mockRoute.points.length, newPoint)
      
      expect(result.points[3]).toMatchObject(newPoint)
      expect(result.points).toHaveLength(4)
    })
  })
  
  describe('updatePoint', () => {
    it('should update existing point', () => {
      const updates = { lat: 35.6800, lng: 139.6500 }
      const result = RouteManager.updatePoint(mockRoute, '2', updates)
      
      expect(result.points[1]).toMatchObject({
        ...mockRoute.points[1],
        ...updates
      })
      expect(result.distance).not.toBe(mockRoute.distance)
    })
    
    it('should not modify route if point not found', () => {
      const updates = { lat: 35.6800, lng: 139.6500 }
      const result = RouteManager.updatePoint(mockRoute, 'nonexistent', updates)
      
      expect(result.points).toEqual(mockRoute.points)
    })
  })
  
  describe('deletePoint', () => {
    it('should delete point by id', () => {
      const result = RouteManager.deletePoint(mockRoute, '2')
      
      expect(result.points).toHaveLength(2)
      expect(result.points.find(p => p.id === '2')).toBeUndefined()
      expect(result.distance).toBeGreaterThan(0)
    })
    
    it('should handle deletion of non-existent point', () => {
      const result = RouteManager.deletePoint(mockRoute, 'nonexistent')
      
      expect(result.points).toEqual(mockRoute.points)
      // Distance gets recalculated even if points don't change
      expect(result.distance).toBeGreaterThan(0)
    })
  })
  
  describe('deleteMultiplePoints', () => {
    it('should delete multiple points by ids', () => {
      const result = RouteManager.deleteMultiplePoints(mockRoute, ['1', '3'])
      
      expect(result.points).toHaveLength(1)
      expect(result.points[0].id).toBe('2')
    })
    
    it('should handle empty ids array', () => {
      const result = RouteManager.deleteMultiplePoints(mockRoute, [])
      
      expect(result.points).toEqual(mockRoute.points)
    })
  })
  
  describe('movePoint', () => {
    it('should move point to new location', () => {
      const result = RouteManager.movePoint(mockRoute, '2', 35.6800, 139.6500)
      
      expect(result.points[1]).toMatchObject({
        id: '2',
        lat: 35.6800,
        lng: 139.6500
      })
      expect(result.distance).not.toBe(mockRoute.distance)
    })
  })
})