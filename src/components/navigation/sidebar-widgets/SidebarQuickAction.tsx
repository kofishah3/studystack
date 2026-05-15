import Link from "next/link";
import FullButton from "../../inputs/FullButton";

export default function SidebarQuickAction() {
  return (
    <div id="quick-action-widget" className="w-full flex flex-col gap-3">
      <Link href="/ask" className="w-full">
        <FullButton label="Ask Question" />
      </Link>
    </div>
  );
}
