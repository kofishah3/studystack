interface SidebarProps {
  isCollapsed?: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <div
      id="sidebar-container"
      className="flex-1 w-xs bg-surface p-3 rounded-bl-xl border-r border-border"
    >
      <div id="category-container" className="h-fit w-full">
        s
      </div>
    </div>
  );
}
