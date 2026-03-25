"use client";

import Link from "next/link";
import { APP_NAME } from "app/shared/config/constants";
import { Button } from "app/shared/ui";
import { usePhotobookStore } from "app/app/store/photobookStore";
import { Camera, BookOpen } from "lucide-react";

export const Header = () => {
  const photobookCount = usePhotobookStore((s) => s.photobooks.length);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
          <h1 className="text-lg font-bold">{APP_NAME}</h1>
        </Link>
        <nav aria-label="주요 네비게이션">
          <Link href="/photobooks">
            <Button variant="ghost" size="sm">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
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
