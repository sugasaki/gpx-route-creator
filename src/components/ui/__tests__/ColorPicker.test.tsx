import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ColorPicker from '../ColorPicker'

describe('ColorPicker', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('現在の色がボタンに表示される', () => {
    render(
      <ColorPicker 
        value="#3b82f6" 
        onChange={mockOnChange}
        label="色を選択"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', '色を選択')
    
    const colorDisplay = button.querySelector('div')
    expect(colorDisplay).toHaveStyle({ backgroundColor: '#3b82f6' })
  })

  it('ボタンクリックでカラーパレットが開く', () => {
    render(
      <ColorPicker 
        value="#3b82f6" 
        onChange={mockOnChange}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('プリセットカラー')).toBeInTheDocument()
    expect(screen.getByText('カスタムカラー')).toBeInTheDocument()
  })

  it('プリセットカラーがクリック可能', () => {
    render(
      <ColorPicker 
        value="#3b82f6" 
        onChange={mockOnChange}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const redButton = screen.getByTitle('赤')
    fireEvent.click(redButton)

    expect(mockOnChange).toHaveBeenCalledWith('#ef4444')
  })

  it('カスタムプリセットカラーが使用できる', () => {
    const customColors = [
      { name: 'カスタム1', value: '#123456' },
      { name: 'カスタム2', value: '#abcdef' }
    ]

    render(
      <ColorPicker 
        value="#3b82f6" 
        onChange={mockOnChange}
        presetColors={customColors}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByTitle('カスタム1')).toBeInTheDocument()
    expect(screen.getByTitle('カスタム2')).toBeInTheDocument()
  })

  it('カスタムプリセット色をクリックしてonChangeが呼ばれる', () => {
    const customColors = [
      { name: 'カスタム1', value: '#123456' },
      { name: 'カスタム2', value: '#abcdef' }
    ]

    render(
      <ColorPicker 
        value="#3b82f6" 
        onChange={mockOnChange}
        presetColors={customColors}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const customButton = screen.getByTitle('カスタム2')
    fireEvent.click(customButton)

    expect(mockOnChange).toHaveBeenCalledWith('#abcdef')
  })
})