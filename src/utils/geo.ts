import { RoutePoint } from '@/types'

/**
 * Calculate distance from point to line segment
 */
export function distanceToSegment(
  px: number, py: number, // point
  x1: number, y1: number, // segment start
  x2: number, y2: number  // segment end
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  
  if (dx === 0 && dy === 0) {
    // Segment is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  }
  
  // Calculate projection parameter t
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  
  // Find the closest point on the segment
  const closestX = x1 + t * dx
  const closestY = y1 + t * dy
  
  // Calculate distance
  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2)
}

/**
 * Calculate distance between route points using Haversine formula
 */
export function calculateDistance(points: RoutePoint[]): number {
  let distance = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    
    const R = 6371000 // Earth radius in meters
    const dLat = (curr.lat - prev.lat) * Math.PI / 180
    const dLon = (curr.lng - prev.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c
    
    distance += d
  }
  return distance
}

/**
 * Find the closest segment index for inserting a new point
 */
export function findClosestSegmentIndex(
  clickLat: number,
  clickLng: number,
  points: RoutePoint[]
): number {
  let minDistance = Infinity
  let insertIndex = 1
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    
    const segmentDistance = distanceToSegment(
      clickLat, clickLng,
      p1.lat, p1.lng,
      p2.lat, p2.lng
    )
    
    if (segmentDistance < minDistance) {
      minDistance = segmentDistance
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
  let minDistance = Infinity
  let closestPoint = { lat: clickLat, lng: clickLng }
  let nearestPointIndex = 0
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    
    const dx = p2.lng - p1.lng
    const dy = p2.lat - p1.lat
    
    if (dx === 0 && dy === 0) {
      // Segment is a point
      const distance = Math.sqrt((clickLng - p1.lng) ** 2 + (clickLat - p1.lat) ** 2)
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = { lat: p1.lat, lng: p1.lng }
        nearestPointIndex = i
      }
      continue
    }
    
    // Calculate projection parameter t
    const t = Math.max(0, Math.min(1, 
      ((clickLng - p1.lng) * dx + (clickLat - p1.lat) * dy) / (dx * dx + dy * dy)
    ))
    
    // Find the closest point on the segment
    const closestLng = p1.lng + t * dx
    const closestLat = p1.lat + t * dy
    
    // Calculate distance
    const distance = Math.sqrt((clickLng - closestLng) ** 2 + (clickLat - closestLat) ** 2)
    
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = { lat: closestLat, lng: closestLng }
      nearestPointIndex = i
    }
  }
  
  return { ...closestPoint, nearestPointIndex }
}