"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "app/shared/ui";
import { usePhotoStore } from "app/app/store/photoStore";
import { useActivityStore } from "app/app/store/activityStore";
import { usePhotobookStore } from "app/app/store/photobookStore";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

export const PhotobookCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const photos = usePhotoStore((s) => s.photos);
  const selectedActivityId = useActivityStore((s) => s.selectedActivityId);
  const activities = useActivityStore((s) => s.activities);
  const addPhotobook = usePhotobookStore((s) => s.addPhotobook);

  const activityPhotos = photos.filter(
    (p) => p.activityId === selectedActivityId,
  );
  const activity = activities.find((a) => a.id === selectedActivityId);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        toast.error("포토북 제목을 입력해주세요");
        return;
      }
      if (!selectedActivityId) {
        toast.error("활동을 먼저 선택해주세요");
        return;
      }
      if (activityPhotos.length === 0) {
        toast.error("선택된 활동에 사진이 없습니다");
        return;
      }

      addPhotobook({
        id: uuidv4(),
        title: title.trim(),
        activityId: selectedActivityId,
        photoIds: activityPhotos.map((p) => p.id),
        createdAt: new Date().toISOString(),
      });

      toast.success(`"${title.trim()}" 포토북이 생성되었습니다`);
      setTitle("");
      setOpen(false);
    },
    [title, selectedActivityId, activityPhotos, addPhotobook],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            disabled={!selectedActivityId || activityPhotos.length === 0}
          />
        }
      >
        <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
        포토북 만들기
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>포토북 만들기</DialogTitle>
            <DialogDescription>
              {activity
                ? `"${activity.name}" 활동의 사진 ${activityPhotos.length}장으로 포토북을 만듭니다`
                : "활동을 선택해주세요"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="photobook-title">포토북 제목</Label>
              <Input
                id="photobook-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026년 봄 소풍 포토북"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              포함될 사진: {activityPhotos.length}장
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">만들기</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
