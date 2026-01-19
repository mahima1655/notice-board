import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Notice, UserRole } from '@/types';

interface NotificationContextType {
    unreadCount: number;
    recentNotices: Notice[];
    markAsRead: () => void;
    clearNotification: (id: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { userData } = useAuth();
    const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [clearedNotices, setClearedNotices] = useState<string[]>(() => {
        const stored = localStorage.getItem('clearedNotices');
        return stored ? JSON.parse(stored) : [];
    });

    // Load last read timestamp from local storage
    // We use a simple timestamp approach: anything newer than this is "unread"
    const getLastReadTime = () => {
        const stored = localStorage.getItem('lastReadNoticeTime');
        return stored ? new Date(stored) : new Date(0); // Default to epoch if nothing stored
    };

    useEffect(() => {
        if (!userData) return;

        // Subscribe to recent notices
        const userRole = userData.role;
        const q = query(
            collection(db, 'notices'),
            orderBy('createdAt', 'desc'),
            limit(10) // Only get latest 10 for the dropdown
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotices: Notice[] = [];
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

                // Filter based on role (reuse logic from noticeService implies duplicating or importing, 
                // duplicating strictly simple filter here for speed/independence)
                let isVisible = false;
                if (userRole === 'admin' || userRole === 'teacher') {
                    isVisible = true;
                } else {
                    // Student: see everything EXCEPT 'staff'
                    if (notice.category !== 'staff') {
                        isVisible = true;
                    }
                }

                if (isVisible) {
                    fetchedNotices.push(notice);
                }
            });

            setRecentNotices(fetchedNotices);

            // Calculate unread count
            const lastRead = getLastReadTime();
            const count = fetchedNotices.filter(n => n.createdAt > lastRead).length;
            setUnreadCount(count);
        });

        return () => unsubscribe();
    }, [userData]);

    const clearNotification = (id: string) => {
        const updated = [...clearedNotices, id];
        setClearedNotices(updated);
        localStorage.setItem('clearedNotices', JSON.stringify(updated));
    };

    const markAsRead = () => {
        if (recentNotices.length > 0) {
            const newestDate = recentNotices[0].createdAt;
            localStorage.setItem('lastReadNoticeTime', newestDate.toISOString());
            setUnreadCount(0);
        }
    };

    // Filter notices to hide cleared ones
    const displayedNotices = recentNotices.filter(n => !clearedNotices.includes(n.id));

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            recentNotices: displayedNotices,
            markAsRead,
            clearNotification,
            open,
            setOpen
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
