import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Notice, getCategoryColor, NOTICE_CATEGORIES } from '@/types';
import { subscribeToNotices } from '@/services/noticeService';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import {
    Calendar,
    User,
    Download,
    FileText,
    ExternalLink,
    Tag,
    Building,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';

const NoticeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) return;

        // We subscribe to all notices to ensure we have the correct sort order for navigation
        // This is acceptable for a college notice board scale.
        // Ideally, for larger scale, we might fetch single doc + next/prev query.
        const unsubscribe = subscribeToNotices(userData.role, (fetchedNotices) => {
            setNotices(fetchedNotices);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData]);

    const { currentNotice, prevNotice, nextNotice } = useMemo(() => {
        if (!notices.length || !id) return { currentNotice: null, prevNotice: null, nextNotice: null };

        const index = notices.findIndex(n => n.id === id);
        if (index === -1) return { currentNotice: null, prevNotice: null, nextNotice: null };

        return {
            currentNotice: notices[index],
            // Notices are sorted by date desc, so "previous" in index is "newer" (Next button usually goes to newer or older? 
            // "Next notice" usually implies reading flow. Let's assume list order:
            // Index 0: Newest
            // Index 1: Older
            // "Previous" -> Index - 1 (Newer)
            // "Next" -> Index + 1 (Older)
            // Or we can label them explicitly "Newer" / "Older"
            prevNotice: index > 0 ? notices[index - 1] : null,
            nextNotice: index < notices.length - 1 ? notices[index + 1] : null,
        };
    }, [notices, id]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!currentNotice) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <h2 className="text-2xl font-bold">Notice Not Found</h2>
                    <p className="text-muted-foreground">The notice you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => navigate('/notices')}>Back to Notices</Button>
                </div>
            </Layout>
        );
    }

    const categoryInfo = NOTICE_CATEGORIES.find((c) => c.value === currentNotice.category);
    const categoryColorClass = getCategoryColor(currentNotice.category);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="pl-0 hover:pl-2 transition-all"
                    onClick={() => navigate('/notices')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Notices
                </Button>

                {/* Navigation Buttons (Top) */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        disabled={!prevNotice}
                        onClick={() => prevNotice && navigate(`/notices/${prevNotice.id}`)}
                        className="w-[120px] justify-start"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!nextNotice}
                        onClick={() => nextNotice && navigate(`/notices/${nextNotice.id}`)}
                        className="w-[120px] justify-end"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

                {/* Main Content Card */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-8 pb-4 border-b">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={`category-badge border ${categoryColorClass} px-3 py-1 text-sm`}>
                                <Tag className="h-3.5 w-3.5 mr-1.5" />
                                {categoryInfo?.label || currentNotice.category}
                            </Badge>
                            {currentNotice.department && (
                                <Badge variant="outline" className="text-sm px-3 py-1">
                                    <Building className="h-3.5 w-3.5 mr-1.5" />
                                    {currentNotice.department}
                                </Badge>
                            )}
                            {currentNotice.isPinned && (
                                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 text-sm px-3 py-1">
                                    Pinned
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight text-foreground mb-4">
                            {currentNotice.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {currentNotice.createdByName}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(currentNotice.createdAt, 'PPP')}
                            </span>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {currentNotice.description}
                            </p>
                        </div>

                        {currentNotice.attachmentUrl && (
                            <div className="mt-10 rounded-xl border bg-muted/30 p-6">
                                <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Attachment
                                </h4>

                                {currentNotice.attachmentType === 'image' ? (
                                    <div className="space-y-4">
                                        <img
                                            src={currentNotice.attachmentUrl}
                                            alt={currentNotice.attachmentName || 'Attachment'}
                                            className="rounded-lg border w-full object-contain bg-background max-h-[80vh]"
                                        />
                                        <div className="flex justify-end">
                                            <Button asChild variant="outline">
                                                <a href={currentNotice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View Full Quality
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-background border rounded-lg hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-base truncate">
                                                    {currentNotice.attachmentName || 'Document'}
                                                </p>
                                                <p className="text-xs text-muted-foreground uppercase font-medium mt-1">PDF Document</p>
                                            </div>
                                        </div>
                                        <Button asChild size="lg" variant="default">
                                            <a href={currentNotice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons (Bottom) */}
                <div className="flex items-center justify-between pb-10">
                    <Button
                        variant="outline"
                        disabled={!prevNotice}
                        onClick={() => prevNotice && navigate(`/notices/${prevNotice.id}`)}
                        className="w-[140px]"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!nextNotice}
                        onClick={() => nextNotice && navigate(`/notices/${nextNotice.id}`)}
                        className="w-[140px]"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default NoticeDetailPage;
