import { describe, it, expect, vi } from 'vitest'
import { generateGPX, downloadGPX } from '../gpx'
import { RoutePoint, Waypoint } from '@/types'

describe('GPX Utils', () => {
  describe('generateGPX', () => {
    it('基本的なルートポイントからGPXを生成する', () => {
      const points: RoutePoint[] = [
        { lat: 35.6762, lng: 139.6503, elevation: 10 },
        { lat: 35.6763, lng: 139.6504, elevation: 12 }
      ]

      const gpx = generateGPX(points)

      expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(gpx).toContain('<gpx version="1.1" creator="GPX Route Creator">')
      expect(gpx).toContain('<trkpt lat="35.6762" lon="139.6503">')
      expect(gpx).toContain('<ele>10</ele>')
      expect(gpx).toContain('<trkpt lat="35.6763" lon="139.6504">')
      expect(gpx).toContain('<ele>12</ele>')
    })

    it('標高なしのルートポイントからGPXを生成する', () => {
      const points: RoutePoint[] = [
        { lat: 35.6762, lng: 139.6503 },
        { lat: 35.6763, lng: 139.6504 }
      ]

      const gpx = generateGPX(points)

      expect(gpx).toContain('<trkpt lat="35.6762" lon="139.6503">')
      expect(gpx).not.toContain('<ele>')
    })

    it('ウェイポイントを含むGPXを生成する', () => {
      const points: RoutePoint[] = [
        { lat: 35.6762, lng: 139.6503 }
      ]
      const waypoints: Waypoint[] = [
        {
          id: '1',
          lat: 35.6762,
          lng: 139.6503,
          name: 'テスト地点',
          description: 'テスト説明',
          type: 'flag',
          elevation: 15
        }
      ]

      const gpx = generateGPX(points, waypoints)

      expect(gpx).toContain('<wpt lat="35.6762" lon="139.6503">')
      expect(gpx).toContain('<name>テスト地点</name>')
      expect(gpx).toContain('<desc>テスト説明</desc>')
      expect(gpx).toContain('<sym>flag</sym>')
      expect(gpx).toContain('<ele>15</ele>')
    })

    it('XMLエスケープが正しく動作する', () => {
      const points: RoutePoint[] = [
        { lat: 35.6762, lng: 139.6503 }
      ]
      const waypoints: Waypoint[] = [
        {
          id: '1',
          lat: 35.6762,
          lng: 139.6503,
          name: 'Test & Point',
          description: 'Test <desc> "with" quotes',
          type: 'flag'
        }
      ]

      const gpx = generateGPX(points, waypoints)

      expect(gpx).toContain('<name>Test &amp; Point</name>')
      expect(gpx).toContain('<desc>Test &lt;desc&gt; &quot;with&quot; quotes</desc>')
    })
  })

  describe('downloadGPX', () => {
    beforeEach(() => {
      // DOM APIのモック
      global.URL.createObjectURL = vi.fn(() => 'mock-url')
      global.URL.revokeObjectURL = vi.fn()
      
      // DOM要素のモック
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn()
      }
      global.document.createElement = vi.fn(() => mockAnchor as any)
    })

    it('ルートポイントがある場合にダウンロードが実行される', () => {
      const points: RoutePoint[] = [
        { lat: 35.6762, lng: 139.6503 }
      ]

      downloadGPX(points, [], 'test.gpx')

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.document.createElement).toHaveBeenCalledWith('a')
    })

    it('ルートポイントが空の場合はダウンロードが実行されない', () => {
      downloadGPX([], [])

      expect(global.URL.createObjectURL).not.toHaveBeenCalled()
      expect(global.document.createElement).not.toHaveBeenCalled()
    })
  })
})