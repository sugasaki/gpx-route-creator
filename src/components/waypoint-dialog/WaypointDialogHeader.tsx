interface WaypointDialogHeaderProps {
  isEditMode: boolean
  distance?: number
}

export function WaypointDialogHeader({ isEditMode, distance }: WaypointDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">
        {isEditMode ? 'Waypointを編集' : 'Waypointを追加'}
      </h2>
      {distance !== undefined && (
        <span className="text-base text-blue-600 font-semibold">
          始点から: {distance.toFixed(2)}km
        </span>
      )}
    </div>
  )
}