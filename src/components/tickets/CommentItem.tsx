'use client';

import React, { useState } from 'react';
import { TicketComment } from '@/types/ticket';
import { formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { ticketsApi } from '@/lib/api/tickets';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, Edit2, Trash2, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  comment: TicketComment;
  ticketId: number;
  depth?: number;
}

export function CommentItem({ comment, ticketId, depth = 0 }: Props) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [, setIsEditing] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const isAuthor = currentUser?.id === comment.author.id.toString();

  const deleteMutation = useMutation({
    mutationFn: () => ticketsApi.deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
    }
  });

  const reactionMutation = useMutation({
    mutationFn: ({ emoji, add }: { emoji: string; add: boolean }) =>
      add ? ticketsApi.addReaction(comment.id, emoji) : ticketsApi.removeReaction(comment.id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
    }
  });

  return (
    <div className={cn("flex flex-col gap-3 py-4", depth > 0 && "ml-8 border-l-2 border-gray-100 pl-6")}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            {comment.author.avatarUrl ? (
              <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-500">
                {comment.author.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{comment.author.displayName}</span>
              {comment.isInternalNote && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                  Internal Note
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAuthor && (
            <>
              <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-indigo-600">
                <Edit2 className="h-4 w-4" />
              </button>
              <button onClick={() => deleteMutation.mutate()} className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button onClick={() => setIsReplyOpen(!isReplyOpen)} className="p-1 text-gray-400 hover:text-indigo-600">
            <Reply className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={cn("text-sm text-gray-700 prose prose-sm max-w-none", comment.isInternalNote && "bg-amber-50 p-3 rounded-md")}>
        <div dangerouslySetInnerHTML={{ __html: comment.body }} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {comment.reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => reactionMutation.mutate({ emoji: r.emoji, add: !r.reactedByMe })}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                r.reactedByMe ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span>{r.emoji}</span>
              <span>{r.count}</span>
            </button>
          ))}
          <button className="rounded-full bg-gray-50 p-1 text-gray-400 hover:bg-gray-100">
            <ThumbsUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} ticketId={ticketId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
