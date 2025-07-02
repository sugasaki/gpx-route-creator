import { Route, Waypoint } from '@/types'

export interface HistoryState {
  route: Route
  waypoints: Waypoint[]
}

export class RouteHistoryManager {
  static createSnapshot(route: Route, waypoints: Waypoint[]): HistoryState {
    // 深いコピーを作成して独立性を保証
    return {
      route: {
        points: route.points.map(p => ({ ...p })),
        distance: route.distance
      },
      waypoints: waypoints.map(w => ({ ...w }))
    }
  }
  
  static canUndo(historyIndex: number): boolean {
    return historyIndex > 0
  }
  
  static canRedo(historyIndex: number, historyLength: number): boolean {
    return historyIndex < historyLength - 1
  }
  
  static addToHistory(
    history: HistoryState[], 
    currentIndex: number, 
    newState: HistoryState
  ): { history: HistoryState[], newIndex: number } {
    // 現在の位置までの履歴を保持し、未来の履歴は削除
    const newHistory = history.slice(0, currentIndex + 1)
    newHistory.push(newState)
    
    return {
      history: newHistory,
      newIndex: newHistory.length - 1
    }
  }
  
  static undo(
    history: HistoryState[],
    currentIndex: number
  ): { state: HistoryState, newIndex: number } | null {
    if (!this.canUndo(currentIndex)) {
      return null
    }
    
    return {
      state: history[currentIndex - 1],
      newIndex: currentIndex - 1
    }
  }
  
  static redo(
    history: HistoryState[],
    currentIndex: number
  ): { state: HistoryState, newIndex: number } | null {
    if (!this.canRedo(currentIndex, history.length)) {
      return null
    }
    
    return {
      state: history[currentIndex + 1],
      newIndex: currentIndex + 1
    }
  }
}