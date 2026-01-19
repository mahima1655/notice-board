import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Notice, NoticeCategory, DEPARTMENTS } from '@/types';
import { subscribeToNotices, deleteNotice } from '@/services/noticeService';
import Layout from '@/components/Layout';
import NoticeCard from '@/components/NoticeCard';
import NoticeFilters from '@/components/NoticeFilters';
import NoticeForm from '@/components/NoticeForm';
import { Button } from '@/components/ui/button';
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
import { Plus, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Notices: React.FC = () => {
  const { userData, isAdmin, isTeacher } = useAuth();
  const [searchParams] = useSearchParams();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>(
    (searchParams.get('category') as NoticeCategory) || 'all'
  );
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;

    const unsubscribe = subscribeToNotices(userData.role, (fetchedNotices) => {
      setNotices(fetchedNotices);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
      const matchesDepartment = selectedDepartment === 'all' || notice.department === selectedDepartment;
      return matchesSearch && matchesCategory && matchesDepartment;
    });
  }, [notices, searchQuery, selectedCategory, selectedDepartment]);

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormOpen(true);
  };

  const handleDeleteClick = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const handleNoticeClick = (notice: Notice) => {
    navigate(`/notices/${notice.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;

    setIsDeleting(true);
    try {
      await deleteNotice(noticeToDelete.id, noticeToDelete.attachmentUrl);
      toast.success('Notice deleted successfully');
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    }
  };

  const canEditNotice = (notice: Notice) => {
    if (isAdmin) return true;
    if (isTeacher && notice.createdBy === userData?.uid) return true;
    return false;
  };

  const canDeleteNotice = (notice: Notice) => {
    if (isAdmin) return true;
    if (isTeacher && notice.createdBy === userData?.uid) return true;
    return false;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">All Notices</h1>
            <p className="text-muted-foreground mt-1">
              Browse and filter all college announcements
            </p>
          </div>
          {(isTeacher || isAdmin) && (
            <Button onClick={() => { setEditingNotice(null); setFormOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              New Notice
            </Button>
          )}
        </div>

        {/* Filters */}
        <NoticeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={DEPARTMENTS}
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredNotices.length} of {notices.length} notices
        </p>

        {/* Notices Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onClick={handleNoticeClick}
                canEdit={canEditNotice(notice)}
                canDelete={canDeleteNotice(notice)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No notices found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' || selectedDepartment !== 'all'
                ? 'Try adjusting your filters'
                : 'No notices have been posted yet'}
            </p>
          </div>
        )}
      </div>

      {/* Notice Form Dialog */}
      <NoticeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingNotice={editingNotice}
        onSuccess={() => setEditingNotice(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{noticeToDelete?.title}"? This action cannot be undone.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Notices;
