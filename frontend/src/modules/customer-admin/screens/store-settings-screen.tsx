"use client";
import {useState} from "react";
import {ProfileEditor} from "@/modules/admin-editors";
import {storeRoutes} from "@/config/store-routes";
import {AdminShell} from "../components/admin-shell";
import {initialSettings} from "../mocks/settings";
import type {AdminStore} from "../mocks/dashboard";
export function StoreSettingsScreen({store}:{store:AdminStore}) {const [name,setName]=useState(store.name);const [notice,setNotice]=useState("");return <AdminShell store={store} storeName={name} active="settings" onNotice={setNotice}><ProfileEditor store={store} initial={initialSettings(store)} storageKey={`alceix:store-settings:${store.slug}`} catalogUrl={storeRoutes.storefront(store.storefrontSlug)} onPersist={profile=>setName(profile.name)}/>{notice&&<p role="status">{notice}</p>}</AdminShell>;}
