interface WaypointFormFieldsProps {
  name: string
  description: string
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
}

export function WaypointFormFields({
  name,
  description,
  onNameChange,
  onDescriptionChange
}: WaypointFormFieldsProps) {
  return (
    <>
      {/* 名前入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例: 展望台"
          autoFocus
        />
      </div>
      
      {/* 説明入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例: 富士山が見える絶景スポット"
          rows={3}
        />
      </div>
    </>
  )
}