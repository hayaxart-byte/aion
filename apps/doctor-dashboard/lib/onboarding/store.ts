import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, OnboardingActions, MedicalCenterData, BioData, VerificationData, PlanData } from './types';

const initialState: OnboardingState = {
  completed: false,
  step: 0,
  profileType: null,
  medicalCenter: {
    name: '',
    country: '',
    state: '',
    city: '',
    address: '',
    phone: '',
    latitude: null,
    longitude: null,
  },
  bio: {
    avatarUrl: null,
    description: '',
  },
  verification: {
    email: '',
    verified: false,
  },
  plan: {
    type: null,
    interval: 'monthly',
  },
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setProfileType: (profileType) => set({ profileType }),

      setMedicalCenter: (data) =>
        set((state) => ({
          medicalCenter: { ...state.medicalCenter, ...data },
        })),

      setBio: (data) =>
        set((state) => ({
          bio: { ...state.bio, ...data },
        })),

      setVerification: (data) =>
        set((state) => ({
          verification: { ...state.verification, ...data },
        })),

      setPlan: (data) =>
        set((state) => ({
          plan: { ...state.plan, ...data },
        })),

      reset: () => set(initialState),

      complete: () => set({ completed: true }),

      saveToBackend: async () => {
        const state = get();
        try {
          const res = await fetch('/api/onboarding/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileType: state.profileType,
              medicalCenter: state.medicalCenter,
              bio: state.bio,
              verification: state.verification,
              plan: state.plan,
            }),
          });
          if (!res.ok) throw new Error('Error al guardar onboarding');
        } catch (err) {
          console.error('[Onboarding] save error:', err);
          throw err;
        }
      },
    }),
    { name: 'aion:onboarding' }
  )
);
