"use client";

import Link from "next/link";
import { APP_NAME } from "app/shared/config/constants";
import { Button } from "app/shared/ui";
import { usePhotobookStore } from "app/app/store/photobookStore";
import { useActivityStore } from "app/app/store/activityStore";
import { Camera, BookOpen, Menu } from "lucide-react";

export const Header = () => {
  const photobookCount = usePhotobookStore((s) => s.photobooks.length);
  const toggleSidebar = useActivityStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between px-3 md:h-14 md:px-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="활동 목록 열기"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
            <h1 className="text-base font-bold md:text-lg">{APP_NAME}</h1>
          </Link>
        </div>
        <nav aria-label="주요 네비게이션">
          <Link href="/photobooks">
            <Button variant="ghost" size="sm">
              <BookOpen className="mr-1.5 h-4 w-4 md:mr-2" aria-hidden="true" />
              포토북
              {photobookCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {photobookCount}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
