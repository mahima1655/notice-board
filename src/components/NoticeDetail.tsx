import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notice, getCategoryColor, NOTICE_CATEGORIES } from '@/types';
import { format } from 'date-fns';
import {
    Calendar,
    User,
    Download,
    FileText,
    ExternalLink,
    Tag,
    Building,
} from 'lucide-react';

interface NoticeDetailProps {
    notice: Notice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NoticeDetail: React.FC<NoticeDetailProps> = ({
    notice,
    open,
    onOpenChange,
}) => {
    if (!notice) return null;

    const categoryInfo = NOTICE_CATEGORIES.find((c) => c.value === notice.category);
    const categoryColorClass = getCategoryColor(notice.category);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`category-badge border ${categoryColorClass}`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {categoryInfo?.label || notice.category}
                        </Badge>
                        {notice.department && (
                            <Badge variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                {notice.department}
                            </Badge>
                        )}
                        {notice.isPinned && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                                Pinned
                            </Badge>
                        )}
                    </div>
                    <DialogTitle className="text-2xl font-display font-bold leading-tight">
                        {notice.title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4 text-sm mt-2">
                        <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {notice.createdByName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(notice.createdAt, 'PPP')}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    <div className="space-y-6">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                                {notice.description}
                            </p>
                        </div>

                        {notice.attachmentUrl && (
                            <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Attachment
                                </h4>

                                {notice.attachmentType === 'image' ? (
                                    <div className="space-y-3">
                                        <img
                                            src={notice.attachmentUrl}
                                            alt={notice.attachmentName || 'Attachment'}
                                            className="rounded-lg border w-full max-h-[500px] object-contain bg-background"
                                        />
                                        <div className="flex justify-end">
                                            <Button asChild variant="outline" size="sm">
                                                <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View Full Size
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-background border rounded-md">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {notice.attachmentName || 'Document'}
                                                </p>
                                                <p className="text-xs text-muted-foreground uppercase">PDF</p>
                                            </div>
                                        </div>
                                        <Button asChild size="sm" variant="secondary">
                                            <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default NoticeDetail;
