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
import { ACTIVITY_COLORS } from "app/shared/config/constants";
import { useActivityStore } from "app/app/store/activityStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const ActivityCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(ACTIVITY_COLORS[0]);
  const addActivity = useActivityStore((s) => s.addActivity);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error("활동 이름을 입력해주세요");
        return;
      }

      addActivity({
        id: uuidv4(),
        name: name.trim(),
        description: description.trim(),
        color,
        createdAt: new Date().toISOString(),
      });

      toast.success(`"${name.trim()}" 활동이 추가되었습니다`);
      setName("");
      setDescription("");
      setColor(ACTIVITY_COLORS[0]);
      setOpen(false);
    },
    [name, description, color, addActivity],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full" />}>
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        활동 추가
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 활동 추가</DialogTitle>
            <DialogDescription>
              활동 주제를 만들어 사진을 분류하세요
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="activity-name">활동 이름</Label>
              <Input
                id="activity-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 봄 소풍, 운동회, 졸업식"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="activity-desc">설명 (선택)</Label>
              <Input
                id="activity-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="활동에 대한 간단한 설명"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>색상</Label>
              <div className="flex gap-2" role="radiogroup" aria-label="활동 색상 선택">
                {ACTIVITY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    role="radio"
                    aria-checked={color === c}
                    aria-label={`색상 ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">추가</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
