"use client";
import type { ReactNode } from "react";
import { ApplicationForm as Form } from "@/components/forms/application-form";
import { submitApplication } from "@/modules/applications";
export function SupplierForm({ children, className }: { children: ReactNode; className?: string }) { return <Form className={className} submit={values => submitApplication("supplier",values)}>{children}</Form>; }
