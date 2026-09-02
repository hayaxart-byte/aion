export type ProfileType = 'with_agenda' | 'without_agenda' | null;

export interface MedicalCenterData {
  name: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
}

export interface BioData {
  avatarUrl: string | null;
  description: string;
}

export interface VerificationData {
  email: string;
  verified: boolean;
}

export interface PlanData {
  type: 'basic' | 'premium' | null;
  interval: 'monthly' | 'yearly';
}

export interface OnboardingState {
  completed: boolean;
  step: number;
  profileType: ProfileType;
  medicalCenter: MedicalCenterData;
  bio: BioData;
  verification: VerificationData;
  plan: PlanData;
}

export interface OnboardingActions {
  setStep: (step: number) => void;
  setProfileType: (type: ProfileType) => void;
  setMedicalCenter: (data: Partial<MedicalCenterData>) => void;
  setBio: (data: Partial<BioData>) => void;
  setVerification: (data: Partial<VerificationData>) => void;
  setPlan: (data: Partial<PlanData>) => void;
  reset: () => void;
  complete: () => void;
  saveToBackend: () => Promise<void>;
}
