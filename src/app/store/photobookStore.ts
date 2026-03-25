import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IPhotobook } from "app/entities/photobook";

interface IPhotobookState {
  photobooks: IPhotobook[];

  addPhotobook: (photobook: IPhotobook) => void;
  updatePhotobook: (id: string, updates: Partial<Omit<IPhotobook, "id">>) => void;
  removePhotobook: (id: string) => void;
  reorderPhotos: (photobookId: string, photoIds: string[]) => void;
}

export const usePhotobookStore = create<IPhotobookState>()(
  persist(
    (set) => ({
      photobooks: [],

      addPhotobook: (photobook) =>
        set((state) => ({ photobooks: [...state.photobooks, photobook] })),

      updatePhotobook: (id, updates) =>
        set((state) => ({
          photobooks: state.photobooks.map((pb) =>
            pb.id === id ? { ...pb, ...updates } : pb,
          ),
        })),

      removePhotobook: (id) =>
        set((state) => ({
          photobooks: state.photobooks.filter((pb) => pb.id !== id),
        })),

      reorderPhotos: (photobookId, photoIds) =>
        set((state) => ({
          photobooks: state.photobooks.map((pb) =>
            pb.id === photobookId ? { ...pb, photoIds } : pb,
          ),
        })),
    }),
    {
      name: "photobook-store",
    },
  ),
);
