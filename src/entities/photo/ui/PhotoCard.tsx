"use client";

import { useEffect, useState } from "react";
import { Card } from "app/shared/ui";
import { getPhotoBlob } from "app/shared/lib";
import type { IPhoto } from "../model";

interface IPhotoCardProps {
  photo: IPhoto;
  onClick?: () => void;
  selected?: boolean;
  overlay?: React.ReactNode;
}

export const PhotoCard = ({ photo, onClick, selected, overlay }: IPhotoCardProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getPhotoBlob(photo.id);
      if (data) {
        setThumbnailUrl(URL.createObjectURL(data.thumbnail));
      }
    };
    load();
    return () => {
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  return (
    <Card
      className={`
        group relative cursor-pointer overflow-hidden border-2 transition-all duration-200
        ${selected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/20"}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`사진: ${photo.name}`}
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="aspect-square bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={photo.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          </div>
        )}
      </div>
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {overlay}
        </div>
      )}
      {selected && (
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M11.5 3.5L5.5 10L2.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </Card>
  );
};
