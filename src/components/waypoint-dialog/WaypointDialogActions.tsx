interface WaypointDialogActionsProps {
  isEditMode: boolean
  onCancel: () => void
  onDelete?: () => void
}

export function WaypointDialogActions({
  isEditMode,
  onCancel,
  onDelete
}: WaypointDialogActionsProps) {
  return (
    <div className="flex gap-2">
      {isEditMode && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          削除
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        キャンセル
      </button>
      <button
        type="submit"
        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {isEditMode ? '更新' : '追加'}
      </button>
    </div>
  )
}