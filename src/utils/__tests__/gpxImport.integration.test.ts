import { describe, it, expect, vi } from 'vitest'
import { applyGPXData } from '../gpxImport'
import { findNearestSegmentIndex } from '../geoHelpers'

describe('gpxImport integration', () => {
  it('should calculate correct distances for waypoints along route', () => {
    const mockActions = {
      clearRoute: vi.fn(),
      addPoint: vi.fn(),
      addWaypoint: vi.fn(),
      getRoutePoints: vi.fn()
    }
    
    // 実際のGPXデータに近い座標を使用
    // 東京から横浜方面への直線的なルート（約30km）
    const routePoints = [
      { lat: 35.6762, lng: 139.6503 }, // 東京駅
      { lat: 35.6595, lng: 139.7005 }, // 品川駅付近
      { lat: 35.6311, lng: 139.7394 }, // 大森駅付近
      { lat: 35.5719, lng: 139.6624 }, // 川崎駅付近
      { lat: 35.4437, lng: 139.6380 }  // 横浜駅
    ]
    
    // 大森（9.63km）と川崎（19.21km）の間で11km地点を計算
    // 11km - 9.63km = 1.37km を大森から進んだ位置
    // 大森-川崎間は9.58kmなので、約14%進んだ位置
    const oomoriLat = 35.6311
    const oomoriLng = 139.7394
    const kawasakiLat = 35.5719
    const kawasakiLng = 139.6624
    
    // 線形補間で11km地点を計算（大森から約14%の位置）
    const ratio = 1.37 / 9.58  // 約0.143
    const waypointLat = oomoriLat + (kawasakiLat - oomoriLat) * ratio
    const waypointLng = oomoriLng + (kawasakiLng - kawasakiLng) * ratio
    
    const waypoints = [
      { lat: waypointLat, lng: waypointLng, name: '11km地点', type: 'pin' as const }
    ]
    
    // ルートポイントが追加された後の状態を返すようにモック
    mockActions.getRoutePoints.mockReturnValue(
      routePoints.map((p, i) => ({ ...p, id: `${i + 1}` }))
    )
    
    applyGPXData(routePoints, waypoints, mockActions)
    
    // addWaypointに渡された引数を確認
    expect(mockActions.addWaypoint).toHaveBeenCalledTimes(1)
    const waypointCall = mockActions.addWaypoint.mock.calls[0][0]
    
    console.log('Waypoint call:', waypointCall)
    console.log('nearestPointIndex:', waypointCall.nearestPointIndex)
    console.log('distanceFromStart:', waypointCall.distanceFromStart)
    
    // 11km地点のWaypointは約11km付近の距離を持つべき
    expect(waypointCall.distanceFromStart).toBeGreaterThan(10)
    expect(waypointCall.distanceFromStart).toBeLessThan(12)
  })
  
  it('should find correct nearest point index for waypoints', () => {
    const mockActions = {
      clearRoute: vi.fn(),
      addPoint: vi.fn(),
      addWaypoint: vi.fn(),
      getRoutePoints: vi.fn()
    }
    
    // シンプルな3点のルート
    const routePoints = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 0, lng: 2 }
    ]
    
    // 各セグメント上にWaypointを配置
    const waypoints = [
      { lat: 0, lng: 0.5, name: 'Between 0-1', type: 'pin' as const },
      { lat: 0, lng: 1.5, name: 'Between 1-2', type: 'pin' as const }
    ]
    
    mockActions.getRoutePoints.mockReturnValue(
      routePoints.map((p, i) => ({ ...p, id: `${i + 1}` }))
    )
    
    applyGPXData(routePoints, waypoints, mockActions)
    
    const firstWaypoint = mockActions.addWaypoint.mock.calls[0][0]
    const secondWaypoint = mockActions.addWaypoint.mock.calls[1][0]
    
    // nearestPointIndexが正しく計算されているか確認
    expect(firstWaypoint.nearestPointIndex).toBe(0) // 最初のセグメント
    expect(secondWaypoint.nearestPointIndex).toBe(1) // 2番目のセグメント
  })
  
  it('should correctly identify nearest segment for waypoints', () => {
    // 実際のGPXデータに近い座標を使用
    const routePoints = [
      { id: '1', lat: 35.6762, lng: 139.6503 }, // 東京駅
      { id: '2', lat: 35.6595, lng: 139.7005 }, // 品川駅付近
      { id: '3', lat: 35.6311, lng: 139.7394 }, // 大森駅付近
      { id: '4', lat: 35.5719, lng: 139.6624 }, // 川崎駅付近
      { id: '5', lat: 35.4437, lng: 139.6380 }  // 横浜駅
    ]
    
    // 大森駅付近（3番目のポイント）の座標でテスト
    const waypointLat = 35.6311
    const waypointLng = 139.7394
    
    const nearestIndex = findNearestSegmentIndex(waypointLat, waypointLng, routePoints)
    
    console.log('Nearest segment index:', nearestIndex)
    console.log('Expected index: 1 or 2 (segments around 大森)')
    
    // 大森駅は正確に3番目のポイントなので、
    // nearestIndexは1（品川-大森）または2（大森-川崎）のいずれか
    expect([1, 2]).toContain(nearestIndex)
  })
})