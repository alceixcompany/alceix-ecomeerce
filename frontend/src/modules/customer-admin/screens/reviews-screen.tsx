"use client";
import {useState} from "react";
import {ReviewsScreen} from "@/modules/reviews";
import {AdminShell} from "../components/admin-shell";
import type {AdminStore} from "../mocks/dashboard";
export function CustomerReviews({store}:{store:AdminStore}){const [notice,setNotice]=useState("");return <AdminShell store={store} active="reviews" onNotice={setNotice}><ReviewsScreen owner={{id:`store:${store.slug}`,name:store.name,kind:"store",city:"İstanbul"}} scope={`store:${store.slug}`}/>{notice&&<p role="status">{notice}</p>}</AdminShell>;}
