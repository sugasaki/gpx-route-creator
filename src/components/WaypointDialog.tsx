import { useWaypointDialog } from '@/hooks/useWaypointDialog'
import { WaypointDialogHeader } from './waypoint-dialog/WaypointDialogHeader'
import { WaypointFormFields } from './waypoint-dialog/WaypointFormFields'
import { WaypointTypeSelector } from './waypoint-dialog/WaypointTypeSelector'
import { WaypointDialogActions } from './waypoint-dialog/WaypointDialogActions'

export default function WaypointDialog() {
  const {
    waypointDialogOpen,
    isEditMode,
    formData,
    currentDistance,
    setFormData,
    handleSubmit,
    handleDelete,
    handleClose
  } = useWaypointDialog()
  
  if (!waypointDialogOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
        role="dialog"
        aria-label="ダイアログの背景"
      />
      
      {/* ダイアログ */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="p-6">
          <WaypointDialogHeader 
            isEditMode={isEditMode} 
            distance={currentDistance} 
          />
          
          <WaypointFormFields
            name={formData.name}
            description={formData.description}
            onNameChange={(name) => setFormData({ ...formData, name })}
            onDescriptionChange={(description) => setFormData({ ...formData, description })}
          />
          
          <WaypointTypeSelector
            selectedType={formData.type}
            onTypeChange={(type) => setFormData({ ...formData, type })}
          />
          
          <WaypointDialogActions
            isEditMode={isEditMode}
            onCancel={handleClose}
            onDelete={isEditMode ? handleDelete : undefined}
            // onSubmitは不要（フォーム送信で処理される）
          />
        </form>
      </div>
    </div>
  )
}