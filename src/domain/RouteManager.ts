import { RoutePoint, Route } from '@/types'
import { generateId } from './id-generator'
import { RouteCalculator } from './route-calculator'

/**
 * ルートポイントの操作に関するビジネスロジック
 */
export class RouteManager {
  /**
   * ルートに新しいポイントを追加する
   */
  static addPoint(route: Route, point: Omit<RoutePoint, 'id'>): Route {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...route.points, newPoint]
    return RouteCalculator.createRoute(newPoints)
  }
  
  /**
   * 指定したインデックスにポイントを挿入する
   */
  static insertPoint(route: Route, index: number, point: Omit<RoutePoint, 'id'>): Route {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...route.points]
    newPoints.splice(index, 0, newPoint)
    return RouteCalculator.createRoute(newPoints)
  }
  
  /**
   * 既存のポイントを更新する
   */
  static updatePoint(route: Route, id: string, updates: Partial<RoutePoint>): Route {
    const newPoints = route.points.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    return RouteCalculator.createRoute(newPoints)
  }
  
  /**
   * 指定したIDのポイントを削除する
   */
  static deletePoint(route: Route, id: string): Route {
    const newPoints = route.points.filter(p => p.id !== id)
    return RouteCalculator.createRoute(newPoints)
  }
  
  /**
   * 複数のポイントを一度に削除する
   */
  static deleteMultiplePoints(route: Route, ids: string[]): Route {
    const newPoints = route.points.filter(p => !ids.includes(p.id))
    return RouteCalculator.createRoute(newPoints)
  }
  
  /**
   * ポイントを新しい位置に移動する
   */
  static movePoint(route: Route, id: string, lat: number, lng: number): Route {
    return this.updatePoint(route, id, { lat, lng })
  }
}