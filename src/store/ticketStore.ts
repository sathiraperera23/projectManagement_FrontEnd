import { create } from 'zustand';

interface TicketFilters {
  projectId?: number;
  productId?: number;
  subProjectId?: number;
  statusId?: number;
  priority?: string;
  category?: string;
  teamId?: number;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

interface TicketStore {
  filters: TicketFilters;
  selectedTicketIds: number[];
  setFilter: <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => void;
  clearFilters: () => void;
  toggleTicketSelection: (id: number) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
}

export const useTicketStore = create<TicketStore>((set) => ({
  filters: {},
  selectedTicketIds: [],
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),
  clearFilters: () => set({ filters: {} }),
  toggleTicketSelection: (id) =>
    set((state) => ({
      selectedTicketIds: state.selectedTicketIds.includes(id)
        ? state.selectedTicketIds.filter((i) => i !== id)
        : [...state.selectedTicketIds, id]
    })),
  clearSelection: () => set({ selectedTicketIds: [] }),
  selectAll: (ids) => set({ selectedTicketIds: ids }),
}));
