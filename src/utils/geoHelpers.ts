import * as turf from 'turf'
import { RoutePoint } from '@/types'

/**
 * Find the nearest segment index for a given point
 * This is used to determine where a waypoint should be attached to the route
 */
export function findNearestSegmentIndex(
  lat: number,
  lng: number,
  routePoints: RoutePoint[]
): number {
  if (routePoints.length < 2) {
    return 0
  }
  
  const targetPoint = turf.point([lng, lat])
  
  // First check if the point exactly matches any route point
  for (let i = 0; i < routePoints.length; i++) {
    const routePoint = turf.point([routePoints[i].lng, routePoints[i].lat])
    const distance = turf.distance(targetPoint, routePoint, 'kilometers')
    
    // If point is very close to a route point (within 1 meter)
    if (distance < 0.001) {
      // For points that are not the last point, return the segment starting from this point
      // For the last point, return the last segment
      return Math.min(i, routePoints.length - 2)
    }
  }
  
  // If not exactly on a route point, find the nearest segment
  let minDistance = Infinity
  let nearestIndex = 0
  
  for (let i = 0; i < routePoints.length - 1; i++) {
    const segment = turf.lineString([
      [routePoints[i].lng, routePoints[i].lat],
      [routePoints[i + 1].lng, routePoints[i + 1].lat]
    ])
    
    // Calculate distance from point to this segment
    const nearestPointOnSegment = turf.pointOnLine(segment, targetPoint)
    const distance = turf.distance(targetPoint, nearestPointOnSegment, 'kilometers')
    
    if (distance < minDistance) {
      minDistance = distance
      nearestIndex = i
    }
  }
  
  return nearestIndex
}