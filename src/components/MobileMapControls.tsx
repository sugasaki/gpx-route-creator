import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import RouteInfoBar from '@/components/controls/RouteInfoBar'
import EditControls from '@/components/controls/EditControls'
import DeleteModeControls from '@/components/controls/DeleteModeControls'
import RangeDeleteControls from '@/components/controls/RangeDeleteControls'
import HistoryControls from '@/components/controls/HistoryControls'
import RouteActions from '@/components/controls/RouteActions'
import ModeIndicator from '@/components/controls/ModeIndicator'
import MapStyleSelector from '@/components/controls/MapStyleSelector'
import RouteColorPicker from '@/components/controls/RouteColorPicker'
import DistanceMarkerToggle from '@/components/controls/DistanceMarkerToggle'

export default function MobileMapControls() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <RouteInfoBar />
      
      {/* Mobile menu button - bottom right */}
      <button
        className="absolute bottom-4 right-4 p-4 bg-white rounded-full shadow-lg z-30"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>
      
      {/* Slide-up menu */}
      <div className={`
        absolute bottom-0 left-0 right-0 bg-white shadow-2xl z-20
        transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}
        max-h-[70vh] overflow-y-auto
      `}>
        <div className="p-4 space-y-4">
          {/* Map customization */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">マップ設定</h3>
            <div className="flex gap-2">
              <DistanceMarkerToggle />
              <RouteColorPicker />
              <MapStyleSelector />
            </div>
          </div>
          
          <div className="h-px bg-gray-200" />
          
          {/* Edit controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">編集ツール</h3>
            <EditControls />
            <DeleteModeControls />
            <RangeDeleteControls />
          </div>
          
          <div className="h-px bg-gray-200" />
          
          {/* History */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">履歴</h3>
            <HistoryControls />
          </div>
          
          <div className="h-px bg-gray-200" />
          
          {/* Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">ファイル操作</h3>
            <RouteActions />
          </div>
        </div>
      </div>
      
      <ModeIndicator />
    </>
  )
}