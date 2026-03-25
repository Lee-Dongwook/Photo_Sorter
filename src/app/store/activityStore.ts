import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IActivity } from "app/entities/activity";

interface IActivityState {
  activities: IActivity[];
  selectedActivityId: string | null;
  sidebarOpen: boolean;

  addActivity: (activity: IActivity) => void;
  updateActivity: (id: string, updates: Partial<Omit<IActivity, "id">>) => void;
  removeActivity: (id: string) => void;
  selectActivity: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useActivityStore = create<IActivityState>()(
  persist(
    (set) => ({
      activities: [],
      selectedActivityId: null,
      sidebarOpen: false,

      addActivity: (activity) =>
        set((state) => ({ activities: [...state.activities, activity] })),

      updateActivity: (id, updates) =>
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),

      removeActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          selectedActivityId:
            state.selectedActivityId === id ? null : state.selectedActivityId,
        })),

      selectActivity: (id) => set({ selectedActivityId: id }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "activity-store",
      partialize: (state) => ({
        activities: state.activities,
        selectedActivityId: state.selectedActivityId,
      }),
    },
  ),
);
