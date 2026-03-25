"use client";

import { use } from "react";
import Link from "next/link";
import { Header } from "app/widgets/header";
import { PhotobookViewer } from "app/widgets/photobook-viewer";
import { Button } from "app/shared/ui";
import { ArrowLeft } from "lucide-react";

export default function PhotobookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex items-center gap-2 border-b px-3 py-2 md:px-6">
        <Link href="/photobooks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            포토북 목록
          </Button>
        </Link>
      </div>
      <main className="flex flex-1 overflow-y-auto">
        <PhotobookViewer photobookId={id} />
      </main>
    </div>
  );
}
