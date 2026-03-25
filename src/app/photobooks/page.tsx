"use client";

import Link from "next/link";
import { Header } from "app/widgets/header";
import { usePhotobookStore } from "app/app/store/photobookStore";
import { useActivityStore } from "app/app/store/activityStore";
import { usePhotoStore } from "app/app/store/photoStore";
import { Button, Card, CardContent, CardHeader, CardTitle } from "app/shared/ui";
import { BookOpen, ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

export default function PhotobooksPage() {
  const photobooks = usePhotobookStore((s) => s.photobooks);
  const removePhotobook = usePhotobookStore((s) => s.removePhotobook);
  const activities = useActivityStore((s) => s.activities);
  const photos = usePhotoStore((s) => s.photos);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                돌아가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">포토북 목록</h1>
          </div>

          {photobooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground">아직 포토북이 없습니다</p>
              <Link href="/">
                <Button variant="outline">사진 정리하러 가기</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photobooks.map((photobook) => {
                const activity = activities.find(
                  (a) => a.id === photobook.activityId,
                );
                const photoCount = photobook.photoIds.filter((id) =>
                  photos.some((p) => p.id === id),
                ).length;

                return (
                  <Card key={photobook.id} className="group relative overflow-hidden transition-shadow hover:shadow-md">
                    <Link href={`/photobooks/${photobook.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {activity && (
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: activity.color }}
                              aria-hidden="true"
                            />
                          )}
                          <CardTitle className="text-base">
                            {photobook.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{photoCount}장</span>
                          <time dateTime={photobook.createdAt}>
                            {format(
                              new Date(photobook.createdAt),
                              "yyyy.MM.dd",
                              { locale: ko },
                            )}
                          </time>
                        </div>
                      </CardContent>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => {
                        removePhotobook(photobook.id);
                        toast.success("포토북이 삭제되었습니다");
                      }}
                      aria-label={`${photobook.title} 삭제`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
