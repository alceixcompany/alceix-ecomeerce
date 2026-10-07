import {seedSnapshot} from './services/snapshot';
import type {AccountKind} from '@/types/management-snapshot';
export function knownMember(kind:AccountKind,slug:string){return seedSnapshot().some(a=>a.kind===kind&&a.slug===slug);}

export function knownAccount(id:string){return seedSnapshot().some(a=>a.id===id);}
