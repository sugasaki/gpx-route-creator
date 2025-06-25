import { describe, it, expect } from 'vitest'
import { calculateDistance, calculateDistanceToIndex, findClosestPointOnRoute } from '../geo'
import { RoutePoint } from '@/types'

describe('geo utilities', () => {
  describe('calculateDistance', () => {
    it('空の配列の場合は0を返す', () => {
      expect(calculateDistance([])).toBe(0)
    })

    it('1点のみの場合は0を返す', () => {
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 }
      ]
      expect(calculateDistance(points)).toBe(0)
    })

    it('2点間の距離を正しく計算する', () => {
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 }, // 東京駅
        { id: '2', lat: 35.658034, lng: 139.701637 }  // 渋谷駅
      ]
      const distance = calculateDistance(points)
      // 約7.5km
      expect(distance).toBeGreaterThan(7000)
      expect(distance).toBeLessThan(8000)
    })

    it('複数点の合計距離を正しく計算する', () => {
      const points: RoutePoint[] = [
        { id: '1', lat: 35.681236, lng: 139.767125 }, // 東京駅
        { id: '2', lat: 35.658034, lng: 139.701637 }, // 渋谷駅
        { id: '3', lat: 35.628471, lng: 139.738993 }  // 品川駅
      ]
      const distance = calculateDistance(points)
      // 約12km
      expect(distance).toBeGreaterThan(11000)
      expect(distance).toBeLessThan(13000)
    })
  })

  describe('calculateDistanceToIndex', () => {
    const points: RoutePoint[] = [
      { id: '1', lat: 35.681236, lng: 139.767125 }, // 東京駅
      { id: '2', lat: 35.658034, lng: 139.701637 }, // 渋谷駅
      { id: '3', lat: 35.628471, lng: 139.738993 }, // 品川駅
      { id: '4', lat: 35.630152, lng: 139.740311 }  // 近い点
    ]

    it('インデックス0の場合は0を返す', () => {
      expect(calculateDistanceToIndex(points, 0)).toBe(0)
    })

    it('負のインデックスの場合は0を返す', () => {
      expect(calculateDistanceToIndex(points, -1)).toBe(0)
    })

    it('ポイントが2つ未満の場合は0を返す', () => {
      expect(calculateDistanceToIndex([points[0]], 1)).toBe(0)
      expect(calculateDistanceToIndex([], 0)).toBe(0)
    })

    it('インデックス1までの距離を正しく計算する', () => {
      const distance = calculateDistanceToIndex(points, 1)
      // 東京駅から渋谷駅まで約7.5km
      expect(distance).toBeGreaterThan(7)
      expect(distance).toBeLessThan(8)
    })

    it('インデックス2までの距離を正しく計算する', () => {
      const distance = calculateDistanceToIndex(points, 2)
      // 東京駅から渋谷駅経由で品川駅まで約12km
      expect(distance).toBeGreaterThan(11)
      expect(distance).toBeLessThan(13)
    })

    it('範囲外のインデックスの場合は最後のポイントまでの距離を返す', () => {
      const distance = calculateDistanceToIndex(points, 10)
      const totalDistance = calculateDistance(points)
      expect(distance).toBe(totalDistance / 1000) // kmに変換
    })
  })

  describe('findClosestPointOnRoute', () => {
    const points: RoutePoint[] = [
      { id: '1', lat: 35.681236, lng: 139.767125 }, // 東京駅
      { id: '2', lat: 35.658034, lng: 139.701637 }, // 渋谷駅
      { id: '3', lat: 35.628471, lng: 139.738993 }  // 品川駅
    ]

    it('ポイントが2つ未満の場合はクリック位置を返す', () => {
      const result = findClosestPointOnRoute(35.7, 139.7, [])
      expect(result.lat).toBe(35.7)
      expect(result.lng).toBe(139.7)
      expect(result.nearestPointIndex).toBe(0)

      const result2 = findClosestPointOnRoute(35.7, 139.7, [points[0]])
      expect(result2.lat).toBe(35.7)
      expect(result2.lng).toBe(139.7)
      expect(result2.nearestPointIndex).toBe(0)
    })

    it('ルート上の最も近い点を正しく計算する', () => {
      // 東京駅と渋谷駅の中間付近の点
      const result = findClosestPointOnRoute(35.670000, 139.734000, points)
      
      // 結果は東京駅と渋谷駅の間のどこかであるべき
      expect(result.lat).toBeGreaterThan(35.658)
      expect(result.lat).toBeLessThan(35.682)
      expect(result.lng).toBeGreaterThan(139.701)
      expect(result.lng).toBeLessThan(139.768)
      expect(result.nearestPointIndex).toBe(0) // 最初のセグメント
    })

    it('セグメントインデックスを正しく特定する', () => {
      // 渋谷駅と品川駅の中間付近の点
      const result = findClosestPointOnRoute(35.643000, 139.720000, points)
      
      // 結果は渋谷駅と品川駅の間のどこかであるべき
      expect(result.lat).toBeGreaterThan(35.628)
      expect(result.lat).toBeLessThan(35.659)
      expect(result.nearestPointIndex).toBe(1) // 2番目のセグメント
    })
  })
})