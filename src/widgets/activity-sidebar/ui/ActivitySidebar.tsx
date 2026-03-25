"use client";

import { ScrollArea, Separator } from "app/shared/ui";
import { useActivityStore } from "app/app/store/activityStore";
import { usePhotoStore } from "app/app/store/photoStore";
import { ActivityBadge } from "app/entities/activity";
import { ActivityCreateDialog } from "app/features/activity-manage";
import { Layers } from "lucide-react";

export const ActivitySidebar = () => {
  const activities = useActivityStore((s) => s.activities);
  const selectedActivityId = useActivityStore((s) => s.selectedActivityId);
  const selectActivity = useActivityStore((s) => s.selectActivity);
  const photos = usePhotoStore((s) => s.photos);

  const unassignedCount = photos.filter((p) => !p.activityId).length;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/30" aria-label="활동 목록">
      <div className="flex items-center gap-2 px-4 py-3">
        <Layers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold">활동 주제</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => selectActivity(null)}
            className={`
              flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
              ${selectedActivityId === null
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground hover:bg-muted"
              }
            `}
            aria-pressed={selectedActivityId === null}
          >
            <span className="h-3 w-3 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden="true" />
            <span>전체 사진</span>
            <span className={`
              ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-xs
              ${selectedActivityId === null
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-background text-muted-foreground"
              }
            `}>
              {photos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectActivity("unassigned")}
            className={`
              flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
              ${selectedActivityId === "unassigned"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground hover:bg-muted"
              }
            `}
            aria-pressed={selectedActivityId === "unassigned"}
          >
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40" aria-hidden="true" />
            <span>미분류</span>
            <span className={`
              ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-xs
              ${selectedActivityId === "unassigned"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-background text-muted-foreground"
              }
            `}>
              {unassignedCount}
            </span>
          </button>

          {activities.length > 0 && <Separator className="my-2" />}

          {activities.map((activity) => {
            const count = photos.filter(
              (p) => p.activityId === activity.id,
            ).length;
            return (
              <ActivityBadge
                key={activity.id}
                activity={activity}
                count={count}
                selected={selectedActivityId === activity.id}
                onClick={() => selectActivity(activity.id)}
              />
            );
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <ActivityCreateDialog />
      </div>
    </aside>
  );
};
