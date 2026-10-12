import type { LoggedUser } from './api';

export type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  fiscal_code?: string | null;
  birth_date?: string | null;
  sex?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  guardian_name?: string | null;
  guardian_document?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  notes?: string | null;
  is_archived: boolean;
  archived_at?: string | null;
  created_at: string;
  created_by_user_id?: string | null;
};

export type Assignment = {
  id: string;
  patient_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  team_role: string;
  is_primary: boolean;
  is_active: boolean;
  start_at: string;
  end_at?: string | null;
};

export type Visit = {
  id: string;
  patient_id: string;
  visit_date: string;
  clinical_note?: string | null;
  status: string;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type VitalSign = {
  id: string;
  patient_id: string;
  recorded_by_user_id: string;
  recorded_at: string;
  heart_rate?: number | null;
  systolic_pressure?: number | null;
  diastolic_pressure?: number | null;
  oxygen_saturation?: number | null;
  temperature?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  bmi?: number | null;
  notes?: string | null;
  alert_priority: boolean;
  alert_message?: string | null;
};

export type ClinicalAlert = {
  id: string;
  patient_id: string;
  patient_name: string;
  source_type: string;
  source_id: string;
  category: string;
  priority: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_nurse_id?: string | null;
  validated_by_user_id?: string | null;
  validated_at?: string | null;
  clinical_assessment?: string | null;
  sbar_situation?: string | null;
  sbar_background?: string | null;
  sbar_assessment?: string | null;
  sbar_recommendation?: string | null;
  sent_to_doctor_at?: string | null;
  closed_at?: string | null;
  resolution_note?: string | null;
};

export type ChatMessage = {
  id: string;
  patient_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  body: string;
  created_at: string;
  alert_level: string;
  alert_category?: string | null;
  alert_reason?: string | null;
};

export type ConsentTemplate = {
  id: string;
  code: string;
  title: string;
  version: string;
  body: string;
  is_active: boolean;
  created_at: string;
};

export type Consent = {
  id: string;
  patient_id: string;
  consent_type: string;
  signature_method: string;
  status: string;
  accepted_at: string;
  revoked_at?: string | null;
  file_reference?: string | null;
  signer_name?: string | null;
  signer_role?: string | null;
  notes?: string | null;
  created_by_user_id: string;
  template_id?: string | null;
  template_version?: string | null;
  consent_text_snapshot?: string | null;
  audio_completed: boolean;
  has_signature: boolean;
};

export type Attachment = {
  id: string;
  patient_id: string;
  uploaded_by_user_id: string;
  original_file_name: string;
  mime_type?: string | null;
  category: string;
  description?: string | null;
  file_type: string;
  size_bytes: number;
  caregiver_visible: boolean;
  is_archived: boolean;
  created_at: string;
};

export type TimelineEvent = {
  id: string;
  event_type: string;
  occurred_at: string;
  title: string;
  detail?: string | null;
  severity: string;
};

export type DashboardData = {
  role: string;
  patient_count: number;
  active_alert_count: number;
  alerts_to_review: number;
  today_visit_count: number;
  planned_administrations: number;
  overdue_tasks: number;
  unread_notifications: number;
  upcoming_consultations: number;
  recent_alerts: ClinicalAlert[];
  recent_patients: Patient[];
};

export type User = LoggedUser;


export type Therapy = {
  id: string;
  patient_id: string;
  prescribed_by_user_id: string;
  medication_name: string;
  active_ingredient?: string | null;
  dosage: string;
  route: string;
  frequency?: string | null;
  schedule_times: string[];
  start_date: string;
  end_date?: string | null;
  instructions?: string | null;
  status: string;
  caregiver_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Administration = {
  id: string;
  therapy_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  scheduled_for: string;
  administered_at?: string | null;
  recorded_by_user_id?: string | null;
  status: string;
  dose_given?: string | null;
  notes?: string | null;
  adverse_reaction?: string | null;
  created_at: string;
  updated_at: string;
};

export type CareTask = {
  id: string;
  patient_id: string;
  patient_name: string;
  title: string;
  description?: string | null;
  category: string;
  assigned_role?: string | null;
  assigned_user_id?: string | null;
  due_at: string;
  priority: string;
  status: string;
  completed_at?: string | null;
  completed_by_user_id?: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
};

export type NotificationItem = {
  id: string;
  user_id: string;
  patient_id?: string | null;
  title: string;
  body: string;
  notification_type: string;
  priority: string;
  action_url?: string | null;
  read_at?: string | null;
  created_at: string;
};

export type ConnectedDevice = {
  id: string;
  patient_id: string;
  device_type: string;
  vendor?: string | null;
  model?: string | null;
  serial_number?: string | null;
  medical_grade: boolean;
  connection_status: string;
  battery_level?: number | null;
  last_seen_at?: string | null;
  consent_verified: boolean;
  created_by_user_id: string;
  created_at: string;
};

export type DeviceReading = {
  id: string;
  patient_id: string;
  device_id?: string | null;
  source_type: string;
  metric: string;
  value: number;
  unit?: string | null;
  measured_at: string;
  quality_label: string;
  raw_payload?: string | null;
  created_at: string;
};

export type PoctResult = {
  id: string;
  patient_id: string;
  test_name: string;
  numeric_value?: number | null;
  value_text?: string | null;
  unit?: string | null;
  reference_range?: string | null;
  flag: string;
  performed_at: string;
  performed_by_user_id: string;
  device_id?: string | null;
  notes?: string | null;
  created_at: string;
};

export type Geofence = {
  id: string;
  patient_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  is_active: boolean;
  created_by_user_id: string;
  created_at: string;
};

export type LocationPing = {
  id: string;
  patient_id: string;
  device_id?: string | null;
  latitude: number;
  longitude: number;
  accuracy_m?: number | null;
  measured_at: string;
  inside_safe_zone?: boolean | null;
  alert_generated: boolean;
  created_at: string;
};

export type LearningResource = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  audience: string;
  content_type: string;
  content: string;
  voluntary: boolean;
  is_active: boolean;
  created_at: string;
  progress_status?: string | null;
  progress_percent: number;
};

export type Consultation = {
  id: string;
  patient_id: string;
  patient_name: string;
  requested_by_user_id: string;
  assigned_to_user_id?: string | null;
  scheduled_at: string;
  consultation_type: string;
  status: string;
  meeting_link?: string | null;
  reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowEvent = {
  id: string;
  patient_id?: string | null;
  patient_name?: string | null;
  workflow_type: string;
  workflow_id?: string | null;
  step: string;
  actor_user_id?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  details?: string | null;
  created_at: string;
};

export type FlowSummary = {
  total_events: number;
  events_last_24h: number;
  open_alerts: number;
  active_therapies: number;
  planned_administrations: number;
  overdue_tasks: number;
  unread_notifications: number;
};
