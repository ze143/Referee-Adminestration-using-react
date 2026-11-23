import { memo } from "react";
import { Flag, Video, Eye, Bell, Check } from "lucide-react";

function RefereeCrewBadges({ match, onToggleNotify }) {
  const items = [
    {
      role: "main",
      icon: Flag,
      name: match.main_referee?.full_name,
      notified: match.main_referee_notified,
      color: "bg-blue-500/20 text-blue-300",
    },
    {
      role: "assistant1",
      icon: Flag,
      name: match.assistant1?.full_name,
      notified: match.assistant1_notified,
      color: "bg-green-500/20 text-green-300",
    },
    {
      role: "assistant2",
      icon: Flag,
      name: match.assistant2?.full_name,
      notified: match.assistant2_notified,
      color: "bg-green-500/20 text-green-300",
    },
    {
      role: "fourth",
      icon: Flag,
      name: match.fourth_referee?.full_name,
      notified: match.fourth_referee_notified,
      color: "bg-yellow-500/20 text-yellow-300",
    },
    {
      role: "var",
      icon: Video,
      name: match.var_referee?.full_name,
      notified: match.var_referee_notified,
      color: "bg-red-500/20 text-red-300",
    },
    {
      role: "avar",
      icon: Video,
      name: match.avar_referee?.full_name,
      notified: match.avar_referee_notified,
      color: "bg-red-500/20 text-red-300",
    },
    {
      role: "supervisor",
      icon: Eye,
      name: match.supervisor?.full_name,
      notified: true,
      color: "bg-purple-500/20 text-purple-300",
    },
    {
      role: "video_supervisor",
      icon: Video,
      name: match.video_supervisor?.full_name,
      notified: true,
      color: "bg-red-500/20 text-red-300",
    },
  ].filter((i) => i.name);

  if (items.length === 0) {
    return <span className="text-white/30 text-xs">— لم يتم التعيين —</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.role}
            className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-xs ${item.color}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate" title={item.name}>
                {item.name}
              </span>
            </div>
            {item.role !== "supervisor" && (
              <button
                onClick={() =>
                  onToggleNotify?.(match.id, item.role, item.notified)
                }
                className={`flex-shrink-0 p-0.5 rounded ${
                  item.notified
                    ? "text-green-400"
                    : "text-white/30 hover:text-white/60"
                }`}
                title={item.notified ? "تم التبليغ" : "لم يتم التبليغ"}
              >
                {item.notified ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Bell className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(RefereeCrewBadges);