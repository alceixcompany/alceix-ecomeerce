'use client';
import {useEffect,useState} from 'react';
import type {Creator,CreatorPortfolio} from '../types/creator';
import {creatorProfileKey,isPublishedCreator,type PublishedCreator} from '../utils/profile';
export function usePublishedCreator(creator:Creator,portfolio:CreatorPortfolio){const [profile,setProfile]=useState<PublishedCreator>({creator,portfolio,isAvailable:true});useEffect(()=>{try{const raw=localStorage.getItem(creatorProfileKey(creator.id));if(raw){const parsed:unknown=JSON.parse(raw);if(isPublishedCreator(parsed,creator.id))setProfile(parsed);}}catch{/* Seed portfolio remains visible if storage cannot be read. */}},[creator.id]);return profile;}
