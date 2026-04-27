'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { bugReportApi } from '@/lib/api/bugReport';
import { SeverityConfig, type BugSeverity } from '@/types/bugReport';
import {
  User,
  Mail,
  Type,
  AlignLeft,
  ListOrdered,
  Monitor,
  AlertTriangle,
  Paperclip,
  X,
  Upload,
  ChevronRight,
  Info,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const bugSchema = z.object({
  projectCode: z.string().min(1, 'Project code is required').toUpperCase(),
  senderName: z.string().min(1, 'Full name is required'),
  senderEmail: z.string().email('Invalid email address'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  stepsToReproduce: z.string().min(1, 'Steps to reproduce are required'),
  expectedBehaviour: z.string().min(1, 'Expected behaviour is required'),
  actualBehaviour: z.string().min(1, 'Actual behaviour is required'),
  environment: z.string().min(1, 'Environment details are required'),
  severity: z.enum(['Critical', 'Major', 'Minor', 'Trivial']),
});

type BugFormValues = z.infer<typeof bugSchema>;

export default function BugReportPage() {
  const router = useRouter();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectTemplate, setProjectTemplate] = useState<any>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BugFormValues>({
    resolver: zodResolver(bugSchema),
    defaultValues: { severity: 'Major' }
  });

  const projectCode = watch('projectCode');
  const selectedSeverity = watch('severity');

  useEffect(() => {
    if (projectCode && projectCode.length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const data = await bugReportApi.getTemplate(projectCode);
          setProjectTemplate(data);
          setProjectError(null);
        } catch {
          setProjectTemplate(null);
          setProjectError('Project not found. Please check your project code.');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projectCode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
      if (validFiles.length < files.length) toast.error('Some files exceed the 10MB limit');
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: BugFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await bugReportApi.submitBugReport({
        ...values,
        attachments
      });
      router.push(`/bug-report/submitted?ticketNumber=${response.ticketNumber}`);
    } catch (err: any) {
      toast.error('Submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Report a Bug</h1>
        <p className="mt-4 text-gray-500 font-medium text-lg">Fill in the fields below to submit your report. Our team will review it shortly.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Project Code & Template Info */}
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Project Code</label>
              <input
                {...register('projectCode')}
                className="w-full text-2xl font-black rounded-2xl border-gray-200 py-4 px-6 focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-gray-100"
                placeholder="e.g. UMS"
              />
              {errors.projectCode && <p className="mt-2 text-xs text-red-600 font-bold">{errors.projectCode.message}</p>}
           </div>

           {projectTemplate && (
             <div className="flex items-start gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl animate-in zoom-in-95">
                <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                   <p className="text-sm font-bold text-indigo-900">Project Found: {projectTemplate.name}</p>
                   <p className="text-xs text-indigo-600 font-medium mt-0.5">Direct intake email: {projectTemplate.intakeEmailAddress}</p>
                </div>
             </div>
           )}

           {projectError && (
             <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-bold text-red-800">{projectError}</p>
             </div>
           )}
        </section>

        {/* Your Details */}
        <Section title="Your Details" icon={User} step={1}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                 <input {...register('senderName')} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-bold" />
                 {errors.senderName && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.senderName.message}</p>}
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                 <input {...register('senderEmail')} type="email" className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-bold" />
                 {errors.senderEmail && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.senderEmail.message}</p>}
              </div>
           </div>
        </Section>

        {/* Bug Details */}
        <Section title="Bug Details" icon={Type} step={2}>
           <div className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Short Summary</label>
                 <input {...register('title')} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-bold" placeholder="e.g. App crashes when clicking delete on ticket" />
                 {errors.title && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.title.message}</p>}
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                 <textarea {...register('description')} rows={4} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-medium" />
                 {errors.description && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.description.message}</p>}
              </div>
           </div>
        </Section>

        {/* Reproduce */}
        <Section title="Steps to Reproduce" icon={ListOrdered} step={3}>
           <div className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reproduction Steps</label>
                 <textarea {...register('stepsToReproduce')} rows={4} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-medium" placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe that..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Expected Behaviour</label>
                    <textarea {...register('expectedBehaviour')} rows={3} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-medium" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Actual Behaviour</label>
                    <textarea {...register('actualBehaviour')} rows={3} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-medium" />
                 </div>
              </div>
           </div>
        </Section>

        {/* Environment */}
        <Section title="Environment & Severity" icon={Monitor} step={4}>
           <div className="space-y-8">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Environment Details</label>
                 <input {...register('environment')} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 font-bold" placeholder="e.g. Chrome 124, Windows 11, v2.1.0" />
              </div>

              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Severity Level</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(SeverityConfig).map(([key, config]) => (
                      <label
                        key={key}
                        className={cn(
                          "relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          selectedSeverity === key ? "border-indigo-600 bg-indigo-50/30 shadow-md" : "border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200"
                        )}
                      >
                         <div className={cn("mt-1 h-3 w-3 rounded-full shrink-0", config.dot)} />
                         <div className="flex-1">
                            <p className="text-sm font-black text-gray-900 leading-none">{config.label}</p>
                            <p className="text-xs text-gray-400 font-medium mt-2 leading-snug">{config.description}</p>
                         </div>
                         <input type="radio" {...register('severity')} value={key} className="hidden" />
                      </label>
                    ))}
                 </div>
              </div>
           </div>
        </Section>

        {/* Attachments */}
        <Section title="Attachments" icon={Paperclip} step={5}>
           <div className="space-y-4">
              <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-indigo-400 transition-colors group">
                 <Upload className="h-10 w-10 text-gray-300 mx-auto mb-4 group-hover:text-indigo-400 transition-colors" />
                 <p className="text-sm font-bold text-gray-600">Drag files here or <span className="text-indigo-600">browse</span></p>
                 <p className="text-[10px] text-gray-400 font-black uppercase mt-2">Max 5 files • 10MB each</p>
                 <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="flex flex-wrap gap-3">
                 {attachments.map((file, idx) => (
                   <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <span className="text-xs font-bold text-indigo-700 truncate max-w-[150px]">{file.name}</span>
                      <button type="button" onClick={() => removeFile(idx)} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-600">
                         <X className="h-3.5 w-3.5" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </Section>

        <div className="pt-6">
           <button
             type="submit"
             disabled={isSubmitting}
             className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
           >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                <>
                  SUBMIT BUG REPORT
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
           </button>
        </div>
      </form>

      {projectTemplate && (
        <div className="text-center">
           <p className="text-xs text-gray-400 font-bold uppercase">Prefer reporting via email?</p>
           <button className="mt-3 flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-50 mx-auto transition-all">
              <Download className="h-3.5 w-3.5" /> DOWNLOAD EMAIL TEMPLATE
           </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, step, children }: any) {
  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
       <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <Icon className="h-5 w-5 text-indigo-600" />
             </div>
             <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">{title}</h2>
          </div>
          <span className="h-7 w-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
             {step}
          </span>
       </div>
       <div className="p-8">
          {children}
       </div>
    </section>
  );
}
