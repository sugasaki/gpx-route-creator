export interface RoutePoint {
  id: string
  lat: number
  lng: number
  elevation?: number
}

export interface Route {
  points: RoutePoint[]
  distance: number
}

export type WaypointType = 'pin' | 'food' | 'rest' | 'scenic' | 'danger' | 'info'

export interface Waypoint {
  id: string
  lat: number
  lng: number
  elevation?: number
  name: string
  description?: string
  type: WaypointType
  // ルート上の最も近いポイントのインデックス（移動時に使用）
  nearestPointIndex?: number
  distanceFromStart?: number // ルート始点からの距離 (メートル)
}

export type EditMode = 'view' | 'create' | 'edit' | 'delete' | 'delete-range' | 'waypoint'