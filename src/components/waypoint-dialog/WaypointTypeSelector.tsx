import { WaypointType } from '@/types'

const waypointTypes: { value: WaypointType; label: string; icon: string }[] = [
  { value: 'pin', label: 'ピン', icon: '📍' },
  { value: 'food', label: '食事', icon: '🍴' },
  { value: 'rest', label: '休憩', icon: '🛏️' },
  { value: 'scenic', label: '景色', icon: '🏔️' },
  { value: 'danger', label: '注意', icon: '⚠️' },
  { value: 'info', label: '情報', icon: 'ℹ️' }
]

interface WaypointTypeSelectorProps {
  selectedType: WaypointType
  onTypeChange: (type: WaypointType) => void
}

export function WaypointTypeSelector({ selectedType, onTypeChange }: WaypointTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        タイプ
      </label>
      <div className="grid grid-cols-3 gap-2">
        {waypointTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onTypeChange(type.value)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{type.icon}</div>
            <div className="text-xs">{type.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}