import * as turf from 'turf'
import { RoutePoint, Waypoint } from '@/types'

/**
 * Calculate distance from point to line segment (for backward compatibility)
 * This is kept for any code that might still be using it
 */
export function distanceToSegment(
  px: number, py: number, // point
  x1: number, y1: number, // segment start
  x2: number, y2: number  // segment end
): number {
  const pt = turf.point([py, px])
  const line = turf.lineString([[y1, x1], [y2, x2]])
  // Use point on line function  
  const nearestPt = turf.pointOnLine(line, pt)
  return turf.distance(pt, nearestPt, 'degrees')
}

/**
 * Calculate distance between route points using Turf.js
 */
export function calculateDistance(points: RoutePoint[]): number {
  if (points.length < 2) return 0
  
  // Convert RoutePoints to GeoJSON LineString
  const line = turf.lineString(
    points.map(p => [p.lng, p.lat])
  )
  
  // Calculate length in meters
  return turf.lineDistance(line, 'meters')
}

/**
 * Find the closest segment index for inserting a new point
 */
export function findClosestSegmentIndex(
  clickLat: number,
  clickLng: number,
  points: RoutePoint[]
): number {
  if (points.length < 2) return 1
  
  const clickPoint = turf.point([clickLng, clickLat])
  let minDistance = Infinity
  let insertIndex = 1
  
  for (let i = 0; i < points.length - 1; i++) {
    const segment = turf.lineString([
      [points[i].lng, points[i].lat],
      [points[i + 1].lng, points[i + 1].lat]
    ])
    
    // Use point on line and calculate distance
    const nearestPt = turf.pointOnLine(segment, clickPoint)
    const distance = turf.distance(clickPoint, nearestPt, 'degrees')
    
    if (distance < minDistance) {
      minDistance = distance
      insertIndex = i + 1
    }
  }
  
  return insertIndex
}

/**
 * Find the closest point on the route line to a given point
 */
export function findClosestPointOnRoute(
  clickLat: number,
  clickLng: number,
  points: RoutePoint[]
): { lat: number; lng: number; nearestPointIndex: number } {
  if (points.length < 2) {
    return { lat: clickLat, lng: clickLng, nearestPointIndex: 0 }
  }
  
  const clickPoint = turf.point([clickLng, clickLat])
  const line = turf.lineString(
    points.map(p => [p.lng, p.lat])
  )
  
  // Find the nearest point on the line
  const snapped = turf.pointOnLine(line, clickPoint)
  
  // Find which segment the snapped point is on
  let nearestPointIndex = 0
  const snappedCoords = snapped.geometry.coordinates
  
  // Check which segment contains the snapped point
  for (let i = 0; i < points.length - 1; i++) {
    const segment = turf.lineString([
      [points[i].lng, points[i].lat],
      [points[i + 1].lng, points[i + 1].lat]
    ])
    
    // Check if the snapped point lies on this segment
    const nearestOnSegment = turf.pointOnLine(segment, turf.point(snappedCoords))
    const distanceToSegment = turf.distance(
      turf.point(snappedCoords), 
      nearestOnSegment, 
      'degrees'
    )
    
    if (distanceToSegment < 0.0000001) { // Very small threshold for floating point comparison
      nearestPointIndex = i
      break
    }
  }
  
  return {
    lat: snappedCoords[1],
    lng: snappedCoords[0],
    nearestPointIndex
  }
}

/**
 * Calculate the distance from the route start to a waypoint along the route
 * Returns distance in kilometers
 */
export function calculateDistanceToWaypoint(
  waypoint: Waypoint,
  routePoints: RoutePoint[]
): number {
  if (routePoints.length < 2 || waypoint.nearestPointIndex === undefined) {
    return 0
  }

  // Find the exact position of the waypoint on the route
  const waypointPoint = turf.point([waypoint.lng, waypoint.lat])
  const routeLine = turf.lineString(
    routePoints.map(p => [p.lng, p.lat])
  )
  
  // Get the snapped point on the line (exact position on route)
  const snappedPoint = turf.pointOnLine(routeLine, waypointPoint)
  
  // Calculate distance along the route to this point
  // We need to build the route up to the waypoint's position
  let accumulatedDistance = 0
  
  // Add distances for complete segments before the waypoint
  for (let i = 0; i < waypoint.nearestPointIndex; i++) {
    const segmentLine = turf.lineString([
      [routePoints[i].lng, routePoints[i].lat],
      [routePoints[i + 1].lng, routePoints[i + 1].lat]
    ])
    accumulatedDistance += turf.lineDistance(segmentLine, 'kilometers')
  }
  
  // Add partial distance on the segment containing the waypoint
  if (waypoint.nearestPointIndex < routePoints.length - 1) {
    const segmentStart = turf.point([
      routePoints[waypoint.nearestPointIndex].lng,
      routePoints[waypoint.nearestPointIndex].lat
    ])
    const partialSegment = turf.lineString([
      segmentStart.geometry.coordinates,
      snappedPoint.geometry.coordinates
    ])
    accumulatedDistance += turf.lineDistance(partialSegment, 'kilometers')
  }
  
  return accumulatedDistance
}

/**
 * Calculate distances for all waypoints from the route start
 */
export function calculateAllWaypointDistances(
  waypoints: Waypoint[],
  routePoints: RoutePoint[]
): Waypoint[] {
  return waypoints.map(waypoint => ({
    ...waypoint,
    distanceFromStart: calculateDistanceToWaypoint(waypoint, routePoints)
  }))
}