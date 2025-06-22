import { useState, useCallback } from 'react'

export function useColorPicker(initialColor: string, onColorChange: (color: string) => void) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(initialColor)

  const handleColorChange = useCallback((color: string) => {
    onColorChange(color)
    setCustomColor(color)
    setIsOpen(false)
  }, [onColorChange])

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color)
  }, [])

  return {
    isOpen,
    customColor,
    handleColorChange,
    toggleOpen,
    handleCustomColorChange
  }
}