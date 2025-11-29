import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    Briefcase,
    Mic,
    User,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

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
    resumeExists
}: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active item based on current path if activeTab is not provided
    const currentPath = location.pathname;

    const sidebarItems = [
        {
            id: 'resume',
            label: 'Resume',
            icon: FileText,
            disabled: false,
            action: () => {
                if (currentPath === '/dashboard') {
                    onTabChange?.('resume');
                } else {
                    navigate('/dashboard', { state: { tab: 'resume' } });
                }
            }
        },
        {
            id: 'jobs',
            label: 'Job Matching',
            icon: Briefcase,
            disabled: !resumeExists,
            action: () => {
                if (currentPath === '/dashboard') {
                    onTabChange?.('jobs');
                } else {
                    navigate('/dashboard', { state: { tab: 'jobs' } });
                }
            }
        },
        {
            id: 'interview',
            label: 'AI Interview Prep',
            icon: Mic,
            disabled: false,
            action: () => {
                navigate('/deep-research');
            }
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            disabled: false,
            action: () => {
                navigate('/analytics');
            }
        }
    ];

    // Helper to determine if an item is active
    const isItemActive = (itemId: string) => {
        if (activeTab === itemId) return true;
        if (itemId === 'interview' && currentPath === '/deep-research') return true;
        if (itemId === 'analytics' && currentPath === '/analytics') return true;
        return false;
    };

    return (
        <aside
            className={cn(
                "flex-shrink-0 bg-white border-r min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-4 space-y-6">
                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white shadow-md z-10 hover:bg-gray-100"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>

                {/* User Info */}
                <div className={cn("flex items-center gap-3 px-2 overflow-hidden", isCollapsed && "justify-center px-0")}>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                    </div>

                    {!isCollapsed && (
                        <div className="overflow-hidden transition-opacity duration-300">
                            <p className="font-medium truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    )}
                </div>

                {/* Deep Research Card - Only show if not collapsed and not already on the page */}
                {!isCollapsed && currentPath !== '/deep-research' && (
                    <Card className="mt-6 border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-purple-500/5">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <span className="text-lg">⚡</span>
                                Deep Research
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-4 pt-2">
                            <p className="text-xs text-gray-600 mb-3">
                                Get company intelligence & tailored questions.
                            </p>
                            <Button
                                onClick={() => navigate('/deep-research')}
                                size="sm"
                                className="w-full"
                            >
                                Start
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Sidebar Navigation */}
                <div className="space-y-2 mt-6">
                    {sidebarItems.map(item => (
                        <Button
                            key={item.id}
                            variant={isItemActive(item.id) ? "default" : "ghost"}
                            disabled={item.disabled}
                            onClick={item.action}
                            className={cn(
                                "w-full justify-start gap-3",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && item.label}
                        </Button>
                    ))}

                    {!isCollapsed && (
                        <Button variant="destructive" className="w-full mt-4" onClick={onSignOut}>
                            Sign Out
                        </Button>
                    )}
                </div>
            </div>
        </aside>
    );
}
