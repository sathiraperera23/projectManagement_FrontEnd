'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId;

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}/summary`);
    }
  }, [projectId, router]);

  return null;
}
