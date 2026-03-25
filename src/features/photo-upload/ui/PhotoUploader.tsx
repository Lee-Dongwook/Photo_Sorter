"use client";

import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "app/shared/ui";
import { savePhotoBlob, createThumbnail } from "app/shared/lib";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from "app/shared/config/constants";
import { usePhotoStore } from "app/app/store/photoStore";
import type { IPhoto } from "app/entities/photo";
import { Upload, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export const PhotoUploader = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const addPhotos = usePhotoStore((s) => s.addPhotos);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter((file) => {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`지원하지 않는 형식: ${file.name}`);
          return false;
        }
        if (file.size > MAX_UPLOAD_SIZE) {
          toast.error(`파일이 너무 큽니다 (10MB 초과): ${file.name}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const newPhotos: IPhoto[] = [];

      for (const file of validFiles) {
        const id = uuidv4();
        const thumbnail = await createThumbnail(file);
        const { width, height } = await getImageDimensions(file);
        await savePhotoBlob(id, file, thumbnail);

        newPhotos.push({
          id,
          name: file.name,
          size: file.size,
          width,
          height,
          activityId: null,
          createdAt: new Date().toISOString(),
        });
      }

      addPhotos(newPhotos);
      toast.success(`${newPhotos.length}장의 사진이 추가되었습니다`);
    },
    [addPhotos],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-4 transition-colors hover:border-muted-foreground/40 hover:bg-muted/50 md:gap-4 md:p-8"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      role="region"
      aria-label="사진 업로드 영역"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 md:h-12 md:w-12">
        <ImagePlus className="h-5 w-5 text-primary md:h-6 md:w-6" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          사진을 드래그하거나 클릭해서 업로드하세요
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WebP, HEIC (최대 10MB)
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
        파일 선택
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
        aria-label="사진 파일 선택"
      />
    </div>
  );
};
