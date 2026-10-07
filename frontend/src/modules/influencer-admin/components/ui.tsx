'use client';
import {useEffect,useRef} from 'react';
export const money=(n:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(n/100);
export const number=(n:number)=>n.toLocaleString('tr-TR');
export function Icon({name}:{name:string}){return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>;}
export function Heading({title,description,children}:{title:string;description:string;children?:React.ReactNode}){return <header className="ic-heading"><div><span className="ad-eyebrow">İÇERİK ÜRETİCİ ÇALIŞMA ALANI</span><h1>{title}</h1><p>{description}</p></div><div className="ic-actions">{children}</div></header>;}
export function Dialog({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();},[]);return <dialog className="ad-dialog ic-dialog" ref={ref} onClose={onClose} aria-label={title}><div className="ad-dialog-heading"><h2>{title}</h2><button type="button" onClick={()=>ref.current?.close()} aria-label="Kapat"><Icon name="close"/></button></div>{children}</dialog>;}
export function Empty({children}:{children:React.ReactNode}){return <p className="ic-empty">{children}</p>;}
export function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="ic-field"><span>{label}</span>{children}</label>;}
