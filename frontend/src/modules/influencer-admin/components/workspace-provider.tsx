'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {isPublishedCreator,creatorProfileKey} from '@/modules/creator-directory';
import {initialWorkspace,brands} from '../mocks/workspace';
import {isCreatorWorkspace} from '../utils/workspace';
import type {CreatorWorkspace} from '../types/workspace';
type ContextValue={workspace:CreatorWorkspace;ready:boolean;notice:string;notify:(s:string)=>void;save:(w:CreatorWorkspace)=>boolean;creatorId:string};
const Context=createContext<ContextValue|null>(null);
export function CreatorWorkspaceProvider({creatorId,children}:{creatorId:string;children:React.ReactNode}){const [workspace,setWorkspace]=useState(()=>initialWorkspace(creatorId)),[ready,setReady]=useState(false),[notice,notify]=useState('');const key=`alceix:influencer:${creatorId}:workspace:v1`;
 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw){const w:unknown=JSON.parse(raw);if(isCreatorWorkspace(w,creatorId,isPublishedCreator,brands.map(b=>b.id)))setWorkspace(w);else notify('Kayıt okunamadı; örnek influencer çalışma alanı açıldı.');}}catch{notify('Yerel veri okunamadı.');}setReady(true);},[key,creatorId]);
 function save(w:CreatorWorkspace){if(!ready||!isCreatorWorkspace(w,creatorId,isPublishedCreator,brands.map(b=>b.id))){notify('Alanları ve veri limitlerini kontrol edin.');return false;}try{localStorage.setItem(key,JSON.stringify(w));setWorkspace(w);return true;}catch{notify('Tarayıcıya kaydedilemedi; işlem tamamlanmadı.');return false;}}
 return <Context.Provider value={{workspace,ready,notice,notify,save,creatorId}}>{children}</Context.Provider>;}
export function useCreatorWorkspace(){const context=useContext(Context);if(!context)throw new Error('Creator workspace required.');return context;}
export {creatorProfileKey};
