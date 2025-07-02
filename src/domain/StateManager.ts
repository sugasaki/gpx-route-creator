import { Route, Waypoint } from '@/types'
import { HistoryState } from './RouteHistoryManager'

interface StoreState {
  route: Route
  waypoints: Waypoint[]
  history: HistoryState[]
  historyIndex: number
}

/**
 * ストアの状態管理に関するユーティリティ
 */
export class StateManager {
  /**
   * 空の状態を作成
   */
  static createEmptyState(): HistoryState {
    return {
      route: { points: [], distance: 0 },
      waypoints: []
    }
  }
  
  /**
   * ストアの初期状態を取得
   */
  static getInitialState(): StoreState {
    const emptyState = this.createEmptyState()
    return {
      ...emptyState,
      history: [emptyState],
      historyIndex: 0
    }
  }
  
  /**
   * 履歴状態をストア更新用のオブジェクトに変換
   */
  static applyHistoryState(
    historyState: HistoryState,
    newIndex: number
  ): Partial<StoreState> {
    return {
      route: historyState.route,
      waypoints: historyState.waypoints,
      historyIndex: newIndex
    }
  }
  
  /**
   * ルートをクリアする際の更新オブジェクトを作成
   */
  static createClearRouteUpdate(): StoreState {
    return this.getInitialState()
  }
}