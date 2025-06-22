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

export type EditMode = 'view' | 'create' | 'edit' | 'delete' | 'delete-range'