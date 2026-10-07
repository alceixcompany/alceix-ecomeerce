import {demoTickets} from './mocks/support';
import {isSupportTickets} from './utils/support';
import type {ManagementAccount,SnapshotReader} from '@/types/management-snapshot';
import {storeRoutes as r} from '@/config/store-routes';
import {creators} from '@/modules/creator-directory';
import {isProfileSettings} from '@/modules/admin-editors';
import {getAdminStore} from './mocks/dashboard';
import {initialSettings} from './mocks/settings';
import {demoOrders} from './mocks/orders';
import {demoCustomers,defaultCrmSettings} from './mocks/customers';
import {campaignProducts,initialCampaigns,campaignStatusLabels} from './mocks/influencer';
import {suppliers} from './mocks/suppliers';
const contacts=[...suppliers.map(s=>({id:`supplier:${s.id}`,name:s.name})),...creators.map(c=>({id:`creator:${c.id}`,name:c.name}))];
import {isCampaigns} from './utils/influencer';
import {isMessages,isTeam} from './utils/collaboration';
import {isCrmData} from './utils/customer';
import {orderTotal} from './utils/order';
import type {ChatMessage,TeamMember} from './types/collaboration';
export function storeManagementSnapshot(read:SnapshotReader):ManagementAccount[]{return ['firmaadi','luma-studio','magazaadi'].map(slug=>{const store=getAdminStore(slug)!,profile=read(`alceix:store-settings:${slug}`,initialSettings(store),isProfileSettings),crm=read(`alceix:crm:${slug}`,{customers:demoCustomers,settings:defaultCrmSettings},isCrmData),messages=read<ChatMessage[]>(`alceix:messages:${slug}`,[],isMessages),campaigns=read(`alceix:influencer:${slug}`,initialCampaigns,(v):v is typeof initialCampaigns=>isCampaigns(v,creators.map(c=>c.id),campaignProducts.map(p=>p.id))),team=read<TeamMember[]>(`alceix:team:${slug}`,[{id:'owner',name:'Ceyda A.',email:'ceyda@example.com',role:'owner',status:'active'}],isTeam),id=`store:${slug}`;return {id,slug,kind:'store',name:profile.name,city:slug==='firmaadi'?'İstanbul':'İzmir',initials:store.initials,bio:profile.bio,email:`${slug}@example.com`,panelUrl:r.admin(slug),publicUrl:r.storefront(store.storefrontSlug),products:9,customers:crm.customers.length,people:team.map(p=>({name:p.name,role:p.role})),metrics:[{label:'Firma Unvanı',value:profile.company},{label:'Müşteri Kaydı',value:String(crm.customers.length)},{label:'Vitrin Durumu',value:profile.isOpen?'Açık':'Kapalı'}],orders:demoOrders.map(o=>({id:o.id,accountId:id,buyer:o.customer,amountCents:orderTotal(o),quantity:o.items.reduce((n,i)=>n+i.quantity,0),createdAt:o.createdAt,status:o.shipment,payment:o.payment==='paid'?'Ödendi':o.payment==='pending'?'Bekliyor':'İade Edildi',detailUrl:r.order(slug,o.id),product:o.items.map(p=>p.name).join(', ')})),works:campaigns.map(c=>({id:c.id,accountId:id,title:c.name,partner:creators.find(p=>p.id===c.creatorId)!.name,amountCents:c.fee,status:campaignStatusLabels[c.status],detailUrl:r.influencer(slug),brief:c.brief})),tickets:read(`alceix:support:${slug}`,{tickets:demoTickets},(v):v is {tickets:typeof demoTickets}=>!!v&&typeof v==='object'&&'tickets' in v&&isSupportTickets(v.tickets)).tickets.map(t=>({id:`${id}~${t.id}`,accountId:id,source:t.channel==='customer'?'buyer':'store',requester:t.requester,subject:t.subject,category:t.category,priority:t.priority,status:t.status,orderId:t.orderId,messages:t.messages.map(m=>({id:m.id,sender:m.name,body:m.text}))})),threads:contacts.map(c=>({id:`${id}~${c.id}`,accountId:id,partner:c.name,panelUrl:r.messages(slug,c.id),messages:messages.filter(m=>m.thread===c.id).map(m=>({id:m.id,sender:profile.name,body:m.text}))})).filter(t=>t.messages.length>0)};});}
