import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import WaypointDialog from './WaypointDialog'
import { useUIStore } from '@/store/uiStore'
import { useRouteStore } from '@/store/routeStore'

// モックの設定
vi.mock('@/store/uiStore')
vi.mock('@/store/routeStore')
vi.mock('@/utils/geo', () => ({
  calculateDistanceToWaypoint: vi.fn(() => 5.5)
}))

const mockUIStore = {
  waypointDialogOpen: true,
  setWaypointDialogOpen: vi.fn(),
  pendingWaypoint: null,
  setPendingWaypoint: vi.fn(),
  selectedWaypointId: null,
  setSelectedWaypoint: vi.fn()
}

const mockRouteStore = {
  waypoints: [],
  route: { points: [], distance: 0 },
  addWaypoint: vi.fn(),
  updateWaypoint: vi.fn(),
  deleteWaypoint: vi.fn()
}

describe('WaypointDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useUIStore as any).mockImplementation((selector: any) => selector(mockUIStore))
    ;(useRouteStore as any).mockImplementation((selector: any) => selector(mockRouteStore))
  })

  describe('表示/非表示', () => {
    it('waypointDialogOpenがfalseの場合、何も表示されない', () => {
      mockUIStore.waypointDialogOpen = false
      const { container } = render(<WaypointDialog />)
      expect(container.firstChild).toBeNull()
    })

    it('waypointDialogOpenがtrueの場合、ダイアログが表示される', () => {
      mockUIStore.waypointDialogOpen = true
      render(<WaypointDialog />)
      expect(screen.getByText('Waypointを追加')).toBeInTheDocument()
    })
  })

  describe('新規作成モード', () => {
    beforeEach(() => {
      mockUIStore.waypointDialogOpen = true
      mockUIStore.selectedWaypointId = null
      mockUIStore.pendingWaypoint = {
        lat: 35.6762,
        lng: 139.6503,
        nearestPointIndex: 0
      }
      mockRouteStore.route.points = [
        { id: '1', lat: 35.6762, lng: 139.6503 },
        { id: '2', lat: 35.6812, lng: 139.7671 }
      ]
    })

    it('新規作成時のタイトルが表示される', () => {
      render(<WaypointDialog />)
      expect(screen.getByText('Waypointを追加')).toBeInTheDocument()
    })

    it('距離が計算されて表示される', () => {
      render(<WaypointDialog />)
      expect(screen.getByText('始点から: 5.50km')).toBeInTheDocument()
    })

    it('名前が必須項目として表示される', () => {
      render(<WaypointDialog />)
      expect(screen.getByText('名前')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('フォームを送信すると新しいWaypointが追加される', async () => {
      const user = userEvent.setup()
      render(<WaypointDialog />)

      const nameInput = screen.getByPlaceholderText('例: 展望台')
      await user.type(nameInput, 'テストポイント')

      const submitButton = screen.getByText('追加')
      await user.click(submitButton)

      expect(mockRouteStore.addWaypoint).toHaveBeenCalledWith({
        lat: 35.6762,
        lng: 139.6503,
        name: 'テストポイント',
        description: undefined,
        type: 'pin',
        nearestPointIndex: 0
      })
    })

    it('名前が空の場合、バリデーションエラーが表示される', async () => {
      const user = userEvent.setup()
      window.alert = vi.fn()
      
      render(<WaypointDialog />)
      
      const submitButton = screen.getByText('追加')
      await user.click(submitButton)

      expect(window.alert).toHaveBeenCalledWith('名前を入力してください')
      expect(mockRouteStore.addWaypoint).not.toHaveBeenCalled()
    })
  })

  describe('編集モード', () => {
    beforeEach(() => {
      mockUIStore.waypointDialogOpen = true
      mockUIStore.selectedWaypointId = 'waypoint-1'
      mockRouteStore.waypoints = [{
        id: 'waypoint-1',
        name: '既存のポイント',
        description: '説明文',
        type: 'rest' as const,
        lat: 35.6762,
        lng: 139.6503,
        distanceFromStart: 3.5
      }]
    })

    it('編集時のタイトルが表示される', () => {
      render(<WaypointDialog />)
      expect(screen.getByText('Waypointを編集')).toBeInTheDocument()
    })

    it('既存の値がフォームに反映される', () => {
      render(<WaypointDialog />)
      expect(screen.getByDisplayValue('既存のポイント')).toBeInTheDocument()
      expect(screen.getByDisplayValue('説明文')).toBeInTheDocument()
    })

    it('削除ボタンが表示される', () => {
      render(<WaypointDialog />)
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    it('更新ボタンをクリックすると更新される', async () => {
      const user = userEvent.setup()
      render(<WaypointDialog />)

      const nameInput = screen.getByDisplayValue('既存のポイント')
      await user.clear(nameInput)
      await user.type(nameInput, '更新されたポイント')

      const updateButton = screen.getByText('更新')
      await user.click(updateButton)

      expect(mockRouteStore.updateWaypoint).toHaveBeenCalledWith('waypoint-1', {
        name: '更新されたポイント',
        description: '説明文',
        type: 'rest'
      })
    })
  })

  describe('インタラクション', () => {
    beforeEach(() => {
      mockUIStore.waypointDialogOpen = true
    })

    it('キャンセルボタンでダイアログが閉じる', async () => {
      const user = userEvent.setup()
      render(<WaypointDialog />)

      const cancelButton = screen.getByText('キャンセル')
      await user.click(cancelButton)

      expect(mockUIStore.setWaypointDialogOpen).toHaveBeenCalledWith(false)
      expect(mockUIStore.setPendingWaypoint).toHaveBeenCalledWith(null)
      expect(mockUIStore.setSelectedWaypoint).toHaveBeenCalledWith(null)
    })

    it('オーバーレイクリックでダイアログが閉じる', async () => {
      const user = userEvent.setup()
      render(<WaypointDialog />)

      const overlay = screen.getByRole('dialog')
      await user.click(overlay)

      expect(mockUIStore.setWaypointDialogOpen).toHaveBeenCalledWith(false)
    })

    it('タイプボタンをクリックすると選択される', async () => {
      const user = userEvent.setup()
      render(<WaypointDialog />)

      const foodButton = screen.getByText('食事').closest('button')
      await user.click(foodButton!)

      expect(foodButton).toHaveClass('border-blue-500')
    })
  })
})