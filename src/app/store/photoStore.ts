import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IPhoto } from "app/entities/photo";

interface IPhotoState {
  photos: IPhoto[];
  selectedPhotoIds: Set<string>;

  addPhotos: (photos: IPhoto[]) => void;
  removePhotos: (ids: string[]) => void;
  assignActivity: (photoIds: string[], activityId: string | null) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const usePhotoStore = create<IPhotoState>()(
  persist(
    (set) => ({
      photos: [],
      selectedPhotoIds: new Set<string>(),

      addPhotos: (newPhotos) =>
        set((state) => ({ photos: [...state.photos, ...newPhotos] })),

      removePhotos: (ids) =>
        set((state) => ({
          photos: state.photos.filter((p) => !ids.includes(p.id)),
          selectedPhotoIds: new Set(
            [...state.selectedPhotoIds].filter((id) => !ids.includes(id)),
          ),
        })),

      assignActivity: (photoIds, activityId) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            photoIds.includes(p.id) ? { ...p, activityId } : p,
          ),
        })),

      toggleSelect: (id) =>
        set((state) => {
          const next = new Set(state.selectedPhotoIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { selectedPhotoIds: next };
        }),

      selectAll: (ids) =>
        set(() => ({ selectedPhotoIds: new Set(ids) })),

      clearSelection: () =>
        set(() => ({ selectedPhotoIds: new Set<string>() })),
    }),
    {
      name: "photo-store",
      partialize: (state) => ({ photos: state.photos }),
    },
  ),
);
