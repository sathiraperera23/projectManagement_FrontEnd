export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
}

export interface SubProject {
  id: string;
  projectId: string;
  name: string;
}
