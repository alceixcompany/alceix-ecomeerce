import {storeManagementSnapshot} from '@/modules/customer-admin/management';
import {supplierManagementSnapshot} from '@/modules/supplier-admin/management';
import {creatorManagementSnapshot} from '@/modules/influencer-admin/management';
import type {ManagementAccount,SnapshotReader} from '@/types/management-snapshot';
export function managementSnapshot(reader:SnapshotReader):ManagementAccount[]{return [...storeManagementSnapshot(reader),...supplierManagementSnapshot(reader),...creatorManagementSnapshot(reader)];}
export const seedSnapshot=()=>managementSnapshot((_key,fallback)=>fallback);
export function readManagementSnapshot(storage:Pick<Storage,'getItem'>){const issues:string[]=[];const reader:SnapshotReader=(key,fallback,validate)=>{try{const raw=storage.getItem(key);if(raw!==null){const parsed:unknown=JSON.parse(raw);if(validate(parsed))return parsed;issues.push(key);}}catch{issues.push(key);}return fallback;};return {accounts:managementSnapshot(reader),issues};}
