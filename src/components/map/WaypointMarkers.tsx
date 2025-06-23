import React, { useState } from 'react'
import { Marker, Popup } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { Waypoint, WaypointType } from '@/types'

// Waypointタイプごとのアイコン設定
const getWaypointIcon = (type: WaypointType, isSelected: boolean): React.ReactNode => {
  let iconHtml = ''
  
  switch (type) {
    case 'pin':
      iconHtml = `<svg viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#10b981'}" class="w-6 h-6">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`
      break
    case 'food':
      iconHtml = `<svg viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#f59e0b'}" class="w-6 h-6">
        <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>`
      break
    case 'rest':
      iconHtml = `<svg viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#3b82f6'}" class="w-6 h-6">
        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
      </svg>`
      break
    case 'scenic':
      iconHtml = `<svg viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#8b5cf6'}" class="w-6 h-6">
        <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>
      </svg>`
      break
    case 'danger':
      iconHtml = `<svg viewBox="0 0 24 24" fill="${isSelected ? '#dc2626' : '#ef4444'}" class="w-6 h-6">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>`
      break
    case 'info':
      iconHtml = `<svg viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#6b7280'}" class="w-6 h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>`
      break
  }
  
  return (
    <div
      className={`waypoint-marker ${isSelected ? 'selected' : ''}`}
      dangerouslySetInnerHTML={{ __html: iconHtml }}
    />
  )
}

export default function WaypointMarkers() {
  const waypoints = useRouteStore((state) => state.waypoints)
  const selectedWaypointId = useUIStore((state) => state.selectedWaypointId)
  const setSelectedWaypoint = useUIStore((state) => state.setSelectedWaypoint)
  const editMode = useUIStore((state) => state.editMode)
  const setWaypointDialogOpen = useUIStore((state) => state.setWaypointDialogOpen)
  const [popupWaypoint, setPopupWaypoint] = useState<Waypoint | null>(null)
  
  const handleWaypointClick = (waypointId: string) => {
    if (editMode === 'waypoint') {
      setSelectedWaypoint(waypointId)
      setWaypointDialogOpen(true)
    }
  }
  
  return (
    <>
      {waypoints.map((waypoint) => (
        <Marker
          key={waypoint.id}
          longitude={waypoint.lng}
          latitude={waypoint.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            handleWaypointClick(waypoint.id)
            setPopupWaypoint(waypoint)
          }}
        >
          {getWaypointIcon(waypoint.type, waypoint.id === selectedWaypointId)}
        </Marker>
      ))}
      
      {popupWaypoint && (
        <Popup
          longitude={popupWaypoint.lng}
          latitude={popupWaypoint.lat}
          anchor="bottom"
          offset={[0, -35]}
          onClose={() => setPopupWaypoint(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-2 min-w-[150px]">
            <h3 className="font-bold">{popupWaypoint.name}</h3>
            {popupWaypoint.description && (
              <p className="text-sm text-gray-600 mt-1">{popupWaypoint.description}</p>
            )}
            {popupWaypoint.elevation && (
              <p className="text-xs text-gray-500 mt-1">標高: {popupWaypoint.elevation.toFixed(1)}m</p>
            )}
          </div>
        </Popup>
      )}
      
      <style>{`
        .waypoint-icon {
          background: none !important;
          border: none !important;
        }
        
        .waypoint-marker {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          transition: transform 0.2s;
        }
        
        .waypoint-marker:hover {
          transform: scale(1.1);
        }
        
        .waypoint-marker.selected {
          transform: scale(1.2);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        
        .waypoint-marker svg {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </>
  )
}