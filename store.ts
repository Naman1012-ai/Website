import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Request {
  id: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  quantity: number; // units
  timestamp: number;
  status: 'pending' | 'accepted' | 'ignored';
}

interface RedLinkState {
  // Donor State
  donorName: string;
  donorBloodGroup: BloodGroup;
  isAvailable: boolean;
  
  // Hospital State
  hospitalName: string;
  
  // System State
  activeRequests: Request[];
  
  // Actions
  setDonorAvailability: (isAvailable: boolean) => void;
  setDonorBloodGroup: (group: BloodGroup) => void;
  createRequest: (bloodGroup: BloodGroup, quantity: number) => void;
  respondToRequest: (requestId: string, response: 'accepted' | 'ignored') => void;
  reset: () => void;
}

export const useRedLinkStore = create<RedLinkState>((set, get) => ({
  donorName: "John Doe",
  donorBloodGroup: "O+",
  isAvailable: false, // Default to OFF
  
  hospitalName: "City General Hospital",
  activeRequests: [],

  setDonorAvailability: (isAvailable) => set({ isAvailable }),
  
  setDonorBloodGroup: (group) => set({ donorBloodGroup: group }),
  
  createRequest: (bloodGroup, quantity) => {
    const newRequest: Request = {
      id: nanoid(),
      hospitalName: get().hospitalName,
      bloodGroup,
      quantity,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    set((state) => ({
      activeRequests: [newRequest, ...state.activeRequests]
    }));
  },
  
  respondToRequest: (requestId, response) => {
    set((state) => ({
      activeRequests: state.activeRequests.map(req => 
        req.id === requestId ? { ...req, status: response } : req
      )
    }));
  },
  
  reset: () => set({ activeRequests: [], isAvailable: false })
}));
