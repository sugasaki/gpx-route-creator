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
 * Calculate the distance from the start of the route to a given point on the route.
 * This function assumes the point is already on the route line.
 */
export function calculateDistanceToPointOnRoute(
  targetPointLat: number,
  targetPointLng: number,
  routePoints: RoutePoint[]
): number {
  if (routePoints.length < 2) return 0

  const targetPoint = turf.point([targetPointLng, targetPointLat])
  let accumulatedDistance = 0

  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i]
    const p2 = routePoints[i + 1]
    const segment = turf.lineString([[p1.lng, p1.lat], [p2.lng, p2.lat]])

    // Check if the target point is on the current segment
    const nearestOnSegment = turf.pointOnLine(segment, targetPoint)
    const distanceToSegment = turf.distance(
      turf.point([targetPointLng, targetPointLat]), // Use original targetPoint for distance calculation
      nearestOnSegment, 
      'meters'
    )

    // If the target point is on this segment (within a small tolerance)
    if (distanceToSegment < 0.001) { // Tolerance for floating point
      const subSegment = turf.lineString([[p1.lng, p1.lat], [targetPointLng, targetPointLat]])
      accumulatedDistance += turf.lineDistance(subSegment, 'meters')
      return accumulatedDistance
    } else {
      // Add the full segment length if the target point is not on this segment
      accumulatedDistance += turf.lineDistance(segment, 'meters')
    }
  }

  return accumulatedDistance
}

/**
 * Calculate the total distance of a route in kilometers.
 */
export function calculateTotalDistanceKm(points: RoutePoint[]): number {
  return calculateDistance(points) / 1000
}

/**
 * Format distance for display (e.g., 123m, 1.23km)
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`
  } else {
    return `${(distanceMeters / 1000).toFixed(2)}km`
  }
}

/**
 * Calculate the bearing between two points.
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const point1 = turf.point([lng1, lat1])
  const point2 = turf.point([lng2, lat2])
  return turf.bearing(point1, point2)
}

/**
 * Get the point at a specified distance along a line.
 */
export function getPointAtDistance(
  points: RoutePoint[],
  distanceMeters: number
): RoutePoint | null {
  if (points.length < 2) return null

  const line = turf.lineString(
    points.map(p => [p.lng, p.lat])
  )
  const point = turf.along(line, distanceMeters, 'meters')
  
  return {
    id: `point-at-distance-${distanceMeters}`, // Temporary ID
    lat: point.geometry.coordinates[1],
    lng: point.geometry.coordinates[0]
  }
}

/**
 * Get points along a line at regular intervals.
 */
export function getPointsAlongLine(
  points: RoutePoint[],
  intervalMeters: number
): RoutePoint[] {
  if (points.length < 2) return []

  const line = turf.lineString(
    points.map(p => [p.lng, p.lat])
  )
  const totalDistance = turf.lineDistance(line, 'meters')
  const resultPoints: RoutePoint[] = []

  for (let dist = 0; dist <= totalDistance; dist += intervalMeters) {
    const point = turf.along(line, dist, 'meters')
    resultPoints.push({
      id: `point-along-line-${dist}`, // Temporary ID
      lat: point.geometry.coordinates[1],
      lng: point.geometry.coordinates[0]
    })
  }
  return resultPoints
}

/**
 * Calculate the elevation gain and loss for a route.
 */
export function calculateElevationGainLoss(points: RoutePoint[]): { gain: number; loss: number } {
  let gain = 0
  let loss = 0

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]

    if (p1.elevation !== undefined && p2.elevation !== undefined) {
      const diff = p2.elevation - p1.elevation
      if (diff > 0) {
        gain += diff
      } else {
        loss += Math.abs(diff)
      }
    }
  }

  return { gain, loss }
}

/**
 * Get the total elevation gain of a route.
 */
export function getTotalElevationGain(points: RoutePoint[]): number {
  return calculateElevationGainLoss(points).gain
}

/**
 * Get the total elevation loss of a route.
 */
export function getTotalElevationLoss(points: RoutePoint[]): number {
  return calculateElevationGainLoss(points).loss
}

/**
 * Get the minimum elevation of a route.
 */
export function getMinElevation(points: RoutePoint[]): number | undefined {
  if (points.length === 0) return undefined
  return Math.min(...points.filter(p => p.elevation !== undefined).map(p => p.elevation!))
}

/**
 * Get the maximum elevation of a route.
 */
export function getMaxElevation(points: RoutePoint[]): number | undefined {
  if (points.length === 0) return undefined
  return Math.max(...points.filter(p => p.elevation !== undefined).map(p => p.elevation!))
}

/**
 * Calculate the average speed between two points given time.
 * @param distanceMeters - Distance in meters
 * @param timeSeconds - Time in seconds
 * @returns Speed in km/h
 */
export function calculateSpeedKmH(distanceMeters: number, timeSeconds: number): number {
  if (timeSeconds === 0) return 0
  const distanceKm = distanceMeters / 1000
  const timeHours = timeSeconds / 3600
  return distanceKm / timeHours
}

/**
 * Calculate the average pace between two points given time.
 * @param distanceMeters - Distance in meters
 * @param timeSeconds - Time in seconds
 * @returns Pace in minutes per kilometer (e.g., 5.5 for 5 min 30 sec / km)
 */
export function calculatePaceMinPerKm(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters === 0) return 0
  const distanceKm = distanceMeters / 1000
  const timeMinutes = timeSeconds / 60
  return timeMinutes / distanceKm
}

/**
 * Convert pace from minutes per kilometer to a formatted string (e.g., "5:30 min/km").
 * @param paceMinPerKm - Pace in minutes per kilometer
 * @returns Formatted pace string
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm)
  const seconds = Math.round((paceMinPerKm - minutes) * 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min/km`
}

/**
 * Calculate the total time for a route given average speed.
 * @param distanceMeters - Total distance in meters
 * @param speedKmH - Average speed in km/h
 * @returns Total time in seconds
 */
export function calculateTotalTimeSeconds(distanceMeters: number, speedKmH: number): number {
  if (speedKmH === 0) return 0
  const distanceKm = distanceMeters / 1000
  return (distanceKm / speedKmH) * 3600
}

/**
 * Format time in seconds to HH:MM:SS or MM:SS format.
 * @param totalSeconds - Total time in seconds
 * @returns Formatted time string
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.round(totalSeconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  } else {
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }
}

/**
 * Calculate the distance between two points using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

/**
 * Calculate the total distance of a route in meters using Haversine formula.
 * This is a fallback/alternative to Turf.js for comparison or specific needs.
 */
export function calculateRouteDistanceHaversine(points: RoutePoint[]): number {
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    totalDistance += haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
  }
  return totalDistance;
}

/**
 * Calculate the cumulative distance for each point in a route.
 * @param points - Array of RoutePoint
 * @returns Array of cumulative distances in meters, corresponding to each point.
 */
export function calculateCumulativeDistances(points: RoutePoint[]): number[] {
  const cumulativeDistances: number[] = [0];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segmentDistance = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    cumulativeDistances.push(cumulativeDistances[i] + segmentDistance);
  }
  return cumulativeDistances;
}

/**
 * Find the distance from the start of the route to a specific waypoint.
 * This function finds the closest point on the route line to the waypoint and then calculates
 * the distance along the route to that closest point.
 * @param waypoint - The waypoint for which to calculate the distance.
 * @param routePoints - The array of RoutePoint objects defining the route.
 * @returns The distance in meters from the start of the route to the waypoint, or 0 if route is empty.
 */
export function getDistanceToWaypoint(waypoint: Waypoint, routePoints: RoutePoint[]): number {
  if (routePoints.length < 2) return 0;

  // Find the closest point on the route line to the waypoint
  const snapped = findClosestPointOnRoute(waypoint.lat, waypoint.lng, routePoints);
  
  // Calculate the distance along the route to this snapped point
  return calculateDistanceToPointOnRoute(snapped.lat, snapped.lng, routePoints);
}
