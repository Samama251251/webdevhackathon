import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Briefcase,
  Mic,
  User,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user: any;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onSignOut: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  resumeExists: boolean;
}

export function Sidebar({
  user,
  activeTab,
  onTabChange,
  onSignOut,
  isCollapsed,
  setIsCollapsed,
  resumeExists,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      id: "resume",
      label: "Resume",
      icon: FileText,
      disabled: false,
      action: () => {
        if (currentPath === "/dashboard") {
          onTabChange?.("resume");
        } else {
          navigate("/dashboard", { state: { tab: "resume" } });
        }
      },
    },
    {
      id: "jobs",
      label: "Job Matching",
      icon: Briefcase,
      disabled: !resumeExists,
      action: () => {
        if (currentPath === "/dashboard") {
          onTabChange?.("jobs");
        } else {
          navigate("/dashboard", { state: { tab: "jobs" } });
        }
      },
    },
    {
      id: "interview",
      label: "AI Interview Prep",
      icon: Mic,
      disabled: false,
      action: () => {
        navigate("/deep-research");
      },
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      disabled: false,
      action: () => {
        navigate("/analytics");
      },
    },
  ];

  const isItemActive = (itemId: string) => {
    if (activeTab === itemId) return true;
    if (itemId === "interview" && currentPath === "/deep-research") return true;
    if (itemId === "analytics" && currentPath === "/analytics") return true;
    return false;
  };

  return (
    <aside
      className={`flex-shrink-0 my-4 ml-4 rounded-2xl border border-foreground/10 bg-card text-card-foreground shadow-sm flex flex-col transition-all duration-300 ease-in-out relative z-40 ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
      style={{ minHeight: "calc(100vh - 6rem)" }}
    >
      {/* Toggle Button */}
      <button
        className="absolute -right-3 top-12 h-6 w-6 rounded-md border border-foreground/10 bg-background shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors z-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="p-4 flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {/* Logo / User Info */}
        <div
          className={`flex items-center px-2 mb-8 ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
        >
          {isCollapsed ? (
            <div className="font-display font-medium text-lg">C</div>
          ) : (
            <div className="overflow-hidden transition-opacity duration-300 flex-1">
              <p className="font-display font-medium text-base truncate">
                {user?.username || "CareerPrep AI"}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* MAIN Section */}
        <div className="space-y-1 mb-8">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Main
            </p>
          )}
          {sidebarItems.map((item) => {
            const active = isItemActive(item.id);
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={item.action}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isCollapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-foreground/[0.05] text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                  }`}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] flex-shrink-0 ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1.5 bg-foreground text-background text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-auto">
          {/* SETTINGS Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                Settings
              </p>
            )}

            <div className="relative group">
              <button
                onClick={onSignOut}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <User className="h-[18px] w-[18px] flex-shrink-0" />
                {!isCollapsed && <span>Profile & Sign Out</span>}
              </button>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1.5 bg-foreground text-background text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  Profile & Sign Out
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
