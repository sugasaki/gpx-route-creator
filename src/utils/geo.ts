import { RoutePoint } from '../types'

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