import { MapIcon } from '@heroicons/react/24/outline'
import { useDistanceMarkerStore } from '@/store/distanceMarkerStore'

export default function DistanceMarkerToggle() {
  const { isDistanceMarkersVisible, toggleDistanceMarkers } = useDistanceMarkerStore()
  
  return (
    <button
      onClick={toggleDistanceMarkers}
      className={`
        p-3 rounded-lg bg-white border transition-colors
        ${isDistanceMarkersVisible 
          ? 'bg-blue-50 text-blue-600 border-blue-200' 
          : 'hover:bg-gray-100 text-gray-700 border-gray-300'
        }
      `}
      title={isDistanceMarkersVisible ? '距離マーカーを非表示' : '距離マーカーを表示'}
    >
      <div className="relative">
        <MapIcon className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 text-[10px] font-bold">
          km
        </span>
      </div>
    </button>
  )
}