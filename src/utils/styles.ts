import { isTouchDevice } from './device'

export const getButtonClasses = (baseClasses = '') => {
  const touchClasses = isTouchDevice() 
    ? 'p-4 min-w-[48px] min-h-[48px]' // Apple's recommended minimum touch target
    : 'p-3'
    
  return `${baseClasses} ${touchClasses}`
}

export const getIconButtonClasses = (baseClasses = '') => {
  const commonClasses = 'bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center'
  return getButtonClasses(`${commonClasses} ${baseClasses}`)
}

export const getControlButtonClasses = (isActive: boolean, colorScheme = 'blue', baseClasses = '') => {
  const colorSchemes = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    red: 'bg-red-500 hover:bg-red-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  }
  
  const activeClasses = isActive 
    ? `${colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.blue} text-white` 
    : 'bg-white text-gray-700 hover:bg-gray-50'
    
  const commonClasses = 'rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center'
  return getButtonClasses(`${commonClasses} ${activeClasses} ${baseClasses}`)
}