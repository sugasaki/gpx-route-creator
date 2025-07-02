import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateId } from '../id-generator'

describe('generateId with crypto.randomUUID', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  it('should use crypto.randomUUID when available', () => {
    const mockRandomUUID = vi.fn(() => '123e4567-e89b-12d3-a456-426614174000')
    vi.stubGlobal('crypto', {
      randomUUID: mockRandomUUID
    })
    
    const id = generateId()
    expect(id).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(mockRandomUUID).toHaveBeenCalledOnce()
  })
  
  it('should fall back to Math.random when crypto.randomUUID is not available', () => {
    vi.stubGlobal('crypto', {})
    
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(id).toMatch(/^[a-z0-9]+$/)
  })
  
  it('should fall back when crypto is not available', () => {
    vi.stubGlobal('crypto', undefined)
    
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(id).toMatch(/^[a-z0-9]+$/)
  })
  
  it('should fall back when randomUUID throws an error', () => {
    const mockRandomUUID = vi.fn(() => {
      throw new Error('Not in secure context')
    })
    vi.stubGlobal('crypto', {
      randomUUID: mockRandomUUID
    })
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(id).toMatch(/^[a-z0-9]+$/)
    expect(consoleSpy).toHaveBeenCalledWith(
      'crypto.randomUUID() failed, falling back to Math.random',
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })
})