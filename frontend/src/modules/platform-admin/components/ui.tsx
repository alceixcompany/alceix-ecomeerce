'use client';
import {useEffect,useRef} from 'react';
import {useSearchParams} from 'next/navigation';
import {queryTarget,safePage} from '../utils/administration';
export function Icon({name}:{name:string}){return <span aria-hidden="true" className="material-symbols-outlined">{name}</span>;}
export function Heading({title,description,children}:{title:string;description:string;children?:React.ReactNode}){return <header className="pa-heading"><div><span className="ad-eyebrow">ALCEIX · ANA YÖNETİM</span><h1>{title}</h1><p>{description}</p></div><div className="pa-actions">{children}</div></header>;}
export function Dialog({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();},[]);return <dialog className="ad-dialog pa-dialog" ref={ref} aria-label={title} onClose={close}><div className="ad-dialog-heading"><h2>{title}</h2><button onClick={()=>ref.current?.close()} aria-label="Kapat"><Icon name="close"/></button></div>{children}</dialog>;}
export function Empty({children}:{children:React.ReactNode}){return <p className="pa-empty">{children}</p>;}
export function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="pa-field"><span>{label}</span>{children}</label>;}
export function useFilters(){const params=useSearchParams();function set(key:string,value:string){const query=queryTarget(window.location.search,key,value);window.history.replaceState(null,'',window.location.pathname+(query?'?'+query:''));}return {params,set};}
export function Pagination({total}:{total:number}){const {params,set}=useFilters(),page=safePage(params.get('page'),total),max=Math.max(1,Math.ceil(total/8));return <div className="pa-pagination"><span>{total} kayıt · Sayfa {page} / {max}</span><button className="ad-button light" disabled={page===1} onClick={()=>set('page',String(page-1))}>Önceki</button><button className="ad-button light" disabled={page===max} onClick={()=>set('page',String(page+1))}>Sonraki</button></div>;}
export function downloadCsv(csv:string,name:string){const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
