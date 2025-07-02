import { RoutePoint, Route } from '@/types'
import { calculateDistance } from '@/utils/geo'

/**
 * ルート計算に関するドメインロジック
 */
export class RouteCalculator {
  /**
   * ルートポイント間の総距離を計算する
   * @param points ルートポイントの配列
   * @returns 総距離（メートル）
   */
  static calculateRouteDistance(points: RoutePoint[]): number {
    return calculateDistance(points)
  }
  
  /**
   * ポイント配列から新しいRouteオブジェクトを作成する
   * @param points ルートポイントの配列
   * @returns 距離が計算されたRouteオブジェクト
   */
  static createRoute(points: RoutePoint[]): Route {
    return {
      points,
      distance: this.calculateRouteDistance(points)
    }
  }
  
  /**
   * 既存のRouteの距離を再計算して新しいRouteオブジェクトを返す
   * @param route 既存のRoute
   * @returns 距離が更新された新しいRouteオブジェクト
   */
  static updateRouteDistance(route: Route): Route {
    return {
      ...route,
      distance: this.calculateRouteDistance(route.points)
    }
  }
}