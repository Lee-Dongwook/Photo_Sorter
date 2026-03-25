"use client";

import { useEffect, useState, useCallback } from "react";
import { usePhotobookStore } from "app/app/store/photobookStore";
import { usePhotoStore } from "app/app/store/photoStore";
import { useActivityStore } from "app/app/store/activityStore";
import { getPhotoBlob } from "app/shared/lib";
import { Button, Card } from "app/shared/ui";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

interface IPhotobookViewerProps {
  photobookId: string;
}

export const PhotobookViewer = ({ photobookId }: IPhotobookViewerProps) => {
  const photobook = usePhotobookStore((s) =>
    s.photobooks.find((pb) => pb.id === photobookId),
  );
  const photos = usePhotoStore((s) => s.photos);
  const activities = useActivityStore((s) => s.activities);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  const photobookPhotos = photobook
    ? photobook.photoIds
        .map((id) => photos.find((p) => p.id === id))
        .filter(Boolean)
    : [];

  const activity = activities.find((a) => a.id === photobook?.activityId);

  useEffect(() => {
    if (!photobook) return;

    const loadImages = async () => {
      const urls = new Map<string, string>();
      for (const id of photobook.photoIds) {
        const data = await getPhotoBlob(id);
        if (data) {
          urls.set(id, URL.createObjectURL(data.blob));
        }
      }
      setImageUrls(urls);
    };

    loadImages();

    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photobook?.id]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!photobook) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">포토북을 찾을 수 없습니다</p>
      </div>
    );
  }

  const totalPages = photobookPhotos.length;
  const currentPhoto = photobookPhotos[currentPage];

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{photobook.title}</h1>
        {activity && (
          <div className="mt-1 flex items-center justify-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: activity.color }}
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              {activity.name}
            </span>
          </div>
        )}
      </div>

      <Card className="flex aspect-[3/4] w-full max-w-lg items-center justify-center overflow-hidden bg-white p-4 shadow-xl print:shadow-none">
        {currentPhoto && imageUrls.has(currentPhoto.id) ? (
          <img
            src={imageUrls.get(currentPhoto.id)}
            alt={currentPhoto.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          </div>
        )}
      </Card>

      <div className="flex items-center gap-4 print:hidden" role="navigation" aria-label="포토북 페이지 네비게이션">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {currentPage + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
          }
          disabled={currentPage === totalPages - 1}
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          인쇄
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 print:hidden" role="tablist" aria-label="페이지 썸네일">
        {photobookPhotos.map((photo, index) => (
          <button
            key={photo!.id}
            type="button"
            onClick={() => setCurrentPage(index)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
              currentPage === index
                ? "border-primary ring-1 ring-primary/30"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            role="tab"
            aria-selected={currentPage === index}
            aria-label={`${index + 1}페이지`}
          >
            {imageUrls.has(photo!.id) ? (
              <img
                src={imageUrls.get(photo!.id)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
