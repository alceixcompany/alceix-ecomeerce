"use client";
import Link from 'next/link';
import {logout} from '@/modules/marketing-auth';
import {errorMessage} from '@/lib/http';
import {useEffect,useRef,useState} from 'react';
import {storeRoutes} from '@/config/store-routes';
import type {AdminStore} from '../mocks/dashboard';
import {loadProfile} from '../services/account-api';
export function AccountMenu({store,onNavigate,onNotice}:{store:AdminStore;onNotice?:(message:string)=>void;onNavigate?:(event:React.MouseEvent<HTMLAnchorElement>)=>void}){
 const [open,setOpen]=useState(false),[name,setName]=useState(store.account?.name||store.name);const wrapper=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const controller=new AbortController();function update(){loadProfile(controller.signal).then(profile=>setName(profile.name)).catch(()=>{if(!controller.signal.aborted)setName(store.account?.name||store.name);});}update();window.addEventListener('alceix-account-profile-update',update);return()=>{controller.abort();window.removeEventListener('alceix-account-profile-update',update);};},[store.account?.name,store.name]);
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!wrapper.current?.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 return <div className="co-account-wrap" ref={wrapper} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);button.current?.focus();}}}><button ref={button} className="co-account-button" aria-label="Kullanıcı hesabı" aria-expanded={open} aria-controls="account-options" onClick={()=>setOpen(!open)}><span className="ad-account-name">{name}<small>Mağaza yöneticisi</small></span><span className="ad-avatar">{name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span></button>{open&&<nav id="account-options" className="co-account-menu" aria-label="Kullanıcı hesabı seçenekleri">{[['Profilimi Yönet',storeRoutes.profile(store.slug)],['Ekip & Davetler',storeRoutes.team(store.slug)],['Mesajlarım',storeRoutes.messages(store.slug)]].map(([label,href])=><Link href={href} key={href} onClick={e=>{onNavigate?.(e);if(!e.defaultPrevented)setOpen(false);}}>{label}</Link>)}<button type="button" onClick={async()=>{try{await logout();window.location.assign("/giris-yap");}catch(error){onNotice?.(errorMessage(error));}}}>Oturumu Kapat</button></nav>}</div>;
}
