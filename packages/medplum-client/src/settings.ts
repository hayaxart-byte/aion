import type { MedplumClient, Practitioner } from '@aion/vendor-medplum';

export interface AgendaSettings {
  defaultDuration: number;
  startHour: number;
  endHour: number;
  activeDays: number[];
}

export interface NotificationSettings {
  whatsappEnabled: boolean;
  emailReminders: boolean;
  reminderMinutes: number;
}

export interface SystemSettings {
  timezone: string;
  timeFormat: '24h' | '12h';
  dateFormat: string;
}

export interface ClinicSettings {
  name: string;
  logoUrl: string;
  phone: string;
  address: string;
}

export interface PractitionerSettings {
  agenda: AgendaSettings;
  notifications: NotificationSettings;
  system: SystemSettings;
  clinic: ClinicSettings;
}

const SETTINGS_EXT_URL = 'http://aion.app/settings';
const STORAGE_KEY = 'aion:settings';

export const DEFAULT_SETTINGS: PractitionerSettings = {
  agenda: {
    defaultDuration: 30,
    startHour: 8,
    endHour: 19,
    activeDays: [1, 2, 3, 4, 5],
  },
  notifications: {
    whatsappEnabled: false,
    emailReminders: true,
    reminderMinutes: 30,
  },
  system: {
    timezone: 'America/Mexico_City',
    timeFormat: '24h',
    dateFormat: 'DD/MM/YYYY',
  },
  clinic: {
    name: '',
    logoUrl: '',
    phone: '',
    address: '',
  },
};

function mergeSettings(saved: Partial<PractitionerSettings>): PractitionerSettings {
  return {
    agenda: { ...DEFAULT_SETTINGS.agenda, ...saved.agenda },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...saved.notifications },
    system: { ...DEFAULT_SETTINGS.system, ...saved.system },
    clinic: { ...DEFAULT_SETTINGS.clinic, ...saved.clinic },
  };
}

function parseSettingsExtension(practitioner: Practitioner): PractitionerSettings | null {
  const ext = practitioner.extension?.find((e) => e.url === SETTINGS_EXT_URL);
  if (!ext?.valueString) return null;
  try {
    return JSON.parse(ext.valueString) as PractitionerSettings;
  } catch {
    return null;
  }
}

function loadFromStorage(): PractitionerSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PractitionerSettings;
  } catch {}
  return null;
}

function saveToStorage(settings: PractitionerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export async function loadPractitionerSettings(
  medplum: MedplumClient,
): Promise<PractitionerSettings> {
  const profile = medplum.getProfile();
  if (profile?.resourceType === 'Practitioner' && profile.id) {
    try {
      const practitioner = await medplum.readResource('Practitioner', profile.id);
      const fromFhir = parseSettingsExtension(practitioner);
      if (fromFhir) {
        saveToStorage(fromFhir);
        return mergeSettings(fromFhir);
      }
    } catch {}
  }

  const fromStorage = loadFromStorage();
  if (fromStorage) return mergeSettings(fromStorage);

  return { ...DEFAULT_SETTINGS, agenda: { ...DEFAULT_SETTINGS.agenda }, notifications: { ...DEFAULT_SETTINGS.notifications }, system: { ...DEFAULT_SETTINGS.system }, clinic: { ...DEFAULT_SETTINGS.clinic } };
}

export async function savePractitionerSettings(
  medplum: MedplumClient,
  settings: PractitionerSettings,
): Promise<void> {
  saveToStorage(settings);

  const profile = medplum.getProfile();
  if (profile?.resourceType !== 'Practitioner' || !profile.id) return;

  try {
    const practitioner = await medplum.readResource('Practitioner', profile.id) as Practitioner;
    const existingExts = practitioner.extension?.filter((e) => e.url !== SETTINGS_EXT_URL) ?? [];
    practitioner.extension = [
      ...existingExts,
      { url: SETTINGS_EXT_URL, valueString: JSON.stringify(settings) },
    ];
    await medplum.updateResource(practitioner);
  } catch {
    // fallback: already saved to localStorage
  }
}
