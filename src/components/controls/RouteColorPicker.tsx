import ColorPicker from '../ui/ColorPicker'
import { useColorStore } from '../../store/colorStore'

export default function RouteColorPicker() {
  const { routeLineColor, setRouteLineColor } = useColorStore()

  return (
    <ColorPicker
      value={routeLineColor}
      onChange={setRouteLineColor}
      label="ルートの色を変更"
    />
  )
}