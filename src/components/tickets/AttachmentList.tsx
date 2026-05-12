'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api/tickets';
import { FileIcon, FileText, ImageIcon, Download, Trash2, Plus, LinkIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TicketAttachment } from '@/types/ticket';

interface Props {
  ticketId: number;
}

export function AttachmentList({ ticketId }: Props) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () => ticketsApi.getAttachments(ticketId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => ticketsApi.uploadAttachment(ticketId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      setIsUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) => ticketsApi.deleteAttachment(ticketId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return ImageIcon;
    if (contentType.includes('pdf')) return FileText;
    return FileIcon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) return <div>Loading attachments...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Attachments ({attachments?.length || 0})</h3>
        <label className="flex cursor-pointer items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500">
          <Plus className="h-3 w-3" />
          Upload
          <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {attachments?.map((attachment: TicketAttachment) => {
          const Icon = getFileIcon(attachment.contentType);
          return (
            <div key={attachment.id} className="group flex items-center justify-between rounded-md border border-gray-100 bg-white p-3 hover:border-gray-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-50">
                  {attachment.externalUrl ? <LinkIcon className="h-4 w-4 text-gray-400" /> : <Icon className="h-4 w-4 text-gray-400" />}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900" title={attachment.fileName}>
                    {attachment.externalLabel || attachment.fileName}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {attachment.externalUrl ? 'External Link' : formatFileSize(attachment.fileSizeBytes)} • {formatDate(attachment.uploadedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!attachment.externalUrl && (
                  <a
                    href={attachment.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-indigo-600"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => deleteMutation.mutate(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {attachments?.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-4 italic">No attachments yet</p>
        )}
      </div>
    </div>
  );
}
