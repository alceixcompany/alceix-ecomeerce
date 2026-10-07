"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createSupplierWorkspace } from "../mocks/workspace";
import { isSupplierWorkspace } from "../utils/workspace";
import type { SupplierCompany, SupplierWorkspace } from "../types/supplier-admin";
type WorkspaceContext = { company: SupplierCompany; workspace: SupplierWorkspace; update: (change: (current: SupplierWorkspace) => SupplierWorkspace) => void; notice: string; notify: (message: string) => void; ready: boolean };
const Context = createContext<WorkspaceContext | null>(null);
export function WorkspaceProvider({ company, children }: { company: SupplierCompany; children: React.ReactNode }) {
 const [workspace, setWorkspace] = useState(() => createSupplierWorkspace(company));
 const [notice, notify] = useState("");
 const [ready, setReady] = useState(false);
 const key = `alceix:supplier:${company.id}:workspace:v1`;
 useEffect(() => { try { const raw = localStorage.getItem(key); if(raw) { const saved: unknown = JSON.parse(raw); if(isSupplierWorkspace(saved)) setWorkspace(saved); else notify("Kayıtlı demo verisi okunamadı; örnek çalışma alanı açıldı."); } } catch { notify("Yerel kayıt okunamadı. Bu oturumda çalışmaya devam edebilirsiniz."); } setReady(true); }, [key]);
 useEffect(() => { if(!ready) return; try { localStorage.setItem(key, JSON.stringify(workspace)); } catch { notify("Değişiklikler bu oturumda tutuluyor; tarayıcıya kaydedilemedi."); } }, [workspace, ready, key]);
 return <Context.Provider value={{company, workspace, update:setWorkspace, notice, notify, ready}}>{children}</Context.Provider>;
}
export function useSupplierWorkspace() { const context = useContext(Context); if(!context) throw new Error("Supplier workspace provider is required."); return context; }
