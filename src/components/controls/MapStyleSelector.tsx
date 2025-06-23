import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { MapIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { useUIStore } from '@/store/uiStore'
import { MAP_STYLES } from '@/constants/map'

export default function MapStyleSelector() {
  const { mapStyle, setMapStyle } = useUIStore()
  const currentStyle = MAP_STYLES[mapStyle]
  
  // Get available styles (only those with URLs or don't need API key)
  const availableStyles = Object.values(MAP_STYLES).filter(
    style => !style.needsApiKey || style.url
  )
  
  // Show warning if no MapTiler API key is configured
  const hasApiKey = Object.values(MAP_STYLES).some(
    style => style.needsApiKey && style.url
  )
  
  return (
    <div className="relative">
      <Listbox value={mapStyle} onChange={setMapStyle}>
        <div className="relative">
          <Listbox.Button className="relative w-full min-w-[120px] cursor-pointer rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span className="flex items-center">
              <MapIcon className="h-5 w-5 text-gray-700 mr-2" />
              <span className="block truncate text-gray-700">{currentStyle.name}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {availableStyles.map((style) => (
                <Listbox.Option
                  key={style.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={style.id}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {style.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <MapIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {!hasApiKey && (
        <div className="absolute top-full mt-2 right-0 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800 whitespace-nowrap">
          MapTiler styles need an API key.
          <br />
          See .env.example for details.
        </div>
      )}
    </div>
  )
}