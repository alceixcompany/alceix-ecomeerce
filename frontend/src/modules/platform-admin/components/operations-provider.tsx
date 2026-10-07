'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {usePlatform} from './provider';
import {initialOperations,platformTickets} from '../mocks/operations';
import {canAccess,isOperations,migrateOperations} from '../utils/operations';
import type {Operations,PageKey,Staff} from '../types/operations';
import type {ManagementTicket} from '@/types/management-snapshot';
const key='alceix:platform-admin:operations:v1',previewKey='alceix:platform-admin:staff-preview:v1';
type Value={operations:Operations;staff:Staff;ready:boolean;tickets:ManagementTicket[];can:(page:PageKey,write?:boolean)=>boolean;preview:(id:string)=>void;commit:(next:Operations,page:PageKey,action:string)=>boolean};
const Context=createContext<Value|null>(null);
export function OperationsProvider({children}:{children:React.ReactNode}){const {accounts,ready:platformReady,notify}=usePlatform(),[operations,setOperations]=useState(initialOperations),[staffId,setStaffId]=useState('owner'),[ready,setReady]=useState(false);
 useEffect(()=>{if(!platformReady)return;function load(){try{const raw=localStorage.getItem(key);if(raw){const parsed:unknown=migrateOperations(JSON.parse(raw));if(isOperations(parsed,accounts.map(a=>a.id)))setOperations(parsed);else {setOperations(initialOperations());notify('Operasyon kaydı geçersiz; örnek kayıtlar gösteriliyor.');}}else setOperations(initialOperations());setStaffId(localStorage.getItem(previewKey)||'owner');}catch{notify('Operasyon kayıtları okunamadı.');}setReady(true);}load();window.addEventListener('storage',load);return()=>window.removeEventListener('storage',load);},[platformReady,accounts,notify]);
 const staff=operations.staff.find(s=>s.id===staffId)||operations.staff.find(s=>s.id==='owner')!;
 function preview(id:string){if(!operations.staff.some(s=>s.id===id&&s.status==='active'))return;try{localStorage.setItem(previewKey,id);setStaffId(id);notify('Demo rol görünümü değiştirildi.');}catch{notify('Rol görünümü kaydedilemedi.');}}
 function commit(next:Operations,page:PageKey,action:string){if(!ready||!canAccess(staff,page,true)){notify('Bu demo rolde düzenleme yetkisi yok.');return false;}const updated={...next,events:[{id:crypto.randomUUID(),actor:staff.name,action,createdAt:new Date().toISOString()},...next.events].slice(0,300)};if(!isOperations(updated,accounts.map(a=>a.id))){notify('Form verilerini ve kayıt sınırlarını kontrol edin.');return false;}try{localStorage.setItem(key,JSON.stringify(updated));setOperations(updated);notify('İşlem yerel demo kaydına işlendi.');return true;}catch{notify('Kaydedilemedi; değişiklik uygulanmadı.');return false;}}
 return <Context.Provider value={{operations,staff,ready,tickets:platformTickets(accounts),can:(p,w)=>canAccess(staff,p,w),preview,commit}}>{children}</Context.Provider>;
}
export function useOperations(){const value=useContext(Context);if(!value)throw new Error('Operations provider is required.');return value;}
