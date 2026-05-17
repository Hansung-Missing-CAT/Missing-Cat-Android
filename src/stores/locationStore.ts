import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  // 선택된 지역 (예: "마포구")
  selectedDistrict: string
  // 액션
  setDistrict: (district: string) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedDistrict: '전체',

      setDistrict: (district) => set({ selectedDistrict: district }),
    }),
    {
      name: 'location-storage',
    },
  ),
)
