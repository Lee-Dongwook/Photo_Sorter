"use client";

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "app/shared/ui";
import { usePhotoStore } from "app/app/store/photoStore";
import { useActivityStore } from "app/app/store/activityStore";
import { deletePhotoBlob } from "app/shared/lib";
import { FolderInput, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const PhotoSelectToolbar = () => {
  const selectedPhotoIds = usePhotoStore((s) => s.selectedPhotoIds);
  const clearSelection = usePhotoStore((s) => s.clearSelection);
  const assignActivity = usePhotoStore((s) => s.assignActivity);
  const removePhotos = usePhotoStore((s) => s.removePhotos);
  const activities = useActivityStore((s) => s.activities);

  const count = selectedPhotoIds.size;
  if (count === 0) return null;

  const ids = [...selectedPhotoIds];

  const handleAssign = (activityId: string | null) => {
    assignActivity(ids, activityId);
    const activityName = activityId
      ? activities.find((a) => a.id === activityId)?.name
      : "미분류";
    toast.success(`${count}장을 "${activityName}"(으)로 이동했습니다`);
    clearSelection();
  };

  const handleDelete = async () => {
    for (const id of ids) {
      await deletePhotoBlob(id);
    }
    removePhotos(ids);
    toast.success(`${count}장이 삭제되었습니다`);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
      <span className="text-sm font-medium">{count}장 선택</span>
      <div className="mx-2 h-4 w-px bg-primary-foreground/30" />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
          <FolderInput className="mr-2 h-4 w-4" aria-hidden="true" />
          활동 배정
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleAssign(null)}>
            미분류
          </DropdownMenuItem>
          {activities.map((activity) => (
            <DropdownMenuItem
              key={activity.id}
              onClick={() => handleAssign(activity.id)}
            >
              <span
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: activity.color }}
                aria-hidden="true"
              />
              {activity.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="secondary" size="sm" onClick={handleDelete}>
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        삭제
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={clearSelection}
        className="ml-auto text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">선택 해제</span>
      </Button>
    </div>
  );
};
