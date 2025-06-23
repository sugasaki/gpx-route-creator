import { RoutePoint, Waypoint } from '@/types'

/**
 * Generate GPX file content from route points and waypoints
 */
export function generateGPX(points: RoutePoint[], waypoints: Waypoint[] = []): string {
  const waypointXml = waypoints.map(w => `  <wpt lat="${w.lat}" lon="${w.lng}">
    ${w.elevation ? `<ele>${w.elevation}</ele>` : ''}
    <name>${escapeXml(w.name)}</name>
    ${w.description ? `<desc>${escapeXml(w.description)}</desc>` : ''}
    <sym>${w.type}</sym>
  </wpt>`).join('\n')
  
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Route Creator">
${waypointXml ? waypointXml + '\n' : ''}  <trk>
    <name>Route</name>
    <trkseg>
${points.map(p => `      <trkpt lat="${p.lat}" lon="${p.lng}">
        ${p.elevation ? `<ele>${p.elevation}</ele>` : ''}
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`
  
  return gpx
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Download GPX file
 */
export function downloadGPX(points: RoutePoint[], waypoints: Waypoint[] = [], filename: string = 'route.gpx'): void {
  if (points.length === 0) return
  
  const gpxContent = generateGPX(points, waypoints)
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}