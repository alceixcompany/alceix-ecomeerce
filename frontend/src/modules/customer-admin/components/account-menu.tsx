"use client";
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {storeRoutes} from '@/config/store-routes';
import type {AdminStore} from '../mocks/dashboard';
import {initialProfile} from '../mocks/collaboration';
import {isProfile} from '../utils/profile';
export function AccountMenu({store,onNavigate}:{store:AdminStore;onNavigate?:(event:React.MouseEvent<HTMLAnchorElement>)=>void}){
 const [open,setOpen]=useState(false),[name,setName]=useState(initialProfile.name);const wrapper=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{function update(event?:Event){const key=`alceix:profile:${store.slug}`;if(event instanceof StorageEvent&&event.key!==key)return;if(event instanceof CustomEvent&&event.detail!==key)return;try{const raw=localStorage.getItem(`alceix:profile:${store.slug}`);const value:unknown=raw?JSON.parse(raw):initialProfile;setName(isProfile(value)?value.name:initialProfile.name);}catch{setName(initialProfile.name);}}update();window.addEventListener('alceix-workspace-update',update);window.addEventListener('storage',update);return()=>{window.removeEventListener('alceix-workspace-update',update);window.removeEventListener('storage',update);};},[store.slug]);
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!wrapper.current?.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 return <div className="co-account-wrap" ref={wrapper} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);button.current?.focus();}}}><button ref={button} className="co-account-button" aria-label="Kullanıcı hesabı" aria-expanded={open} aria-controls="account-options" onClick={()=>setOpen(!open)}><span className="ad-account-name">{name}<small>Mağaza yöneticisi</small></span><span className="ad-avatar">{name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span></button>{open&&<nav id="account-options" className="co-account-menu" aria-label="Kullanıcı hesabı seçenekleri">{[['Profilimi Yönet',storeRoutes.profile(store.slug)],['Ekip & Davetler',storeRoutes.team(store.slug)],['Mesajlarım',storeRoutes.messages(store.slug)]].map(([label,href])=><Link href={href} key={href} onClick={e=>{onNavigate?.(e);if(!e.defaultPrevented)setOpen(false);}}>{label}</Link>)}</nav>}</div>;
}
