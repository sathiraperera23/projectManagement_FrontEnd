export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface Permission {
  id: string;
  name: string;
}
