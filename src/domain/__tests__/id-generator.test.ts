import { describe, it, expect } from 'vitest'
import { generateId } from '../id-generator'

describe('generateId', () => {
  it('should generate a string ID', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })
  
  it('should generate non-empty IDs', () => {
    const id = generateId()
    expect(id.length).toBeGreaterThan(0)
  })
  
  it('should generate unique IDs', () => {
    const ids = new Set()
    const iterations = 1000
    
    for (let i = 0; i < iterations; i++) {
      ids.add(generateId())
    }
    
    // すべてのIDがユニークである
    expect(ids.size).toBe(iterations)
  })
  
  it('should generate IDs with consistent format', () => {
    const id = generateId()
    // UUIDフォーマット（ハイフン含む）または英数字のみ
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const isSimpleId = /^[a-z0-9]+$/.test(id)
    expect(isUUID || isSimpleId).toBe(true)
  })
  
  it('should generate IDs with reasonable length', () => {
    const ids = Array.from({ length: 100 }, () => generateId())
    
    ids.forEach(id => {
      // UUIDは36文字、フォールバックは8-12文字
      const isUUID = id.length === 36 && id.includes('-')
      const isSimpleId = id.length >= 8 && id.length <= 12
      expect(isUUID || isSimpleId).toBe(true)
    })
  })
})