'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useAddComment } from '@/hooks/useTickets';
import { cn } from '@/lib/utils';
import { Send, Lock, Unlock } from 'lucide-react';

interface Props {
  ticketId: number;
  placeholder?: string;
}

export function CommentInput({ ticketId, placeholder = "Write a comment..." }: Props) {
  const [isInternal, setIsInternal] = useState(false);
  const addCommentMutation = useAddComment(ticketId);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
  });

  const handleSubmit = async () => {
    if (!editor || editor.isEmpty) return;

    await addCommentMutation.mutateAsync({
      body: editor.getHTML(),
      isInternalNote: isInternal
    });

    editor.commands.setContent('');
    setIsInternal(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInternal(!isInternal)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold uppercase transition-colors",
              isInternal ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {isInternal ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {isInternal ? "Internal Note" : "Public Comment"}
          </button>
        </div>
      </div>

      <div className={cn(
        "min-h-[100px] rounded-md transition-colors",
        isInternal ? "bg-amber-50" : "bg-white"
      )}>
        <EditorContent editor={editor} className="prose prose-sm max-w-none p-3" />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => { editor?.commands.setContent(''); setIsInternal(false); }}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!editor || editor.isEmpty || addCommentMutation.isPending}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {addCommentMutation.isPending ? "Sending..." : <><Send className="h-4 w-4" /> Send</>}
        </button>
      </div>
    </div>
  );
}
