import { Route, Waypoint } from '@/types'
import { RouteHistoryManager, type HistoryState } from './RouteHistoryManager'

interface CurrentState {
  route: Route
  waypoints: Waypoint[]
  history: HistoryState[]
  historyIndex: number
}

interface HistoryUpdate {
  history?: HistoryState[]
  historyIndex?: number
  route?: Route
  waypoints?: Waypoint[]
}

/**
 * 履歴管理の統合クラス
 */
export class HistoryManager {
  /**
   * 履歴を更新し、新しい状態の変更を返す
   */
  static updateWithHistory(
    currentState: CurrentState,
    newRoute: Route | null,
    newWaypoints: Waypoint[] | null
  ): HistoryUpdate {
    const currentRoute = newRoute || currentState.route
    const currentWaypoints = newWaypoints || currentState.waypoints
    
    // 履歴が空の場合、現在の状態を最初の履歴として追加
    if (currentState.history.length === 0) {
      const currentSnapshot = RouteHistoryManager.createSnapshot(
        currentState.route,
        currentState.waypoints
      )
      const newSnapshot = RouteHistoryManager.createSnapshot(currentRoute, currentWaypoints)
      
      const updates: HistoryUpdate = {
        history: [currentSnapshot, newSnapshot],
        historyIndex: 1
      }
      
      if (newRoute) updates.route = newRoute
      if (newWaypoints) updates.waypoints = newWaypoints
      
      return updates
    }
    
    const historyResult = RouteHistoryManager.addToHistory(
      currentState.history,
      currentState.historyIndex,
      RouteHistoryManager.createSnapshot(currentRoute, currentWaypoints)
    )
    
    const updates: HistoryUpdate = {
      history: historyResult.history,
      historyIndex: historyResult.newIndex
    }
    
    if (newRoute) updates.route = newRoute
    if (newWaypoints) updates.waypoints = newWaypoints
    
    return updates
  }
}