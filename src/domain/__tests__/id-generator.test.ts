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
    // 英数字のみで構成されている
    expect(id).toMatch(/^[a-z0-9]+$/)
  })
  
  it('should generate IDs with reasonable length', () => {
    const ids = Array.from({ length: 100 }, () => generateId())
    
    ids.forEach(id => {
      expect(id.length).toBeGreaterThanOrEqual(8)
      expect(id.length).toBeLessThanOrEqual(12)
    })
  })
})