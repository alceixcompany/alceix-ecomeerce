"use client";
import {useEffect,useState} from 'react';
export function useWorkspaceRecord<T>(key:string, initial:T, validate:(value:unknown)=>value is T){
 const [value,setValue]=useState(initial),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{function read(){try{const raw=localStorage.getItem(key);if(raw){const record:unknown=JSON.parse(raw);if(validate(record))setValue(record);else setError('Geçersiz yerel kayıt atlandı. Örnek veriler gösteriliyor.');}}catch{setError('Yerel kayıt okunamadı.');}setReady(true);}function changed(event:Event){if(event instanceof StorageEvent&&event.key!==key)return;if(event instanceof CustomEvent&&event.detail!==key)return;read();}read();window.addEventListener('storage',changed);window.addEventListener('alceix-workspace-update',changed);return()=>{window.removeEventListener('storage',changed);window.removeEventListener('alceix-workspace-update',changed);};},[key,validate]);
 function save(next:T){if(!ready||!validate(next)){setError('Kaydı kontrol edin.');return false;}try{localStorage.setItem(key,JSON.stringify(next));setValue(next);setError('');window.dispatchEvent(new CustomEvent('alceix-workspace-update',{detail:key}));return true;}catch{setError('Kayıt saklanamadı. Değişiklikler henüz kaydedilmedi.');return false;}}
 return {value,ready,error,save,setError};
}
