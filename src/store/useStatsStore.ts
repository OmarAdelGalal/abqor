import { create } from 'zustand';

interface StatsState {
  health: number;
  diamonds: number;
  flame: number;
  setStats: (stats: { health: number; diamonds: number; flame: number }) => void;
  updateHealth: (amount: number) => void;
  updateDiamonds: (amount: number) => void;
  updateFlame: (amount: number) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  health: 0,
  diamonds: 0,
  flame: 0,
  setStats: (stats) => set(stats),
  updateHealth: (amount) => set((state) => ({ health: Math.max(0, state.health + amount) })),
  updateDiamonds: (amount) => set((state) => ({ diamonds: Math.max(0, state.diamonds + amount) })),
  updateFlame: (amount) => set((state) => ({ flame: Math.max(0, state.flame + amount) })),
}));
