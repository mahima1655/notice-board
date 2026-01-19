import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notice, NoticeCategory, VisibleTo, UserRole } from '@/types';
import { uploadFile } from './storageService';

const NOTICES_COLLECTION = 'notices';

export const createNotice = async (
  notice: Omit<Notice, 'id' | 'createdAt'>,
  file?: File
): Promise<string> => {
  console.log('noticeService: createNotice called', { hasFile: !!file });
  let attachmentUrl = '';
  let attachmentName = '';
  let attachmentType: 'pdf' | 'image' | undefined;

  if (file) {
    try {
      console.log('noticeService: Starting file upload...', file.name);
      const uploadResult = await uploadFile(file);
      console.log('noticeService: File uploaded, result:', uploadResult);
      attachmentUrl = uploadResult.url;
      attachmentName = uploadResult.name;
      attachmentType = uploadResult.type;
    } catch (uploadError) {
      console.error('noticeService: File upload failed', uploadError);
      throw uploadError; // Re-throw to be caught by caller
    }
  }

  // Sanitize notice object to remove undefined values
  const noticeData = {
    title: notice.title,
    description: notice.description,
    category: notice.category,
    department: notice.department || null, // Convert undefined to null
    visibleTo: notice.visibleTo,
    createdBy: notice.createdBy,
    createdByName: notice.createdByName,
    isPinned: notice.isPinned,
    isApproved: notice.isApproved,
    attachmentUrl: attachmentUrl || null,
    attachmentName: attachmentName || null,
    attachmentType: attachmentType || null,
    createdAt: Timestamp.now(),
    expiryDate: notice.expiryDate ? Timestamp.fromDate(notice.expiryDate) : null,
  };

  console.log('noticeService: Adding doc to Firestore...', noticeData);
  try {
    const docRef = await addDoc(collection(db, NOTICES_COLLECTION), noticeData);
    console.log('noticeService: Doc added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (dbError) {
    console.error('noticeService: Firestore addDoc failed', dbError);
    throw dbError;
  }
};

export const updateNotice = async (
  noticeId: string,
  updates: Partial<Notice>,
  file?: File
): Promise<void> => {
  const updateData: Record<string, unknown> = { ...updates };

  if (file) {
    try {
      const uploadResult = await uploadFile(file);
      updateData.attachmentUrl = uploadResult.url;
      updateData.attachmentName = uploadResult.name;
      updateData.attachmentType = uploadResult.type;
    } catch (error) {
      console.error("Failed to upload new file during update", error);
      throw error;
    }
  }

  if (updates.expiryDate) {
    updateData.expiryDate = Timestamp.fromDate(updates.expiryDate);
  } else if (updates.expiryDate === null) {
    // Explicitly allowing null to clear the date if needed
    updateData.expiryDate = null;
  }

  // Ensure department is handled if it's being updated
  if (updates.department === undefined && 'department' in updates) {
    updateData.department = null;
  }

  // Remove any remaining undefined keys
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  await updateDoc(doc(db, NOTICES_COLLECTION, noticeId), updateData);
};

export const deleteNotice = async (noticeId: string, attachmentUrl?: string): Promise<void> => {
  // Cloudinary deletion from frontend is restricted/unsafe without signed implementation.
  // We will skip deleting the file from Cloudinary for now to prioritize security/simplicity.
  // Ideally, a periodic cleanup script or a backend function should handle this.
  if (attachmentUrl) {
    console.log('Skipping file deletion from frontend for safety (requires backend or direct Supabase call).');
  }
  await deleteDoc(doc(db, NOTICES_COLLECTION, noticeId));
};

export const subscribeToNotices = (
  userRole: UserRole,
  callback: (notices: Notice[]) => void
): (() => void) => {
  let q = query(
    collection(db, NOTICES_COLLECTION),
    orderBy('isPinned', 'desc'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notices: Notice[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const notice: Notice = {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        department: data.department,
        visibleTo: data.visibleTo,
        attachmentUrl: data.attachmentUrl,
        attachmentName: data.attachmentName,
        attachmentType: data.attachmentType,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiryDate: data.expiryDate?.toDate(),
        isPinned: data.isPinned,
        isApproved: data.isApproved,
      };

      // Filter based on role
      if (userRole === 'admin') {
        notices.push(notice);
      } else if (userRole === 'teacher') {
        notices.push(notice);
      } else {
        // Students can't see staff-only notices
        if (notice.category !== 'staff') {
          notices.push(notice);
        }
      }
    });
    callback(notices);
  });
};

export const getNoticeStats = async (): Promise<{
  total: number;
  byCategory: Record<NoticeCategory, number>;
}> => {
  const snapshot = await getDocs(collection(db, NOTICES_COLLECTION));
  const stats: Record<NoticeCategory, number> = {
    exam: 0,
    sports: 0,
    events: 0,
    hackathons: 0,
    symposium: 0,
    department: 0,
    placement: 0,
    coe: 0,
    office: 0,
    staff: 0,
  };

  snapshot.forEach((doc) => {
    const category = doc.data().category as NoticeCategory;
    stats[category]++;
  });

  return {
    total: snapshot.size,
    byCategory: stats,
  };
};
