import type { IActivity } from "../model";

interface IActivityBadgeProps {
  activity: IActivity;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
}

export const ActivityBadge = ({ activity, count, selected, onClick }: IActivityBadgeProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
        ${selected
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
        }
      `}
      aria-pressed={selected}
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: activity.color }}
        aria-hidden="true"
      />
      <span className="truncate">{activity.name}</span>
      {count !== undefined && (
        <span className={`
          ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-xs
          ${selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"}
        `}>
          {count}
        </span>
      )}
    </button>
  );
};
