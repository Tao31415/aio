export interface Device {
  id: string
  name: string
  code: string
  project: string | null
  status?: 'online' | 'warning' | 'alarm' | 'offline'
}

export interface DeviceState {
  selectedDevice: Device | null
  deviceList: Device[]
  isLoading: boolean
}

const initialState: DeviceState = {
  selectedDevice: null,
  deviceList: [],
  isLoading: false,
}

export const useSelectedDeviceStore = defineStore('selected-device', () => {
  const deviceState = reactive(initialState)

  const selectedDevice = computed(() => deviceState.selectedDevice)
  const deviceList = computed(() => deviceState.deviceList)
  const isLoading = computed(() => deviceState.isLoading)
  const hasDevice = computed(() => deviceState.selectedDevice !== null)
  const hasDevices = computed(() => deviceState.deviceList.length > 0)
  const firstDevice = computed(() =>
    deviceState.deviceList.length > 0 ? deviceState.deviceList[0] : null
  )

  function setDeviceList(devices: Device[]) {
    deviceState.deviceList = devices
  }

  function setSelectedDevice(device: Device | null) {
    deviceState.selectedDevice = device
  }

  function setSelectedDeviceById(deviceId: string) {
    const device = deviceState.deviceList.find((d) => d.id === deviceId)
    if (device) {
      deviceState.selectedDevice = device
    }
  }

  function setLoading(loading: boolean) {
    deviceState.isLoading = loading
  }

  function clearSelection() {
    deviceState.selectedDevice = null
  }

  function reset() {
    deviceState.selectedDevice = null
    deviceState.deviceList = []
    deviceState.isLoading = false
  }

  return {
    ...toRefs(deviceState),
    selectedDevice,
    deviceList,
    isLoading,
    hasDevice,
    hasDevices,
    firstDevice,
    setDeviceList,
    setSelectedDevice,
    setSelectedDeviceById,
    setLoading,
    clearSelection,
    reset,
  }
})
