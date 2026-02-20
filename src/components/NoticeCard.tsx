import React from 'react';
import { Notice, getCategoryColor, NOTICE_CATEGORIES } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pin,
  Calendar,
  User,
  Download,
  FileText,
  Image as ImageIcon,
  Trash2,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';

interface NoticeCardProps {
  notice: Notice;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
  onClick?: (notice: Notice) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isNew?: boolean; // ✅ Add isNew prop
}

const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onEdit,
  onDelete,
  onClick,
  canEdit = false,
  canDelete = false,
  isNew = false, // ✅ default value
}) => {
  const categoryInfo = NOTICE_CATEGORIES.find(c => c.value === notice.category);
  const categoryColorClass = getCategoryColor(notice.category);

  return (
    <Card
      className={`notice-card relative ${notice.isPinned ? 'notice-card-pinned' : ''} animate-fade-in group cursor-pointer transition-all duration-200 hover:shadow-md border-transparent hover:border-primary/20`}
      onClick={() => onClick?.(notice)}
    >
      {/* New badge */}
      {isNew && (
        <Badge
          variant="outline"
          className="absolute top-2 left-2 text-xs bg-green-100 text-green-800 border-green-300"
        >
          New
        </Badge>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {notice.isPinned && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              <Badge className={`category-badge border ${categoryColorClass}`}>
                {categoryInfo?.label || notice.category}
              </Badge>
              {notice.department && (
                <Badge variant="outline" className="text-xs">
                  {notice.department}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg text-foreground leading-tight line-clamp-2 break-words">
              {notice.title}
            </h3>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 shrink-0">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(notice);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(notice);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 break-words">
          {notice.description}
        </p>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 min-w-0">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{notice.createdByName}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(notice.createdAt, 'MMM d, yyyy')}</span>
            </div>
            {notice.expiryDate && (
              <div className="flex items-center gap-1 text-warning shrink-0">
                <span>Expires: {format(notice.expiryDate, 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {notice.attachmentUrl && (
            <div className="mt-4 pt-4 border-t border-border">
              {notice.attachmentType === 'image' ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={notice.attachmentUrl}
                    alt={notice.attachmentName || 'Attachment'}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{notice.attachmentName}</span>
                  </div>
                </div>
              ) : (
                <a
                  href={notice.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded-md hover:bg-primary/5 border border-transparent hover:border-primary/20 max-w-full"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{notice.attachmentName}</span>
                  <Download className="h-3.5 w-3.5 ml-auto opacity-50 shrink-0" />
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoticeCard;