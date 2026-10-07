'use client';
import {useEffect,useState} from 'react';
import {useSupplierWorkspace} from '../components/workspace-provider';
import {initialSupplierTools} from '../mocks/tools';
import {isSupplierTools} from '../utils/tools';
import type {SupplierTools} from '../types/tools';
export function useSupplierTools(){const {company,notify}=useSupplierWorkspace();const key=`alceix:supplier:${company.id}:tools:v1`;const [tools,setTools]=useState(initialSupplierTools);const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw){const parsed:unknown=JSON.parse(raw);if(isSupplierTools(parsed))setTools(parsed);else notify('Kayıtlı ekip ve araç verisi geçersiz; örnek kayıtlar açıldı.');}}catch{notify('Yerel araç verisi okunamadı.');}setReady(true);},[key,notify]);
 function updateTools(change:(current:SupplierTools)=>SupplierTools){setTools(current=>{const next=change(current);if(!isSupplierTools(next)){notify('Araç verileri doğrulanamadı.');return current;}try{localStorage.setItem(key,JSON.stringify(next));}catch{notify('Kayıt bu oturumda tutuluyor; tarayıcıya kaydedilemedi.');}return next;});}
 return {tools,updateTools,ready};}
