import { RoutePoint, Waypoint, WaypointType } from '@/types'

/**
 * GPXファイルをパースしてルートポイントとウェイポイントを抽出
 */
export function parseGPX(gpxContent: string): {
  routePoints: Omit<RoutePoint, 'id'>[]
  waypoints: Omit<Waypoint, 'id' | 'nearestPointIndex' | 'distanceFromStart'>[]
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(gpxContent, 'text/xml')
  
  // パースエラーのチェック
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid GPX file: ' + parserError.textContent)
  }
  
  const routePoints: Omit<RoutePoint, 'id'>[] = []
  const waypoints: Omit<Waypoint, 'id' | 'nearestPointIndex' | 'distanceFromStart'>[] = []
  
  // トラックポイントの抽出 (trkpt)
  const trackPoints = doc.querySelectorAll('trkpt')
  trackPoints.forEach(trkpt => {
    const lat = parseFloat(trkpt.getAttribute('lat') || '0')
    const lon = parseFloat(trkpt.getAttribute('lon') || '0')
    const eleNode = trkpt.querySelector('ele')
    const elevation = eleNode ? parseFloat(eleNode.textContent || '0') : undefined
    
    if (!isNaN(lat) && !isNaN(lon)) {
      routePoints.push({
        lat,
        lng: lon,
        elevation
      })
    }
  })
  
  // ルートポイントの抽出 (rtept)
  const routePointsNodes = doc.querySelectorAll('rtept')
  routePointsNodes.forEach(rtept => {
    const lat = parseFloat(rtept.getAttribute('lat') || '0')
    const lon = parseFloat(rtept.getAttribute('lon') || '0')
    const eleNode = rtept.querySelector('ele')
    const elevation = eleNode ? parseFloat(eleNode.textContent || '0') : undefined
    
    if (!isNaN(lat) && !isNaN(lon)) {
      routePoints.push({
        lat,
        lng: lon,
        elevation
      })
    }
  })
  
  // ウェイポイントの抽出 (wpt)
  const waypointNodes = doc.querySelectorAll('wpt')
  waypointNodes.forEach(wpt => {
    const lat = parseFloat(wpt.getAttribute('lat') || '0')
    const lon = parseFloat(wpt.getAttribute('lon') || '0')
    const eleNode = wpt.querySelector('ele')
    const elevation = eleNode ? parseFloat(eleNode.textContent || '0') : undefined
    const nameNode = wpt.querySelector('name')
    const descNode = wpt.querySelector('desc')
    const typeNode = wpt.querySelector('type')
    
    if (!isNaN(lat) && !isNaN(lon)) {
      const name = nameNode?.textContent || 'Waypoint'
      const description = descNode?.textContent || undefined
      const typeText = typeNode?.textContent?.toLowerCase() || 'pin'
      
      // GPXのtypeをアプリケーションのWaypointTypeにマッピング
      const type = mapGPXTypeToWaypointType(typeText)
      
      waypoints.push({
        lat,
        lng: lon,
        elevation,
        name,
        description,
        type
      })
    }
  })
  
  return { routePoints, waypoints }
}

/**
 * GPXのtype文字列をWaypointTypeにマッピング
 */
function mapGPXTypeToWaypointType(gpxType: string): WaypointType {
  const typeMap: Record<string, WaypointType> = {
    'pin': 'pin',
    'food': 'food',
    'restaurant': 'food',
    'rest': 'rest',
    'rest area': 'rest',
    'scenic': 'scenic',
    'viewpoint': 'scenic',
    'danger': 'danger',
    'warning': 'danger',
    'info': 'info',
    'information': 'info'
  }
  
  return typeMap[gpxType] || 'pin'
}

/**
 * ファイルを読み込んでテキストを返す
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}