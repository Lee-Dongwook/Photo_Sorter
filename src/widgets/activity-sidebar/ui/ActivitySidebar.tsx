"use client";

import { useEffect } from "react";
import { ScrollArea, Separator } from "app/shared/ui";
import { useActivityStore } from "app/app/store/activityStore";
import { usePhotoStore } from "app/app/store/photoStore";
import { ActivityBadge } from "app/entities/activity";
import { ActivityCreateDialog } from "app/features/activity-manage";
import { Layers, X } from "lucide-react";

export const ActivitySidebar = () => {
  const activities = useActivityStore((s) => s.activities);
  const selectedActivityId = useActivityStore((s) => s.selectedActivityId);
  const selectActivity = useActivityStore((s) => s.selectActivity);
  const sidebarOpen = useActivityStore((s) => s.sidebarOpen);
  const setSidebarOpen = useActivityStore((s) => s.setSidebarOpen);
  const photos = usePhotoStore((s) => s.photos);

  const unassignedCount = photos.filter((p) => !p.activityId).length;

  const handleSelectActivity = (id: string | null) => {
    selectActivity(id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r bg-background transition-transform duration-300 ease-in-out
          md:static md:z-auto md:w-64 md:translate-x-0 md:bg-muted/30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="활동 목록"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-semibold">활동 주제</h2>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="사이드바 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleSelectActivity(null)}
              className={`
                flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all md:py-2
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
              onClick={() => handleSelectActivity("unassigned")}
              className={`
                flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all md:py-2
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
                  onClick={() => handleSelectActivity(activity.id)}
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
    </>
  );
};
