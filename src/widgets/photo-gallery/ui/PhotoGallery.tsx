"use client";

import { useMemo } from "react";
import { usePhotoStore } from "app/app/store/photoStore";
import { useActivityStore } from "app/app/store/activityStore";
import { PhotoCard } from "app/entities/photo";
import { PhotoUploader } from "app/features/photo-upload";
import { PhotoSelectToolbar } from "app/features/photo-select";
import { PhotobookCreateDialog } from "app/features/photobook-create";
import { ImageIcon } from "lucide-react";

export const PhotoGallery = () => {
  const photos = usePhotoStore((s) => s.photos);
  const selectedPhotoIds = usePhotoStore((s) => s.selectedPhotoIds);
  const toggleSelect = usePhotoStore((s) => s.toggleSelect);
  const selectedActivityId = useActivityStore((s) => s.selectedActivityId);
  const activities = useActivityStore((s) => s.activities);

  const filteredPhotos = useMemo(() => {
    if (selectedActivityId === null) return photos;
    if (selectedActivityId === "unassigned")
      return photos.filter((p) => !p.activityId);
    return photos.filter((p) => p.activityId === selectedActivityId);
  }, [photos, selectedActivityId]);

  const currentActivity = activities.find((a) => a.id === selectedActivityId);
  const title =
    selectedActivityId === null
      ? "전체 사진"
      : selectedActivityId === "unassigned"
        ? "미분류"
        : currentActivity?.name ?? "";

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentActivity && (
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: currentActivity.color }}
              aria-hidden="true"
            />
          )}
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            {filteredPhotos.length}장
          </span>
        </div>
        <PhotobookCreateDialog />
      </div>

      <PhotoSelectToolbar />

      {filteredPhotos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="font-medium text-muted-foreground">
              사진이 없습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              아래에서 사진을 업로드해 보세요
            </p>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          role="grid"
          aria-label="사진 목록"
        >
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              selected={selectedPhotoIds.has(photo.id)}
              onClick={() => toggleSelect(photo.id)}
            />
          ))}
        </div>
      )}

      <PhotoUploader />
    </div>
  );
};
