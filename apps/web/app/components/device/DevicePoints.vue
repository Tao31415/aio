<script setup lang="ts">
  import { h } from 'vue'
  import type { MeasurementPoint } from '~/stores/device'
  import { useDeviceStore } from '~/stores/device'
  const deviceStore = useDeviceStore()
  const toast = useToast()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const showPointModal = ref(false)
  const editingPoint = ref<MeasurementPoint | null>(null)
  const ringNumberList = ref<string[]>([])
  const isLoadingRingNumbers = ref(false)

  const sortedMeasurementPoints = computed(() => {
    if (!deviceStore.selectedDevice?.measurementPoints) return []
    return [...deviceStore.selectedDevice.measurementPoints].toSorted(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  })

  const pointColumns = [
    {
      accessorKey: 'index',
      header: '序号',
      sortable: true,
      cell: ({ row }: { row: { index: number } }) =>
        h('span', {}, String(row.index + 1)),
    },
    { accessorKey: 'name', header: '名称' },
    { accessorKey: 'ringNumber', header: '环号' },
    { accessorKey: 'size', header: '尺寸' },
    { accessorKey: 'coordX', header: 'X' },
    { accessorKey: 'coordY', header: 'Y' },
    { accessorKey: 'coordZ', header: 'Z' },
    {
      id: 'actions',
      header: () => h('div', { class: 'text-right' }, '操作'),
      cell: ({ row }: { row: { original: MeasurementPoint } }) => {
        return h('div', { class: 'flex items-center justify-end gap-2' }, [
          h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-lucide-pencil',
            title: '编辑',
            onClick: () => openEditPointModal(row.original),
          }),
          h(UButton, {
            color: 'error',
            variant: 'ghost',
            icon: 'i-lucide-trash',
            title: '删除',
            onClick: () => deleteMeasurementPoint(row.original),
          }),
        ])
      },
    },
  ]

  const pointForm = reactive({
    name: '',
    coordX: undefined as number | undefined,
    coordY: undefined as number | undefined,
    coordZ: undefined as number | undefined,
    ringNumber: '',
    size: '',
    warningThresholdHorizontal: undefined as number | undefined,
    warningThresholdVertical: undefined as number | undefined,
    alarmThresholdHorizontal: undefined as number | undefined,
    alarmThresholdVertical: undefined as number | undefined,
  })

  function openAddPointModal() {
    editingPoint.value = null
    Object.assign(pointForm, {
      name: '',
      coordX: undefined,
      coordY: undefined,
      coordZ: undefined,
      ringNumber: '',
      size: '',
      warningThresholdHorizontal: undefined,
      warningThresholdVertical: undefined,
      alarmThresholdHorizontal: undefined,
      alarmThresholdVertical: undefined,
    })
    fetchRingNumbers()
    showPointModal.value = true
  }

  function openEditPointModal(point: MeasurementPoint) {
    editingPoint.value = point
    Object.assign(pointForm, {
      name: point.name,
      coordX: point.coordX ?? undefined,
      coordY: point.coordY ?? undefined,
      coordZ: point.coordZ ?? undefined,
      ringNumber: point.ringNumber || '',
      size: point.size || '',
      warningThresholdHorizontal: point.warningThresholdHorizontal ?? undefined,
      warningThresholdVertical: point.warningThresholdVertical ?? undefined,
      alarmThresholdHorizontal: point.alarmThresholdHorizontal ?? undefined,
      alarmThresholdVertical: point.alarmThresholdVertical ?? undefined,
    })
    fetchRingNumbers()
    showPointModal.value = true
  }

  function closePointModal() {
    showPointModal.value = false
    editingPoint.value = null
  }

  async function fetchRingNumbers() {
    if (!deviceStore.selectedDevice?.code) {
      ringNumberList.value = []
      return
    }

    try {
      isLoadingRingNumbers.value = true
      const response = await $fetch<{ data: string[] }>(
        `${apiBase}/api/v1/mqtt/tunnel-monitoring/sn/${deviceStore.selectedDevice.code}/ring-numbers`
      )
      ringNumberList.value = response.data || []
    } catch (e) {
      console.error('Failed to fetch ring numbers:', e)
      ringNumberList.value = []
    } finally {
      isLoadingRingNumbers.value = false
    }
  }

  async function createMeasurementPoint() {
    if (!deviceStore.selectedDevice) return
    try {
      await $fetch<MeasurementPoint>(`${apiBase}/api/v1/device/point`, {
        method: 'POST',
        body: {
          deviceId: deviceStore.selectedDevice.id,
          name: pointForm.name,
          coordX: pointForm.coordX,
          coordY: pointForm.coordY,
          coordZ: pointForm.coordZ,
          ringNumber: pointForm.ringNumber || undefined,
          size: pointForm.size || undefined,
          warningThresholdHorizontal: pointForm.warningThresholdHorizontal,
          warningThresholdVertical: pointForm.warningThresholdVertical,
          alarmThresholdHorizontal: pointForm.alarmThresholdHorizontal,
          alarmThresholdVertical: pointForm.alarmThresholdVertical,
        },
      })
      toast.add({ title: '测点创建成功', color: 'success' })
      closePointModal()
      await deviceStore.refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '创建失败', description: String(e), color: 'error' })
    }
  }

  async function updateMeasurementPoint() {
    if (!editingPoint.value) return
    try {
      await $fetch<MeasurementPoint>(
        `${apiBase}/api/v1/device/point/${editingPoint.value.id}`,
        {
          method: 'PUT',
          body: {
            name: pointForm.name,
            coordX: pointForm.coordX,
            coordY: pointForm.coordY,
            coordZ: pointForm.coordZ,
            ringNumber: pointForm.ringNumber || undefined,
            size: pointForm.size || undefined,
            warningThresholdHorizontal: pointForm.warningThresholdHorizontal,
            warningThresholdVertical: pointForm.warningThresholdVertical,
            alarmThresholdHorizontal: pointForm.alarmThresholdHorizontal,
            alarmThresholdVertical: pointForm.alarmThresholdVertical,
          },
        }
      )
      toast.add({ title: '测点更新成功', color: 'success' })
      closePointModal()
      await deviceStore.refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '更新失败', description: String(e), color: 'error' })
    }
  }

  async function deleteMeasurementPoint(point: MeasurementPoint) {
    if (!confirm(`确定要删除测点 "${point.name}" 吗？`)) return
    try {
      await $fetch(`${apiBase}/api/v1/device/point/${point.id}`, {
        method: 'DELETE',
      })
      toast.add({ title: '测点已删除', color: 'success' })
      await deviceStore.refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '删除失败', description: String(e), color: 'error' })
    }
  }

  function handlePointSubmit() {
    if (editingPoint.value) {
      updateMeasurementPoint()
    } else {
      createMeasurementPoint()
    }
  }
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between">
      <p class="font-medium">
        测点列表 ({{
          deviceStore.selectedDevice?.measurementPoints?.length || 0
        }})
      </p>
      <UButton
        size="sm"
        icon="i-lucide-plus"
        @click="openAddPointModal"
      />
    </div>

    <UTable
      v-if="sortedMeasurementPoints.length"
      :data="sortedMeasurementPoints"
      :columns="pointColumns"
      class="w-full"
    />

    <div
      v-else
      class="text-center py-8 text-muted"
    >
      <UIcon
        name="i-lucide-crosshair"
        class="w-12 h-12 mx-auto mb-2 opacity-50"
      />
      <p>暂无测点</p>
    </div>
  </div>

  <UModal
    v-model:open="showPointModal"
    :title="editingPoint ? '编辑测点' : '添加测点'"
  >
    <template #body>
      <UForm
        class="space-y-4"
        @submit="handlePointSubmit"
      >
        <UFormField
          label="名称"
          required
        >
          <UInput
            v-model="pointForm.name"
            placeholder="请输入测点名称"
          />
        </UFormField>
        <div class="grid grid-cols-3 gap-4">
          <UFormField label="X 坐标">
            <UInput
              v-model="pointForm.coordX"
              type="number"
              placeholder="X"
            />
          </UFormField>
          <UFormField label="Y 坐标">
            <UInput
              v-model="pointForm.coordY"
              type="number"
              placeholder="Y"
            />
          </UFormField>
          <UFormField label="Z 坐标">
            <UInput
              v-model="pointForm.coordZ"
              type="number"
              placeholder="Z"
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="环号">
            <div v-if="ringNumberList.length > 0">
              <USelect
                v-model="pointForm.ringNumber"
                :items="ringNumberList.map((rn) => ({ label: rn, value: rn }))"
                placeholder="选择或输入环号"
                :loading="isLoadingRingNumbers"
                creatable
                :create-formatter="(value: string) => ({ label: value, value })"
              />
            </div>
            <div v-else>
              <UInput
                v-model="pointForm.ringNumber"
                placeholder="环号"
              />
            </div>
          </UFormField>
          <UFormField label="尺寸">
            <UInput
              v-model="pointForm.size"
              placeholder="尺寸"
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="水平预警阈值 (mm)">
            <UInput
              v-model="pointForm.warningThresholdHorizontal"
              type="number"
              placeholder="水平位移预警阈值"
            />
          </UFormField>
          <UFormField label="垂直预警阈值 (mm)">
            <UInput
              v-model="pointForm.warningThresholdVertical"
              type="number"
              placeholder="垂直位移预警阈值"
            />
          </UFormField>
          <UFormField label="水平报警阈值 (mm)">
            <UInput
              v-model="pointForm.alarmThresholdHorizontal"
              type="number"
              placeholder="水平位移报警阈值"
            />
          </UFormField>
          <UFormField label="垂直报警阈值 (mm)">
            <UInput
              v-model="pointForm.alarmThresholdVertical"
              type="number"
              placeholder="垂直位移报警阈值"
            />
          </UFormField>
        </div>
        <div class="flex gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            class="flex-1 justify-center"
            @click="closePointModal"
          >
            取消
          </UButton>
          <UButton
            type="submit"
            color="primary"
            class="flex-1 justify-center"
          >
            {{ editingPoint ? '保存' : '添加' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
