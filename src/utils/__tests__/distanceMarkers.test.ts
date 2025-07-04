import { describe, it, expect } from 'vitest'
import { generateDistanceMarkers, filterMarkersInViewport, formatDistance, markersToGeoJSON, calculateOptimalInterval } from '../distanceMarkers'
import { RoutePoint } from '@/types'

describe('distanceMarkers', () => {
  describe('generateDistanceMarkers', () => {
    it('ルートポイントが2点未満の場合は空配列を返す', () => {
      const singlePoint: RoutePoint[] = [{ id: '1', lat: 35.681236, lng: 139.767125 }]
      expect(generateDistanceMarkers(singlePoint)).toEqual([])
      expect(generateDistanceMarkers([])).toEqual([])
    })

    it('明示的に間隔が0以下の場合は空配列を返す', () => {
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 },
        { id: '2', lat: 35.691236, lng: 139.777125 }
      ]
      expect(generateDistanceMarkers(points, 0)).toEqual([])
      expect(generateDistanceMarkers(points, -1)).toEqual([])
    })
    
    it('間隔を指定しない場合は自動計算される', () => {
      // 約3kmのルート
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 },
        { id: '2', lat: 35.691236, lng: 139.777125 },
        { id: '3', lat: 35.701236, lng: 139.787125 }
      ]
      
      const markers = generateDistanceMarkers(points)
      
      // 3km未満なので1km間隔、つまり1kmと2kmのマーカーが生成される
      expect(markers).toHaveLength(2)
      expect(markers[0].distance).toBe(1)
      expect(markers[1].distance).toBe(2)
    })

    it('1km間隔でマーカーを生成する', () => {
      // 約3kmのルート
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 },
        { id: '2', lat: 35.691236, lng: 139.777125 },
        { id: '3', lat: 35.701236, lng: 139.787125 }
      ]
      
      const markers = generateDistanceMarkers(points, 1)
      
      // 3km未満なので、1kmと2kmのマーカーが生成される
      expect(markers).toHaveLength(2)
      expect(markers[0].distance).toBe(1)
      expect(markers[1].distance).toBe(2)
      
      // 各マーカーが適切なIDを持つ
      expect(markers[0].id).toBe('marker-1')
      expect(markers[1].id).toBe('marker-2')
      
      // 各マーカーが座標を持つ
      expect(markers[0]).toHaveProperty('lat')
      expect(markers[0]).toHaveProperty('lng')
    })

    it('カスタム間隔でマーカーを生成する', () => {
      // 約5kmのルート
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 },
        { id: '2', lat: 35.701236, lng: 139.787125 },
        { id: '3', lat: 35.721236, lng: 139.807125 }
      ]
      
      const markers = generateDistanceMarkers(points, 2)
      
      // 2km間隔なので、2kmと4kmのマーカーが生成される
      expect(markers.length).toBeGreaterThanOrEqual(1)
      expect(markers[0].distance).toBe(2)
      if (markers.length > 1) {
        expect(markers[1].distance).toBe(4)
      }
    })
  })

  describe('filterMarkersInViewport', () => {
    const markers = [
      { id: '1', lat: 35.681236, lng: 139.767125, distance: 1 },
      { id: '2', lat: 35.691236, lng: 139.777125, distance: 2 },
      { id: '3', lat: 35.701236, lng: 139.787125, distance: 3 }
    ]

    it('ビューポート内のマーカーのみを返す', () => {
      const bounds = {
        north: 35.695,
        south: 35.680,
        east: 139.780,
        west: 139.765
      }
      
      const filtered = filterMarkersInViewport(markers, bounds)
      
      // マーカー1と2がビューポート内
      expect(filtered).toHaveLength(2)
      expect(filtered[0].id).toBe('1')
      expect(filtered[1].id).toBe('2')
    })

    it('ビューポート外のマーカーは含まない', () => {
      const bounds = {
        north: 35.685,
        south: 35.680,
        east: 139.770,
        west: 139.765
      }
      
      const filtered = filterMarkersInViewport(markers, bounds)
      
      // マーカー1のみがビューポート内
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('すべてのマーカーがビューポート外の場合は空配列を返す', () => {
      const bounds = {
        north: 35.670,
        south: 35.660,
        east: 139.760,
        west: 139.750
      }
      
      const filtered = filterMarkersInViewport(markers, bounds)
      expect(filtered).toEqual([])
    })
  })

  describe('formatDistance', () => {
    it('10km未満は小数点なしで表示', () => {
      expect(formatDistance(1)).toBe('1')
      expect(formatDistance(5.5)).toBe('5.5')
      expect(formatDistance(9.9)).toBe('9.9')
    })

    it('10km以上は整数で表示', () => {
      expect(formatDistance(10)).toBe('10')
      expect(formatDistance(10.4)).toBe('10')
      expect(formatDistance(10.6)).toBe('11')
      expect(formatDistance(25.3)).toBe('25')
      expect(formatDistance(100.8)).toBe('101')
    })
  })

  describe('calculateOptimalInterval', () => {
    it('距離に応じて適切な間隔を返す', () => {
      expect(calculateOptimalInterval(5)).toBe(1) // 0-10km
      expect(calculateOptimalInterval(10)).toBe(1) // 0-10km
      expect(calculateOptimalInterval(11)).toBe(5) // 10-50km
      expect(calculateOptimalInterval(50)).toBe(5) // 10-50km
      expect(calculateOptimalInterval(51)).toBe(10) // 50-100km
      expect(calculateOptimalInterval(100)).toBe(10) // 50-100km
      expect(calculateOptimalInterval(101)).toBe(20) // 100-500km
      expect(calculateOptimalInterval(500)).toBe(20) // 100-500km
      expect(calculateOptimalInterval(501)).toBe(50) // 500km以上
      expect(calculateOptimalInterval(1000)).toBe(50) // 500km以上
    })
  })

  describe('markersToGeoJSON', () => {
    it('マーカー配列をGeoJSON形式に変換する', () => {
      const markers = [
        { id: 'marker-1', lat: 35.681236, lng: 139.767125, distance: 1 },
        { id: 'marker-2', lat: 35.691236, lng: 139.777125, distance: 2 }
      ]
      
      const geojson = markersToGeoJSON(markers)
      
      expect(geojson.type).toBe('FeatureCollection')
      expect(geojson.features).toHaveLength(2)
      
      expect(geojson.features[0]).toEqual({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [139.767125, 35.681236]
        },
        properties: {
          id: 'marker-1',
          distance: 1,
          label: '1'
        }
      })
    })

    it('空のマーカー配列を処理できる', () => {
      const geojson = markersToGeoJSON([])
      
      expect(geojson.type).toBe('FeatureCollection')
      expect(geojson.features).toEqual([])
    })
  })
})