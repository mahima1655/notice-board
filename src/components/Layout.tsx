import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userData, signOut, isAdmin, isTeacher } = useAuth();
  const { unreadCount, recentNotices, markAsRead, clearNotification, open, setOpen } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/notices', label: 'All Notices', icon: FileText },
    ...(isTeacher || isAdmin
      ? [{ path: '/create-notice', label: 'Create Notice', icon: Plus }]
      : []),
    ...(isAdmin
      ? [{ path: '/admin', label: 'Admin Panel', icon: Users }]
      : []),
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const initials = userData?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 gradient-primary text-primary-foreground">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">CampusConnect</h1>
              <p className="text-xs text-white/60">Official Notice Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                location.pathname === item.path
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarFallback className="bg-white/10 text-white text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userData?.displayName}
              </p>
              <p className="text-xs text-white/60 capitalize">{userData?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 gradient-primary text-primary-foreground transform transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">CampusConnect</h1>
              <p className="text-xs text-white/60">Official Notice Portal</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                location.pathname === item.path
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-lg hidden sm:block">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu open={open} onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (isOpen) markAsRead();
            }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full ring-2 ring-card animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b bg-muted/30">
                  <p className="font-semibold text-sm">Notifications</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {recentNotices.length > 0 ? (
                    recentNotices.map((notice) => (
                      <DropdownMenuItem
                        key={notice.id}
                        className="px-4 py-3 cursor-pointer border-b last:border-0 items-start gap-3 focus:bg-accent/5"
                        onClick={() => {
                          clearNotification(notice.id);
                          setOpen(false);
                          navigate(`/notices/${notice.id}`);
                        }}
                      >
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0 opacity-80" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-none mb-1 truncate text-foreground">
                            {notice.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notice.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80">
                            {format(notice.createdAt, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t bg-muted/30">
                  <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => navigate('/notices')}>
                    View All Notices
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {userData?.displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userData?.displayName}</p>
                  <p className="text-xs text-muted-foreground">{userData?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
