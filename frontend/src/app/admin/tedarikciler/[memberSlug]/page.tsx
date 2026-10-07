import {notFound} from 'next/navigation';
import {MemberDetail} from '@/modules/platform-admin';
import {knownMember} from '@/modules/platform-admin/server';
export default async function Page({params}:{params:Promise<{memberSlug:string}>}){const {memberSlug}=await params;if(!knownMember('supplier',memberSlug))notFound();return <MemberDetail kind='supplier' slug={memberSlug}/>;}
