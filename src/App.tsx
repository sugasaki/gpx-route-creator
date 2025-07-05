import Map from '@/components/Map'
import DropZone from '@/components/map/DropZone'

function App() {
  return (
    <div className="h-screen w-screen">
      <DropZone>
        <Map />
      </DropZone>
    </div>
  )
}

export default App