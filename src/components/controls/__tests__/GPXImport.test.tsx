import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GPXImport from '../GPXImport'
import { useRouteStore } from '@/store/routeStore'
import * as gpxImportUtils from '@/utils/gpxImport'

// モック
vi.mock('@/store/routeStore')
vi.mock('@/utils/gpxImport')

describe('GPXImport', () => {
  const mockClearRoute = vi.fn()
  const mockAddPoint = vi.fn()
  const mockAddWaypoint = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useRouteStore).mockReturnValue({
      route: { points: [], distance: 0 },
      clearRoute: mockClearRoute,
      addPoint: mockAddPoint,
      addWaypoint: mockAddWaypoint
    } as any)
  })
  
  it('should render import button', () => {
    render(<GPXImport />)
    
    const button = screen.getByTitle('Import GPX file')
    expect(button).toBeInTheDocument()
  })
  
  it('should open file dialog when button clicked', async () => {
    const user = userEvent.setup()
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, 'click')
    
    const button = screen.getByTitle('Import GPX file')
    await user.click(button)
    
    expect(clickSpy).toHaveBeenCalled()
  })
  
  it('should show error for non-GPX files', async () => {
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(false)
    
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Please select a GPX file')).toBeInTheDocument()
    })
  })
  
  it('should process valid GPX file', async () => {
    const mockRoutePoints = [{ lat: 35.6812, lng: 139.7671 }]
    const mockWaypoints = [{ lat: 35.6813, lng: 139.7672, name: 'Test', type: 'pin' as const }]
    
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(true)
    vi.mocked(gpxImportUtils.processGPXFile).mockResolvedValue({
      routePoints: mockRoutePoints,
      waypoints: mockWaypoints
    })
    vi.mocked(gpxImportUtils.confirmRouteReplacement).mockReturnValue(true)
    
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file')
    const file = new File(['content'], 'test.gpx', { type: 'application/gpx+xml' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(gpxImportUtils.applyGPXData).toHaveBeenCalledWith(
        mockRoutePoints,
        mockWaypoints,
        {
          clearRoute: mockClearRoute,
          addPoint: mockAddPoint,
          addWaypoint: mockAddWaypoint
        }
      )
    })
  })
  
  it('should show error for empty GPX file', async () => {
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(true)
    vi.mocked(gpxImportUtils.processGPXFile).mockResolvedValue({
      routePoints: [],
      waypoints: []
    })
    
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file')
    const file = new File(['content'], 'empty.gpx', { type: 'application/gpx+xml' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('No route points found in GPX file')).toBeInTheDocument()
    })
  })
  
  it('should handle import errors', async () => {
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(true)
    vi.mocked(gpxImportUtils.processGPXFile).mockRejectedValue(new Error('Parse error'))
    
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file')
    const file = new File(['content'], 'invalid.gpx', { type: 'application/gpx+xml' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Parse error')).toBeInTheDocument()
    })
  })
  
  it('should disable button while loading', async () => {
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(true)
    vi.mocked(gpxImportUtils.processGPXFile).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<GPXImport />)
    
    const button = screen.getByTitle('Import GPX file')
    const fileInput = screen.getByLabelText('Select GPX file')
    const file = new File(['content'], 'test.gpx')
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(button).toBeDisabled()
    })
  })
  
  it('should reset file input after processing', async () => {
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(true)
    vi.mocked(gpxImportUtils.processGPXFile).mockResolvedValue({
      routePoints: [{ lat: 35.6812, lng: 139.7671 }],
      waypoints: []
    })
    vi.mocked(gpxImportUtils.confirmRouteReplacement).mockReturnValue(true)
    
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file') as HTMLInputElement
    const file = new File(['content'], 'test.gpx')
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(fileInput.value).toBe('')
    })
  })
  
  it('should not import if user cancels confirmation', async () => {
    vi.mocked(useRouteStore).mockReturnValue({
      route: { points: [{ id: '1', lat: 35.6812, lng: 139.7671 }], distance: 1 },
      clearRoute: mockClearRoute,
      addPoint: mockAddPoint,
      addWaypoint: mockAddWaypoint
    } as any)
    
    vi.mocked(gpxImportUtils.isValidGPXFile).mockReturnValue(true)
    vi.mocked(gpxImportUtils.processGPXFile).mockResolvedValue({
      routePoints: [{ lat: 35.6813, lng: 139.7672 }],
      waypoints: []
    })
    vi.mocked(gpxImportUtils.confirmRouteReplacement).mockReturnValue(false)
    
    render(<GPXImport />)
    
    const fileInput = screen.getByLabelText('Select GPX file')
    const file = new File(['content'], 'test.gpx')
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(gpxImportUtils.applyGPXData).not.toHaveBeenCalled()
    })
  })
})