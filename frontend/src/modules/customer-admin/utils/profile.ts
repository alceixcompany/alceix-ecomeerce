import type {Profile} from '../types/collaboration';
export const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function isProfile(value:unknown):value is Profile {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const profile=value as Record<string,unknown>;
 return typeof profile.name==='string'&&profile.name.length<=80&&!!profile.name.trim()&&typeof profile.email==='string'&&validEmail(profile.email)&&typeof profile.phone==='string'&&profile.phone.length<=30&&typeof profile.city==='string'&&profile.city.length<=80&&typeof profile.bio==='string'&&profile.bio.length<=500;
}
