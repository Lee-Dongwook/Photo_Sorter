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
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {currentActivity && (
            <span
              className="h-3.5 w-3.5 rounded-full md:h-4 md:w-4"
              style={{ backgroundColor: currentActivity.color }}
              aria-hidden="true"
            />
          )}
          <h2 className="text-lg font-bold md:text-xl">{title}</h2>
          <span className="text-xs text-muted-foreground md:text-sm">
            {filteredPhotos.length}장
          </span>
        </div>
        <PhotobookCreateDialog />
      </div>

      <PhotoSelectToolbar />

      {filteredPhotos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted md:h-16 md:w-16">
            <ImageIcon className="h-7 w-7 text-muted-foreground md:h-8 md:w-8" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground md:text-base">
              사진이 없습니다
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70 md:text-sm">
              아래에서 사진을 업로드해 보세요
            </p>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
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
