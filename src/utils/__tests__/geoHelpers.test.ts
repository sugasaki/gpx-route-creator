import { describe, it, expect } from 'vitest'
import { findNearestSegmentIndex } from '../geoHelpers'
import { calculateDistanceToWaypoint } from '../geo'
import * as turf from 'turf'

describe('geoHelpers', () => {
  describe('findNearestSegmentIndex', () => {
    it('should calculate distances correctly for Tokyo route', () => {
      const routePoints = [
        { id: '1', lat: 35.6762, lng: 139.6503 }, // 東京駅
        { id: '2', lat: 35.6595, lng: 139.7005 }, // 品川駅付近
        { id: '3', lat: 35.6311, lng: 139.7394 }, // 大森駅付近
        { id: '4', lat: 35.5719, lng: 139.6624 }, // 川崎駅付近
        { id: '5', lat: 35.4437, lng: 139.6380 }  // 横浜駅
      ]
      
      // 各セグメントの距離を計算
      console.log('\nSegment distances:')
      let totalDistance = 0
      for (let i = 0; i < routePoints.length - 1; i++) {
        const segment = turf.lineString([
          [routePoints[i].lng, routePoints[i].lat],
          [routePoints[i + 1].lng, routePoints[i + 1].lat]
        ])
        const distance = turf.lineDistance(segment, 'kilometers')
        totalDistance += distance
        console.log(`Segment ${i} (${i}-${i+1}): ${distance.toFixed(2)}km, Total: ${totalDistance.toFixed(2)}km`)
      }
      
      // 大森駅がどのセグメントに最も近いか確認
      const waypointLat = 35.6311
      const waypointLng = 139.7394
      const targetPoint = turf.point([waypointLng, waypointLat])
      
      console.log('\nDistance to each segment:')
      for (let i = 0; i < routePoints.length - 1; i++) {
        const segment = turf.lineString([
          [routePoints[i].lng, routePoints[i].lat],
          [routePoints[i + 1].lng, routePoints[i + 1].lat]
        ])
        const nearestPointOnSegment = turf.pointOnLine(segment, targetPoint)
        const distance = turf.distance(targetPoint, nearestPointOnSegment, 'kilometers')
        console.log(`Distance to segment ${i}: ${(distance * 1000).toFixed(2)}m`)
      }
      
      const nearestIndex = findNearestSegmentIndex(waypointLat, waypointLng, routePoints)
      console.log(`\nNearest segment: ${nearestIndex}`)
      
      // 大森駅は正確に3番目のポイント（インデックス2）なので、
      // そのポイントから始まるセグメント（インデックス2）が返されるべき
      expect(nearestIndex).toBe(2) // 大森-川崎セグメント
    })
    
    it('should calculate distance correctly with nearestPointIndex', () => {
      const routePoints = [
        { id: '1', lat: 35.6762, lng: 139.6503 }, // 東京駅
        { id: '2', lat: 35.6595, lng: 139.7005 }, // 品川駅付近
        { id: '3', lat: 35.6311, lng: 139.7394 }, // 大森駅付近
        { id: '4', lat: 35.5719, lng: 139.6624 }, // 川崎駅付近
        { id: '5', lat: 35.4437, lng: 139.6380 }  // 横浜駅
      ]
      
      // 大森駅ポイントでWaypointを作成（nearestPointIndex = 2）
      const waypoint = {
        id: 'test',
        lat: 35.6311,
        lng: 139.7394,
        name: 'Test',
        type: 'pin' as const,
        nearestPointIndex: 2,
        distanceFromStart: 0
      }
      
      const distance = calculateDistanceToWaypoint(waypoint, routePoints)
      
      console.log(`\nCalculated distance with nearestPointIndex=2: ${distance.toFixed(2)}km`)
      
      // nearestPointIndex=2の場合、東京→品川→大森の距離になるべき
      // 約9.63kmではなく、大森駅そのものなので累計距離も9.63kmになるはず
      expect(distance).toBeCloseTo(9.63, 1)
    })
  })
})