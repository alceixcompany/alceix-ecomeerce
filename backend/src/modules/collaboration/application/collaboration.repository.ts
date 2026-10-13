import type {
  Link,
  Message,
  Offer,
  Campaign,
  CampaignApplication,
} from "../domain/collaboration";
import type { PageQuery } from "../../../shared/page";
export const COLLABORATION = Symbol("COLLABORATION");
export interface CollaborationRepository {
  ownApplications(
    partnerId: string,
    query: PageQuery,
  ): Promise<{
    items: CampaignApplication[];
    total: number;
    page: number;
    pages: number;
  }>;
  activeOffers(linkId: string): Promise<number>;
  link(id: string): Promise<Link | null>;
  pair(storeId: string, partnerId: string): Promise<Link | null>;
  createLink(link: Link): Promise<void>;
  saveLink(link: Link, version: number): Promise<Link | null>;
  links(
    scope: { storeId?: string; partnerId?: string },
    query: PageQuery,
  ): Promise<{ items: Link[]; total: number; page: number; pages: number }>;
  message(id: string): Promise<Message | null>;
  append(message: Message): Promise<void>;
  messages(
    linkId: string,
    query: PageQuery,
  ): Promise<{ items: Message[]; total: number; page: number; pages: number }>;
  offer(id: string): Promise<Offer | null>;
  createOffer(offer: Offer): Promise<void>;
  saveOffer(offer: Offer, version: number): Promise<Offer | null>;
  offers(
    linkId: string,
    query: PageQuery,
  ): Promise<{ items: Offer[]; total: number; page: number; pages: number }>;
  campaign(id: string): Promise<Campaign | null>;
  createCampaign(campaign: Campaign): Promise<void>;
  saveCampaign(campaign: Campaign, version: number): Promise<Campaign | null>;
  campaigns(
    storeId: string | undefined,
    query: PageQuery,
    publicOnly: boolean,
  ): Promise<{ items: Campaign[]; total: number; page: number; pages: number }>;
  application(id: string): Promise<CampaignApplication | null>;
  pairApplication(
    campaignId: string,
    partnerId: string,
  ): Promise<CampaignApplication | null>;
  createApplication(application: CampaignApplication): Promise<void>;
  saveApplication(
    application: CampaignApplication,
    version: number,
  ): Promise<CampaignApplication | null>;
  applications(
    campaignId: string,
    query: PageQuery,
  ): Promise<{
    items: CampaignApplication[];
    total: number;
    page: number;
    pages: number;
  }>;
}
