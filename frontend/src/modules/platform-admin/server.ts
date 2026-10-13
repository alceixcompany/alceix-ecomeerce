import 'server-only';
import {notFound,redirect} from 'next/navigation';
import {z} from 'zod';
import {serverApi} from '@/lib/server-http';
import {ApiError} from '@/lib/http';
export async function requirePlatformAccess(returnPath='/admin'){
 try{await serverApi('/auth/platform-access',z.object({allowed:z.literal(true)}),true);}catch(error){if(error instanceof ApiError&&error.status===401)redirect(`/giris-yap?next=${encodeURIComponent(returnPath)}`);if(error instanceof ApiError&&error.status===404)notFound();throw error;}
}
import {seedSnapshot} from './services/snapshot';
import type {AccountKind} from '@/types/management-snapshot';
export function knownMember(kind:AccountKind,slug:string){return seedSnapshot().some(a=>a.kind===kind&&a.slug===slug);}

export function knownAccount(id:string){return seedSnapshot().some(a=>a.id===id);}
