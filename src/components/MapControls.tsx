import RouteInfoBar from '@/components/controls/RouteInfoBar'
import EditControls from '@/components/controls/EditControls'
import DeleteModeControls from '@/components/controls/DeleteModeControls'
import RangeDeleteControls from '@/components/controls/RangeDeleteControls'
import HistoryControls from '@/components/controls/HistoryControls'
import RouteActions from '@/components/controls/RouteActions'
import ModeIndicator from '@/components/controls/ModeIndicator'
import MapStyleSelector from '@/components/controls/MapStyleSelector'
import RouteColorPicker from '@/components/controls/RouteColorPicker'

export default function MapControls() {
  return (
    <>
      <RouteInfoBar />
      
      {/* Map style selector and color picker - top right */}
      <div className="absolute right-4 top-4 flex gap-2">
        <RouteColorPicker />
        <MapStyleSelector />
      </div>
      
      {/* Right side controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <EditControls />
        <DeleteModeControls />
        <RangeDeleteControls />
        
        <div className="h-px bg-gray-300 my-1" />
        
        <HistoryControls />
        
        <div className="h-px bg-gray-300 my-1" />
        
        <RouteActions />
      </div>
      
      <ModeIndicator />
    </>
  )
}