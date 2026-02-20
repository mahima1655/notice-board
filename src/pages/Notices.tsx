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
  const navigate = useNavigate();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    NoticeCategory | 'all'
  >((searchParams.get('category') as NoticeCategory) || 'all');

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

 
  useEffect(() => {
    if (!userData) return;

    setLoading(true);

    const unsubscribe = subscribeToNotices(
      userData.role,
      userData.uid,
      (fetchedNotices) => {
        setNotices(fetchedNotices);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userData]);

 
  const filteredNotices = useMemo(() => {
    const now = new Date();

    const filtered = notices.filter((notice) => {
      const matchesSearch =
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || notice.category === selectedCategory;

      const matchesDepartment =
        selectedDepartment === 'all' ||
        notice.department === selectedDepartment;

      const noticeDate = new Date(notice.createdAt);

      const matchesStartDate = !startDate || noticeDate >= startDate;
      const matchesEndDate = !endDate || noticeDate <= endDate;

    
      const isExpired =
        notice.expiryDate &&
        new Date(notice.expiryDate) < now;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDepartment &&
        matchesStartDate &&
        matchesEndDate &&
        !isExpired
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [
    notices,
    searchQuery,
    selectedCategory,
    selectedDepartment,
    sortBy,
    startDate,
    endDate,
  ]);

 
  const canModifyNotice = (notice: Notice) => {
    if (isAdmin) return true;
    if (isTeacher && notice.createdBy === userData?.uid) return true;
    return false;
  };

  
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
      await deleteNotice(
        noticeToDelete.id,
        noticeToDelete.attachmentUrl
      );

      toast.success('Notice deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete notice');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              All Notices
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and filter all college announcements
            </p>
          </div>

          {(isTeacher || isAdmin) && (
            <Button
              onClick={() => {
                setEditingNotice(null);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Notice
            </Button>
          )}
        </div>

       
        <NoticeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={DEPARTMENTS}
          sortBy={sortBy}
          onSortChange={setSortBy}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

       
        <p className="text-sm text-muted-foreground">
          Showing {filteredNotices.length} of {notices.length} notices
        </p>

       
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotices.map((notice) => {
              const now = new Date();
              const createdAt = new Date(notice.createdAt);
              const ONE_DAY = 24 * 60 * 60 * 1000;

              const isNew =
                now.getTime() - createdAt.getTime() < ONE_DAY;

              return (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onClick={handleNoticeClick}
                  canEdit={canModifyNotice(notice)}
                  canDelete={canModifyNotice(notice)}
                  isNew={isNew}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No notices found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ||
              selectedCategory !== 'all' ||
              selectedDepartment !== 'all'
                ? 'Try adjusting your filters'
                : 'No notices have been posted yet'}
            </p>
          </div>
        )}
      </div>

    
      <NoticeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingNotice={editingNotice}
        onSuccess={() => {
          setEditingNotice(null);
          setFormOpen(false);
        }}
      />

    
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {noticeToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Notices;