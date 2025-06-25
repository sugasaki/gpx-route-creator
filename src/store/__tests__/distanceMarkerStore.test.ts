import { describe, it, expect, beforeEach } from 'vitest'
import { useDistanceMarkerStore } from '../distanceMarkerStore'

describe('distanceMarkerStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useDistanceMarkerStore.setState({
      isDistanceMarkersVisible: false,
      markerInterval: 1
    })
  })

  it('初期状態が正しく設定される', () => {
    const state = useDistanceMarkerStore.getState()
    expect(state.isDistanceMarkersVisible).toBe(false)
    expect(state.markerInterval).toBe(1)
  })

  it('setDistanceMarkersVisibleが正しく動作する', () => {
    const { setDistanceMarkersVisible } = useDistanceMarkerStore.getState()
    
    setDistanceMarkersVisible(true)
    expect(useDistanceMarkerStore.getState().isDistanceMarkersVisible).toBe(true)
    
    setDistanceMarkersVisible(false)
    expect(useDistanceMarkerStore.getState().isDistanceMarkersVisible).toBe(false)
  })

  it('setMarkerIntervalが正しく動作する', () => {
    const { setMarkerInterval } = useDistanceMarkerStore.getState()
    
    setMarkerInterval(5)
    expect(useDistanceMarkerStore.getState().markerInterval).toBe(5)
    
    setMarkerInterval(0.5)
    expect(useDistanceMarkerStore.getState().markerInterval).toBe(0.5)
  })

  it('toggleDistanceMarkersが正しく動作する', () => {
    const { toggleDistanceMarkers } = useDistanceMarkerStore.getState()
    
    // 初期状態はfalse
    expect(useDistanceMarkerStore.getState().isDistanceMarkersVisible).toBe(false)
    
    // トグルでtrueに
    toggleDistanceMarkers()
    expect(useDistanceMarkerStore.getState().isDistanceMarkersVisible).toBe(true)
    
    // 再度トグルでfalseに
    toggleDistanceMarkers()
    expect(useDistanceMarkerStore.getState().isDistanceMarkersVisible).toBe(false)
  })

  it('複数の操作を連続して実行できる', () => {
    const { setDistanceMarkersVisible, setMarkerInterval, toggleDistanceMarkers } = useDistanceMarkerStore.getState()
    
    setDistanceMarkersVisible(true)
    setMarkerInterval(2)
    
    let state = useDistanceMarkerStore.getState()
    expect(state.isDistanceMarkersVisible).toBe(true)
    expect(state.markerInterval).toBe(2)
    
    toggleDistanceMarkers()
    setMarkerInterval(3)
    
    state = useDistanceMarkerStore.getState()
    expect(state.isDistanceMarkersVisible).toBe(false)
    expect(state.markerInterval).toBe(3)
  })
})