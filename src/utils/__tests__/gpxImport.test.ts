import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  isValidGPXFile, 
  processGPXFile, 
  confirmRouteReplacement, 
  applyGPXData 
} from '../gpxImport'
import * as gpxParser from '../gpxParser'

// モック
vi.mock('../gpxParser')

describe('gpxImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('isValidGPXFile', () => {
    it('should return true for .gpx files', () => {
      const file = new File(['content'], 'route.gpx', { type: 'application/gpx+xml' })
      expect(isValidGPXFile(file)).toBe(true)
    })
    
    it('should return true for .GPX files (uppercase)', () => {
      const file = new File(['content'], 'route.GPX', { type: 'application/gpx+xml' })
      expect(isValidGPXFile(file)).toBe(true)
    })
    
    it('should return false for non-gpx files', () => {
      const file = new File(['content'], 'route.txt', { type: 'text/plain' })
      expect(isValidGPXFile(file)).toBe(false)
    })
  })
  
  describe('processGPXFile', () => {
    it('should process GPX file and return parsed data', async () => {
      const mockFileContent = '<?xml version="1.0"?><gpx></gpx>'
      const mockParsedData = {
        routePoints: [{ lat: 35.6812, lng: 139.7671, elevation: 10 }],
        waypoints: [{ lat: 35.6813, lng: 139.7672, name: 'Test', type: 'pin' as const }]
      }
      
      vi.mocked(gpxParser.readFileAsText).mockResolvedValue(mockFileContent)
      vi.mocked(gpxParser.parseGPX).mockReturnValue(mockParsedData)
      
      const file = new File(['content'], 'route.gpx')
      const result = await processGPXFile(file)
      
      expect(gpxParser.readFileAsText).toHaveBeenCalledWith(file)
      expect(gpxParser.parseGPX).toHaveBeenCalledWith(mockFileContent)
      expect(result).toEqual(mockParsedData)
    })
  })
  
  describe('confirmRouteReplacement', () => {
    it('should return true if no existing route', () => {
      const result = confirmRouteReplacement(false)
      expect(result).toBe(true)
    })
    
    it('should show confirm dialog if has existing route', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      const result = confirmRouteReplacement(true)
      
      expect(confirmSpy).toHaveBeenCalledWith(
        'This will replace the existing route. Do you want to continue?'
      )
      expect(result).toBe(true)
      
      confirmSpy.mockRestore()
    })
    
    it('should return false if user cancels', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      const result = confirmRouteReplacement(true)
      
      expect(result).toBe(false)
      
      confirmSpy.mockRestore()
    })
  })
  
  describe('applyGPXData', () => {
    it('should apply route points and waypoints to store', () => {
      const mockActions = {
        clearRoute: vi.fn(),
        addPoint: vi.fn(),
        addWaypoint: vi.fn()
      }
      
      const routePoints = [
        { lat: 35.6812, lng: 139.7671, elevation: 10 },
        { lat: 35.6813, lng: 139.7672, elevation: 11 }
      ]
      
      const waypoints = [
        { lat: 35.6814, lng: 139.7673, name: 'Waypoint 1', type: 'pin' as const },
        { lat: 35.6815, lng: 139.7674, name: 'Waypoint 2', type: 'food' as const }
      ]
      
      applyGPXData(routePoints, waypoints, mockActions)
      
      // clearRouteが最初に呼ばれることを確認
      expect(mockActions.clearRoute).toHaveBeenCalledTimes(1)
      expect(mockActions.clearRoute).toHaveBeenCalledBefore(mockActions.addPoint as any)
      
      // 各ルートポイントが追加されることを確認
      expect(mockActions.addPoint).toHaveBeenCalledTimes(2)
      expect(mockActions.addPoint).toHaveBeenNthCalledWith(1, {
        lat: 35.6812,
        lng: 139.7671,
        elevation: 10
      })
      expect(mockActions.addPoint).toHaveBeenNthCalledWith(2, {
        lat: 35.6813,
        lng: 139.7672,
        elevation: 11
      })
      
      // 各ウェイポイントが追加されることを確認
      expect(mockActions.addWaypoint).toHaveBeenCalledTimes(2)
      expect(mockActions.addWaypoint).toHaveBeenNthCalledWith(1, waypoints[0])
      expect(mockActions.addWaypoint).toHaveBeenNthCalledWith(2, waypoints[1])
    })
    
    it('should calculate waypoint distances when applying GPX data', () => {
      const mockActions = {
        clearRoute: vi.fn(),
        addPoint: vi.fn(),
        addWaypoint: vi.fn(),
        getRoutePoints: vi.fn()
      }
      
      const routePoints = [
        { lat: 35.6812, lng: 139.7671, elevation: 10 },
        { lat: 35.6813, lng: 139.7672, elevation: 11 }
      ]
      
      const waypoints = [
        { lat: 35.6814, lng: 139.7673, name: 'Waypoint 1', type: 'pin' as const },
        { lat: 35.6815, lng: 139.7674, name: 'Waypoint 2', type: 'food' as const }
      ]
      
      // ルートポイントが追加された後の状態を返すようにモック
      mockActions.getRoutePoints.mockReturnValue([
        { id: '1', lat: 35.6812, lng: 139.7671, elevation: 10 },
        { id: '2', lat: 35.6813, lng: 139.7672, elevation: 11 }
      ])
      
      applyGPXData(routePoints, waypoints, mockActions)
      
      // WaypointがnearestPointIndexとdistanceFromStartを含んで追加されることを確認
      expect(mockActions.addWaypoint).toHaveBeenCalledTimes(2)
      
      // 第1引数に渡されたWaypointオブジェクトを確認
      const firstWaypointCall = mockActions.addWaypoint.mock.calls[0][0]
      const secondWaypointCall = mockActions.addWaypoint.mock.calls[1][0]
      
      // nearestPointIndexとdistanceFromStartが計算されていることを確認
      expect(firstWaypointCall).toMatchObject({
        lat: 35.6814,
        lng: 139.7673,
        name: 'Waypoint 1',
        type: 'pin',
        nearestPointIndex: expect.any(Number),
        distanceFromStart: expect.any(Number)
      })
      
      expect(secondWaypointCall).toMatchObject({
        lat: 35.6815,
        lng: 139.7674,
        name: 'Waypoint 2',
        type: 'food',
        nearestPointIndex: expect.any(Number),
        distanceFromStart: expect.any(Number)
      })
    })
    
    it('should handle empty data', () => {
      const mockActions = {
        clearRoute: vi.fn(),
        addPoint: vi.fn(),
        addWaypoint: vi.fn()
      }
      
      applyGPXData([], [], mockActions)
      
      expect(mockActions.clearRoute).toHaveBeenCalledTimes(1)
      expect(mockActions.addPoint).not.toHaveBeenCalled()
      expect(mockActions.addWaypoint).not.toHaveBeenCalled()
    })
  })
})