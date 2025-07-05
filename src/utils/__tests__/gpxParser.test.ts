import { describe, it, expect } from 'vitest'
import { parseGPX } from '../gpxParser'

describe('gpxParser', () => {
  describe('parseGPX', () => {
    it('should parse track points from GPX', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1">
          <trk>
            <name>Test Track</name>
            <trkseg>
              <trkpt lat="35.6812" lon="139.7671">
                <ele>10.5</ele>
              </trkpt>
              <trkpt lat="35.6813" lon="139.7672">
                <ele>11.0</ele>
              </trkpt>
            </trkseg>
          </trk>
        </gpx>`
      
      const result = parseGPX(gpxContent)
      
      expect(result.routePoints).toHaveLength(2)
      expect(result.routePoints[0]).toEqual({
        lat: 35.6812,
        lng: 139.7671,
        elevation: 10.5
      })
      expect(result.routePoints[1]).toEqual({
        lat: 35.6813,
        lng: 139.7672,
        elevation: 11.0
      })
    })
    
    it('should parse route points from GPX', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1">
          <rte>
            <name>Test Route</name>
            <rtept lat="35.6812" lon="139.7671">
              <ele>10.5</ele>
            </rtept>
            <rtept lat="35.6813" lon="139.7672">
              <ele>11.0</ele>
            </rtept>
          </rte>
        </gpx>`
      
      const result = parseGPX(gpxContent)
      
      expect(result.routePoints).toHaveLength(2)
      expect(result.routePoints[0]).toEqual({
        lat: 35.6812,
        lng: 139.7671,
        elevation: 10.5
      })
    })
    
    it('should parse waypoints from GPX', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1">
          <wpt lat="35.6812" lon="139.7671">
            <ele>10.5</ele>
            <name>Start Point</name>
            <desc>This is the starting point</desc>
            <type>food</type>
          </wpt>
          <wpt lat="35.6813" lon="139.7672">
            <name>End Point</name>
            <type>rest</type>
          </wpt>
        </gpx>`
      
      const result = parseGPX(gpxContent)
      
      expect(result.waypoints).toHaveLength(2)
      expect(result.waypoints[0]).toEqual({
        lat: 35.6812,
        lng: 139.7671,
        elevation: 10.5,
        name: 'Start Point',
        description: 'This is the starting point',
        type: 'food'
      })
      expect(result.waypoints[1]).toEqual({
        lat: 35.6813,
        lng: 139.7672,
        elevation: undefined,
        name: 'End Point',
        description: undefined,
        type: 'rest'
      })
    })
    
    it('should handle GPX without elevation data', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1">
          <trk>
            <trkseg>
              <trkpt lat="35.6812" lon="139.7671" />
              <trkpt lat="35.6813" lon="139.7672" />
            </trkseg>
          </trk>
        </gpx>`
      
      const result = parseGPX(gpxContent)
      
      expect(result.routePoints).toHaveLength(2)
      expect(result.routePoints[0].elevation).toBeUndefined()
      expect(result.routePoints[1].elevation).toBeUndefined()
    })
    
    it('should map unknown waypoint types to pin', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1">
          <wpt lat="35.6812" lon="139.7671">
            <name>Unknown Type</name>
            <type>unknown</type>
          </wpt>
        </gpx>`
      
      const result = parseGPX(gpxContent)
      
      expect(result.waypoints[0].type).toBe('pin')
    })
    
    it('should throw error for invalid XML', () => {
      const invalidGpx = 'This is not valid XML'
      
      expect(() => parseGPX(invalidGpx)).toThrow('Invalid GPX file')
    })
    
    it('should return empty arrays for GPX without points', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1">
          <metadata>
            <name>Empty GPX</name>
          </metadata>
        </gpx>`
      
      const result = parseGPX(gpxContent)
      
      expect(result.routePoints).toHaveLength(0)
      expect(result.waypoints).toHaveLength(0)
    })
  })
})