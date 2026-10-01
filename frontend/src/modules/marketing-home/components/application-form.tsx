"use client";
import type { ReactNode } from "react";
import { ApplicationForm as Form } from "@/components/forms/application-form";
import { submitApplication } from "@/modules/applications";
export function ApplicationForm({ children, className, type }: { children: ReactNode; className?: string; type: "supplier"|"influencer" }) { return <Form className={className} submit={values => submitApplication(type,values)}>{children}</Form>; }
