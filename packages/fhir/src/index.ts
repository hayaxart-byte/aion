export {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from './patients';

export {
  getAppointments,
  getAppointment,
  createAppointment,
  getTodaysAppointments,
  getUpcomingAppointments,
} from './appointments';

export {
  getEncounters,
  getRecentEncounters,
} from './encounters';

export {
  getCurrentPractitioner,
  getPractitionerByProfile,
} from './practitioner';

export { ServerFhirClient, createServerClient } from '@aion/medplum-client';