import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole, NOTICE_CATEGORIES, NoticeCategory } from '@/types';
import { getAllUsers, updateUserRole, deleteUser } from '@/services/userService';
import { getNoticeStats, subscribeToNotices, updateNotice, deleteNotice } from '@/services/noticeService';
import { Notice } from '@/types';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    Pin,
    Users,
    FileText,
    BarChart3,
    Trash2,
    Loader2,
    Shield,
    GraduationCap,
    UserCog
} from 'lucide-react';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [stats, setStats] = useState({ total: 0, byCategory: {} as Record<NoticeCategory, number> });
    const [loading, setLoading] = useState(true);

    // User Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Notice Delete State
    const [noticeDeleteDialogOpen, setNoticeDeleteDialogOpen] = useState(false);
    const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
    const [isDeletingNotice, setIsDeletingNotice] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const fetchedUsers = await getAllUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load users');
            }
        };

        const fetchStats = async () => {
            try {
                const fetchedStats = await getNoticeStats();
                setStats(fetchedStats);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        const unsubscribeNotices = subscribeToNotices('admin', (fetchedNotices) => {
            setNotices(fetchedNotices);
            setLoading(false);
        });

        fetchUserData();
        fetchStats();

        return () => unsubscribeNotices();
    }, []);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) =>
                prev.map((u) => (u.uid === userId ? { ...u, role: newRole } : u))
            );
            toast.success('User role updated');
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await deleteUser(userToDelete.uid);
            setUsers((prev) => prev.filter((u) => u.uid !== userToDelete.uid));
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleTogglePin = async (notice: Notice) => {
        try {
            await updateNotice(notice.id, { isPinned: !notice.isPinned });
            toast.success(notice.isPinned ? 'Notice unpinned' : 'Notice pinned');
        } catch (error) {
            console.error('Error toggling pin:', error);
            toast.error('Failed to update pin status');
        }
    };

    const handleNoticeDeleteClick = (notice: Notice) => {
        setNoticeToDelete(notice);
        setNoticeDeleteDialogOpen(true);
    };

    const handleNoticeDeleteConfirm = async () => {
        if (!noticeToDelete) return;

        setIsDeletingNotice(true);
        try {
            await deleteNotice(noticeToDelete.id, noticeToDelete.attachmentUrl);
            toast.success('Notice deleted successfully');
        } catch (error) {
            console.error('Error deleting notice:', error);
            toast.error('Failed to delete notice');
        } finally {
            setIsDeletingNotice(false);
            setNoticeDeleteDialogOpen(false);
            setNoticeToDelete(null);
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return 'bg-red-500/10 text-red-600 border-red-200';
            case 'teacher':
                return 'bg-blue-500/10 text-blue-600 border-blue-200';
            default:
                return 'bg-green-500/10 text-green-600 border-green-200';
        }
    };

    const usersByRole = {
        students: users.filter((u) => u.role === 'student').length,
        teachers: users.filter((u) => u.role === 'teacher').length,
        admins: users.filter((u) => u.role === 'admin').length,
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Admin Panel</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage users and monitor system statistics
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="stat-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-primary/10">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{users.length}</p>
                                    <p className="text-xs text-muted-foreground">Total Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="stat-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-green-500/10">
                                    <GraduationCap className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{usersByRole.students}</p>
                                    <p className="text-xs text-muted-foreground">Students</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="stat-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-500/10">
                                    <UserCog className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{usersByRole.teachers}</p>
                                    <p className="text-xs text-muted-foreground">Teachers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="stat-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-red-500/10">
                                    <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{usersByRole.admins}</p>
                                    <p className="text-xs text-muted-foreground">Admins</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="users" className="space-y-4">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-background">
                            <Users className="h-4 w-4" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="notices" className="gap-2 data-[state=active]:bg-background">
                            <FileText className="h-4 w-4" />
                            Notices
                        </TabsTrigger>
                        <TabsTrigger value="statistics" className="gap-2 data-[state=active]:bg-background">
                            <BarChart3 className="h-4 w-4" />
                            Statistics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notices">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-xl">Content Moderation</CardTitle>
                                    <CardDescription>Manage all college notices and pinned content</CardDescription>
                                </div>
                                <Badge variant="secondary" className="font-semibold">
                                    {notices.length} Total
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[300px]">Notice Title</TableHead>
                                                <TableHead>Author</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-center">Pin</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {notices.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <FileText className="h-8 w-8 opacity-20" />
                                                            <p>No notices found in the system</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                notices.map((notice) => (
                                                    <TableRow key={notice.id} className="group">
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="truncate block max-w-[280px]" title={notice.title}>
                                                                    {notice.title}
                                                                </span>
                                                                {notice.isPinned && (
                                                                    <span className="text-[10px] text-accent font-semibold flex items-center gap-1">
                                                                        <Pin className="h-2.5 w-2.5 fill-current" />
                                                                        FEATURED
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {notice.createdByName}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight px-1.5 py-0">
                                                                {notice.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {notice.createdAt.toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleTogglePin(notice)}
                                                                className={cn(
                                                                    "h-8 w-8 p-0 rounded-full",
                                                                    notice.isPinned
                                                                        ? "text-accent bg-accent/5 hover:bg-accent/10"
                                                                        : "text-muted-foreground hover:bg-muted"
                                                                )}
                                                            >
                                                                <Pin className={cn("h-4 w-4", notice.isPinned && "fill-current")} />
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                                                    onClick={() => navigate(`/notices/${notice.id}`)}
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                                                                    onClick={() => handleNoticeDeleteClick(notice)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>View and manage all registered users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.uid}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs">
                                                                    {user.displayName
                                                                        .split(' ')
                                                                        .map((n) => n[0])
                                                                        .join('')
                                                                        .toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium">{user.displayName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                    <TableCell>{user.department || '-'}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={user.role}
                                                            onValueChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                                                            disabled={user.uid === userData?.uid}
                                                        >
                                                            <SelectTrigger className="w-28">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="student">Student</SelectItem>
                                                                <SelectItem value="teacher">Teacher</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {user.createdAt.toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteClick(user)}
                                                            disabled={user.uid === userData?.uid}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="statistics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notice Statistics</CardTitle>
                                <CardDescription>Overview of notices by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <span className="font-medium">Total Notices</span>
                                        </div>
                                        <span className="text-2xl font-bold">{stats.total}</span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {NOTICE_CATEGORIES.map((cat) => (
                                            <div
                                                key={cat.value}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <span className="text-sm font-medium">{cat.label}</span>
                                                <Badge variant="secondary">
                                                    {stats.byCategory[cat.value] || 0}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* User Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {userToDelete?.displayName}? This action cannot be undone and will remove all their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Notice Delete Confirmation Dialog */}
            <AlertDialog open={noticeDeleteDialogOpen} onOpenChange={setNoticeDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{noticeToDelete?.title}"? This will permanently remove the notice and its attachments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleNoticeDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeletingNotice}
                        >
                            {isDeletingNotice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete Notice
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
};

export default AdminPanel;
