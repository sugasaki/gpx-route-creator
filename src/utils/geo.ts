import * as turf from 'turf'
import { RoutePoint } from '@/types'

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
  console.log('findClosestPointOnRoute called:', {
    clickLat,
    clickLng,
    pointsLength: points.length
  })
  
  if (points.length < 2) {
    return { lat: clickLat, lng: clickLng, nearestPointIndex: 0 }
  }
  
  const clickPoint = turf.point([clickLng, clickLat])
  const line = turf.lineString(
    points.map(p => [p.lng, p.lat])
  )
  
  // Find the nearest point on the line
  const snapped = turf.pointOnLine(line, clickPoint)
  console.log('Snapped point:', snapped.geometry.coordinates)
  
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
    
    console.log(`Segment ${i}: distance = ${distanceToSegment}`)
    
    if (distanceToSegment < 0.0000001) { // Very small threshold for floating point comparison
      nearestPointIndex = i
      console.log(`Found nearest segment: ${i}`)
      break
    }
  }
  
  console.log('Final nearestPointIndex:', nearestPointIndex)
  
  return {
    lat: snappedCoords[1],
    lng: snappedCoords[0],
    nearestPointIndex
  }
}

/**
 * Calculate distance from route start to a specific point index
 * @param points Route points array
 * @param targetIndex Index to calculate distance to
 * @returns Distance in kilometers
 */
export function calculateDistanceToIndex(
  points: RoutePoint[],
  targetIndex: number
): number {
  console.log('calculateDistanceToIndex called with:', {
    pointsLength: points.length,
    targetIndex: targetIndex
  })
  
  if (points.length < 2 || targetIndex < 0) {
    console.log('Returning 0 because:', {
      pointsLength: points.length,
      targetIndex: targetIndex,
      condition: 'points.length < 2 || targetIndex < 0'
    })
    return 0
  }
  
  // インデックス0の場合も距離は0
  if (targetIndex === 0) {
    console.log('Returning 0 for index 0 (start point)')
    return 0
  }
  
  // Limit targetIndex to valid range
  const limitedIndex = Math.min(targetIndex, points.length - 1)
  
  // Create sub-route from start to target index
  const subRoute = points.slice(0, limitedIndex + 1)
  console.log('Calculating distance for sub-route:', {
    subRouteLength: subRoute.length,
    limitedIndex: limitedIndex
  })
  
  // Convert to meters then to kilometers
  const distanceMeters = calculateDistance(subRoute)
  const distanceKm = distanceMeters / 1000
  console.log('Distance calculated:', {
    distanceMeters: distanceMeters,
    distanceKm: distanceKm
  })
  return distanceKm
}