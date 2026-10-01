"use client";
import type { ReactNode } from "react";
import { ApplicationForm as Form } from "@/components/forms/application-form";
import { submitApplication } from "@/modules/applications";
export function InfluencerForm({ children, className, id }: { children: ReactNode; className?: string; id?: string }) { return <Form id={id} className={className} submit={values => submitApplication("influencer",values)}>{children}</Form>; }
