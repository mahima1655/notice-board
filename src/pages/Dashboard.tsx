import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Notice, NoticeCategory, NOTICE_CATEGORIES, DEPARTMENTS } from '@/types';
import { subscribeToNotices, getNoticeStats } from '@/services/noticeService';
import Layout from '@/components/Layout';
import NoticeCard from '@/components/NoticeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Pin,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  Bell
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userData, isAdmin, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState({ total: 0, byCategory: {} as Record<NoticeCategory, number> });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;

    const unsubscribe = subscribeToNotices(userData.role, (fetchedNotices) => {
      setNotices(fetchedNotices);
      setLoading(false);
    });

    getNoticeStats().then(setStats);

    return () => unsubscribe();
  }, [userData]);

  const pinnedNotices = notices.filter((n) => n.isPinned).slice(0, 3);
  const recentNotices = notices.slice(0, 5);
  const todayCount = notices.filter(
    (n) => n.createdAt.toDateString() === new Date().toDateString()
  ).length;

  const statCards = [
    {
      title: 'Total Notices',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Pinned Notices',
      value: pinnedNotices.length,
      icon: Pin,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Today\'s Updates',
      value: todayCount,
      icon: Calendar,
      color: 'text-success',
      bg: 'bg-green-500/10',
    },
    
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Welcome back, {userData?.displayName?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in your college today.
            </p>
          </div>
          {(isTeacher || isAdmin) && (
            <Button onClick={() => navigate('/create-notice')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Notice
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="stat-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {/* Pinned Notices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin className="h-5 w-5 text-accent" />
                Featured Notifications
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/notices')} className="gap-1">
                View All Notices
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                      <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                      <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pinnedNotices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedNotices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    onClick={() => navigate(`/notices/${notice.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No featured notices at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Quick Categories section if needed, or just let it breathe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Browse by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {NOTICE_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white hover:bg-accent/5"
                      onClick={() => navigate(`/notices?category=${cat.value}`)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Department Updates</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.slice(0, 6).map((dept) => (
                    <Button
                      key={dept}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white hover:bg-accent/5"
                      onClick={() => navigate('/notices')}
                    >
                      {dept}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
