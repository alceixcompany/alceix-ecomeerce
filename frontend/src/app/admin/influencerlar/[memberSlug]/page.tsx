import {notFound} from 'next/navigation';
import {MemberDetail} from '@/modules/platform-admin';
import {knownMember} from '@/modules/platform-admin/server';
export default async function Page({params}:{params:Promise<{memberSlug:string}>}){const {memberSlug}=await params;if(!knownMember('creator',memberSlug))notFound();return <MemberDetail kind='creator' slug={memberSlug}/>;}
