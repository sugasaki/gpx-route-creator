import { RoutePoint } from '@/types'

/**
 * Generate GPX file content from route points
 */
export function generateGPX(points: RoutePoint[]): string {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Route Creator">
  <trk>
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
 * Download GPX file
 */
export function downloadGPX(points: RoutePoint[], filename: string = 'route.gpx'): void {
  if (points.length === 0) return
  
  const gpxContent = generateGPX(points)
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}