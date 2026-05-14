import SidebarQuickAction from "./sidebar-widgets/SidebarQuickAction";
import SidebarHeatmap from "./sidebar-widgets/SidebarHeatmap";
import SidebarLeaderboard from "./sidebar-widgets/SidebarLeaderboard";

interface SidebarProps {
  isCollapsed?: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <aside
      id="sidebar-container"
      className="w-xs bg-surface p-4 border-r border-border h-full overflow-y-auto flex flex-col gap-6"
    >
      <div id="quick-actions-section" className="w-full">
        <SidebarQuickAction />
      </div>

      <div id="heatmap-section" className="w-full">
        <SidebarHeatmap />
      </div>

      <div id="leaderboard-section" className="w-full">
        <SidebarLeaderboard />
      </div>
    </aside>
  );
}
