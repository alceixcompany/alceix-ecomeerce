'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {usePlatform} from './provider';
import {useOperations} from './operations-provider';
import {managementReviews} from '@/modules/reviews/management';
import type {ManagedReview} from '@/modules/reviews/management';
import {initialCommercial} from '../mocks/commercial';
import {commissionLedger,isCommercial} from '../utils/commercial';
import type {Commercial} from '../types/commercial';
const key='alceix:platform-admin:commercial:v1';
const empty:Commercial={policies:[],ledger:[],codes:[],conversions:[],moderation:[],events:[]};
type Value={commercial:Commercial;reviews:ManagedReview[];ready:boolean;commit:(next:Commercial,page:'finance'|'referrals'|'reviews',action:string)=>boolean};
const Context=createContext<Value|null>(null);
export function CommercialProvider({children}:{children:React.ReactNode}){const {accounts,ready:platformReady,notify}=usePlatform(),{can,staff}=useOperations(),[commercial,setCommercial]=useState(empty),[reviews,setReviews]=useState<ManagedReview[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{if(!platformReady)return;function load(){const issues:string[]=[];const reviewList=managementReviews(accounts,(key,fallback,validate)=>{try{const raw=localStorage.getItem(key);if(raw){const parsed:unknown=JSON.parse(raw);if(validate(parsed))return parsed;issues.push(key);}}catch{issues.push(key);}return fallback;});setReviews(reviewList);try{const raw=localStorage.getItem(key);const parsed:unknown=raw?JSON.parse(raw):initialCommercial(accounts,new Date().toISOString());if(isCommercial(parsed,accounts.map(a=>a.id),reviewList.map(r=>r.key))){const next={...parsed,ledger:commissionLedger(accounts,parsed.policies,parsed.ledger,new Date().toISOString())};if(isCommercial(next,accounts.map(a=>a.id),reviewList.map(r=>r.key))){setCommercial(next);localStorage.setItem(key,JSON.stringify(next));}}else{setCommercial(initialCommercial(accounts,new Date().toISOString()));notify('Ticari kayıt doğrulanamadı; örnek görünüm açıldı, eski kayıt değiştirilmedi.');}}catch{notify('Ticari kayıt okunamadı veya depolama kullanılamıyor.');setCommercial(initialCommercial(accounts,new Date().toISOString()));}if(issues.length)notify('Bazı değerlendirme kayıtları geçersiz; örnek değerlendirmeler gösteriliyor.');setReady(true);}load();window.addEventListener('storage',load);return()=>window.removeEventListener('storage',load);},[accounts,platformReady,notify]);
 function commit(next:Commercial,page:'finance'|'referrals'|'reviews',action:string){if(!ready||!can(page,true)){notify('Bu sayfada düzenleme yetkin yok.');return false;}const updated={...next,events:[{id:crypto.randomUUID(),actor:staff.name,action,createdAt:new Date().toISOString()},...next.events].slice(0,300)};if(!isCommercial(updated,accounts.map(a=>a.id),reviews.map(r=>r.key))){notify('Ticari kaydı ve alan sınırlarını kontrol edin.');return false;}try{localStorage.setItem(key,JSON.stringify(updated));setCommercial(updated);notify('Ticari işlem yerel demo kaydına işlendi.');return true;}catch{notify('Kaydedilemedi; değişiklik uygulanmadı.');return false;}}
 return <Context.Provider value={{commercial,reviews,ready,commit}}>{children}</Context.Provider>;
}
export function useCommercial(){const value=useContext(Context);if(!value)throw new Error('Commercial provider is required.');return value;}
