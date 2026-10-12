import { apiFetch, readApiError } from './api';
export type Service = { id:string; name:string; price_cents:number; duration_minutes:number; mode:string };
export type Provider = { id:string; display_name:string; specialty:string; city:string; clinic_name:string; address:string; biography:string; registration_number:string; is_demo:boolean; services:Service[]; rating:number|null; review_count:number; next_slots:{id:string; starts_at:string}[] };
export type Slot = {id:string; service_id:string; starts_at:string; ends_at:string; is_booked?:boolean; is_published?:boolean};
export type Appointment = {id:string; provider_id:string; provider_name:string; patient_name:string; patient_id:string|null; specialty:string; service_id:string; service_name:string; starts_at:string; ends_at:string; status:string; mode:string; price_cents:number; payment_status:string; care_access_approved:boolean; care_visit_id:string|null; review_status:string|null; address:string; city:string; clinic_name:string};
export type Message = {id:string; body:string; author_id:string; author_name:string; created_at:string};
export type Review = {id:string; rating:number; body:string; author:string; created_at:string};
export async function request<T>(path:string, init:RequestInit={}):Promise<T> {
 const response=await apiFetch(path,init);
 if(!response.ok) throw new Error(await readApiError(response));
 return response.json() as Promise<T>;
}
export const euro=(c:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(c/100);
export const when=(s:string)=>new Intl.DateTimeFormat('it-IT',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Rome'}).format(new Date(s));
export const shortDay=(s:string)=>new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/Rome'}).format(new Date(s));
export const time=(s:string)=>new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(new Date(s));
export const label:Record<string,string>={confirmed:'Confermato',completed:'Completato',cancelled:'Annullato',no_show:'Non presentato',not_paid:'Da pagare in studio',paid_in_office:'Pagato in studio',waived:'Esente',pending:'In moderazione',approved:'Pubblicata',rejected:'Non pubblicata'};
export async function calendarDownload(a:Appointment) {
 const response=await apiFetch(`/booking/appointments/${a.id}/calendar`);
 if(!response.ok) throw new Error(await readApiError(response));
 const url=URL.createObjectURL(await response.blob());const anchor=document.createElement('a');
 anchor.href=url;anchor.download=`visita-${a.id}.ics`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
