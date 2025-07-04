import { useColorPicker } from '@/hooks/useColorPicker'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presetColors?: Array<{ name: string; value: string }>
  label?: string
  className?: string
}

const DEFAULT_PRESET_COLORS = [
  { name: '青', value: '#3b82f6' },
  { name: '赤', value: '#ef4444' },
  { name: '緑', value: '#10b981' },
  { name: 'オレンジ', value: '#f59e0b' },
  { name: '紫', value: '#8b5cf6' },
  { name: 'ピンク', value: '#ec4899' },
  { name: '黄色', value: '#eab308' },
  { name: 'シアン', value: '#06b6d4' }
]

export default function ColorPicker({
  value,
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  label,
  className = ''
}: ColorPickerProps) {
  const {
    isOpen,
    customColor,
    handleColorChange,
    toggleOpen,
    handleCustomColorChange
  } = useColorPicker(value, onChange)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleOpen}
        className="p-2 bg-white rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
        title={label}
      >
        <div 
          className="w-6 h-6 rounded-md border-2 border-gray-300"
          style={{ backgroundColor: value }}
        />
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg p-4 z-10 min-w-[240px]">
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-2">プリセットカラー</h3>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`w-10 h-10 rounded-md border-2 transition-all hover:scale-110 ${
                    value === color.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <h3 className="text-sm font-medium mb-2">カスタムカラー</h3>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
              <button
                onClick={() => handleColorChange(customColor)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}