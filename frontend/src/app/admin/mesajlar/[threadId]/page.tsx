import {PlatformThread} from '@/modules/platform-admin';
export default async function Page({params}:{params:Promise<{threadId:string}>}){
  const {threadId}=await params;
  let decodedId=threadId;
  try { decodedId=decodeURIComponent(threadId); } catch { /* Malformed IDs use the missing conversation state. */ }
  return <PlatformThread threadId={decodedId}/>;
}
