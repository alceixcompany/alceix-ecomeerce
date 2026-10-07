"use client";
import {ReviewsScreen} from "@/modules/reviews";
import {useSupplierWorkspace} from "../components/workspace-provider";
export function SupplierReviews(){const {company,workspace,ready}=useSupplierWorkspace();if(!ready)return <p role="status">Değerlendirmeler hazırlanıyor…</p>;return <ReviewsScreen owner={{id:`supplier:${company.id}`,name:workspace.companyName,city:company.city,kind:"supplier"}} scope={`supplier:${company.id}`} eligibleTargets={workspace.stores.filter(s=>s.active).map(s=>({id:`store:${s.id}`,name:s.name,city:s.city,kind:"store"}))}/>;}
