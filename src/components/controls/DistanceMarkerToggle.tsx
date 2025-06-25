import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { MapIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useDistanceMarkerStore, MarkerIntervalOption } from '@/store/distanceMarkerStore'

const intervalOptions: { value: MarkerIntervalOption; label: string }[] = [
  { value: 'auto', label: '自動' },
  { value: 'off', label: 'OFF' },
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
]

export default function DistanceMarkerToggle() {
  const { markerInterval, setMarkerInterval } = useDistanceMarkerStore()
  
  const isActive = markerInterval !== 'off'
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={`
            inline-flex items-center gap-1 px-3 py-3 rounded-lg bg-white border transition-colors
            ${isActive 
              ? 'bg-blue-50 text-blue-600 border-blue-200' 
              : 'hover:bg-gray-100 text-gray-700 border-gray-300'
            }
          `}
          title="距離マーカー設定"
        >
          <div className="relative">
            <MapIcon className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 text-[10px] font-bold">
              km
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {intervalOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    className={`
                      ${active ? 'bg-gray-100' : ''}
                      ${markerInterval === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-900'}
                      block w-full text-left px-4 py-2 text-sm
                    `}
                    onClick={() => setMarkerInterval(option.value)}
                  >
                    {option.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}