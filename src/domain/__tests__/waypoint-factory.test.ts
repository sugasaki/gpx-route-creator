import { describe, it, expect, vi } from 'vitest'
import { createWaypoint } from '../waypoint-factory'
import { RoutePoint } from '@/types'
import * as idGenerator from '../id-generator'
import * as geoUtils from '@/utils/geo'

// モックの設定
vi.mock('../id-generator')
vi.mock('@/utils/geo')

describe('createWaypoint', () => {
  const mockRoutePoints: RoutePoint[] = [
    { id: '1', lat: 35.6762, lng: 139.6503 },
    { id: '2', lat: 35.6795, lng: 139.6475 },
    { id: '3', lat: 35.6820, lng: 139.6450 }
  ]
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(idGenerator.generateId).mockReturnValue('test-id-123')
    vi.mocked(geoUtils.calculateDistanceToWaypoint).mockReturnValue(1500)
  })
  
  it('should create a waypoint with generated ID', () => {
    const waypointData = {
      lat: 35.6780,
      lng: 139.6480,
      name: 'Test Waypoint',
      description: 'Test description',
      nearestPointIndex: 1
    }
    
    const waypoint = createWaypoint(waypointData, mockRoutePoints)
    
    expect(waypoint.id).toBe('test-id-123')
    expect(idGenerator.generateId).toHaveBeenCalledOnce()
  })
  
  it('should calculate distance from start', () => {
    const waypointData = {
      lat: 35.6780,
      lng: 139.6480,
      name: 'Test Waypoint',
      description: 'Test description',
      nearestPointIndex: 1
    }
    
    const waypoint = createWaypoint(waypointData, mockRoutePoints)
    
    expect(waypoint.distanceFromStart).toBe(1500)
    expect(geoUtils.calculateDistanceToWaypoint).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 35.6780,
        lng: 139.6480,
        name: 'Test Waypoint',
        description: 'Test description',
        nearestPointIndex: 1,
        id: 'test-id-123'
      }),
      mockRoutePoints
    )
  })
  
  it('should preserve all waypoint properties', () => {
    const waypointData = {
      lat: 35.6780,
      lng: 139.6480,
      name: 'Test Waypoint',
      description: 'Test description',
      nearestPointIndex: 1
    }
    
    const waypoint = createWaypoint(waypointData, mockRoutePoints)
    
    expect(waypoint).toEqual({
      lat: 35.6780,
      lng: 139.6480,
      name: 'Test Waypoint',
      description: 'Test description',
      nearestPointIndex: 1,
      id: 'test-id-123',
      distanceFromStart: 1500
    })
  })
  
  it('should handle empty route points', () => {
    const waypointData = {
      lat: 35.6780,
      lng: 139.6480,
      name: 'Test Waypoint',
      description: 'Test description',
      nearestPointIndex: 0
    }
    
    const waypoint = createWaypoint(waypointData, [])
    
    expect(waypoint.id).toBe('test-id-123')
    expect(waypoint.distanceFromStart).toBe(1500)
    expect(geoUtils.calculateDistanceToWaypoint).toHaveBeenCalledWith(
      expect.any(Object),
      []
    )
  })
})