"use client";

import { Header } from "app/widgets/header";
import { ActivitySidebar } from "app/widgets/activity-sidebar";
import { PhotoGallery } from "app/widgets/photo-gallery";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ActivitySidebar />
        <main className="flex flex-1 overflow-y-auto">
          <PhotoGallery />
        </main>
      </div>
    </div>
  );
}
