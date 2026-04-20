'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { ticketsApi } from '@/lib/api/tickets';
import { X } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Task', 'Bug', 'Feature', 'Improvement', 'ChangeRequest', 'UserStory', 'TestCase']),
  projectId: z.number().min(1, 'Project is required'),
  productId: z.number().min(1, 'Product is required'),
  subProjectId: z.number().min(1, 'Sub-project is required'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  assigneeIds: z.array(z.number()),
  startDate: z.string().optional(),
  expectedDueDate: z.string().optional(),
  storyPoints: z.number().optional(),
  labels: z.array(z.string()).optional(),
  severity: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehaviour: z.string().optional(),
  actualBehaviour: z.string().optional(),
  environment: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketForm({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'Task',
      priority: 'Medium',
      assigneeIds: [],
    }
  });

  const selectedProjectId = watch('projectId');
  const selectedProductId = watch('productId');
  const category = watch('category');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Placeholder.configure({ placeholder: 'Describe the ticket...' }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setValue('description', editor.getHTML());
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      editor?.commands.setContent('');
    }
  }, [isOpen, reset, editor]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
    enabled: isOpen
  });
  const { data: products } = useQuery({
    queryKey: ['products', selectedProjectId],
    queryFn: () => projectsApi.getProducts(selectedProjectId!),
    enabled: !!selectedProjectId
  });
  const { data: subProjects } = useQuery({
    queryKey: ['subprojects', selectedProductId],
    queryFn: () => projectsApi.getSubProjects(selectedProjectId!, selectedProductId!),
    enabled: !!selectedProductId
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['team', selectedProjectId],
    queryFn: () => projectsApi.getTeamMembers(selectedProjectId!),
    enabled: !!selectedProjectId
  });

  const mutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      onClose();
    }
  });

  const onSubmit = (data: TicketFormValues) => {
    mutation.mutate(data as unknown as Parameters<typeof ticketsApi.create>[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-2xl bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Create New Ticket</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="border border-gray-300 rounded-md p-2 min-h-[200px] focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <EditorContent editor={editor} />
              </div>
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {['Task', 'Bug', 'Feature', 'Improvement', 'ChangeRequest', 'UserStory', 'TestCase'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  {...register('priority')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {['Critical', 'High', 'Medium', 'Low'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  {...register('projectId', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Project</option>
                  {projects?.map((p: { id: number; name: string }) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  {...register('productId', { valueAsNumber: true })}
                  disabled={!selectedProjectId}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Product</option>
                  {products?.map((p: { id: number; name: string }) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sub-project</label>
                <select
                  {...register('subProjectId', { valueAsNumber: true })}
                  disabled={!selectedProductId}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Sub-project</option>
                  {subProjects?.map((p: { id: number; name: string }) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bug Specific Fields */}
            {category === 'Bug' && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <h4 className="text-sm font-bold text-red-800">Bug Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-red-700">Severity</label>
                    <select
                      {...register('severity')}
                      className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    >
                      <option value="S1">S1 - Critical</option>
                      <option value="S2">S2 - Major</option>
                      <option value="S3">S3 - Minor</option>
                      <option value="S4">S4 - Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-red-700">Environment</label>
                    <input
                      {...register('environment')}
                      placeholder="e.g. Production, Staging"
                      className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700">Steps to Reproduce</label>
                  <textarea
                    {...register('stepsToReproduce')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Assignees */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Assignees</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {teamMembers?.map((member: { id: number; displayName: string }) => (
                  <label key={member.id} className="flex items-center gap-2 rounded-md border border-gray-200 p-2 text-sm hover:bg-gray-50">
                    <input
                      type="checkbox"
                      value={member.id}
                      checked={watch('assigneeIds').includes(member.id)}
                      onChange={(e) => {
                        const current = watch('assigneeIds');
                        if (e.target.checked) setValue('assigneeIds', [...current, member.id]);
                        else setValue('assigneeIds', current.filter(id => id !== member.id));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    {member.displayName}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Due Date</label>
                <input
                  type="date"
                  {...register('expectedDueDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
