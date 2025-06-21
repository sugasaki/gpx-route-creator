import RouteInfoBar from './controls/RouteInfoBar'
import EditControls from './controls/EditControls'
import HistoryControls from './controls/HistoryControls'
import RouteActions from './controls/RouteActions'
import ModeIndicator from './controls/ModeIndicator'

export default function MapControls() {
  return (
    <>
      <RouteInfoBar />
      
      {/* Right side controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <EditControls />
        
        <div className="h-px bg-gray-300 my-1" />
        
        <HistoryControls />
        
        <div className="h-px bg-gray-300 my-1" />
        
        <RouteActions />
      </div>
      
      <ModeIndicator />
    </>
  )
}