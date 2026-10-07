export type {Creator,CreatorPortfolio} from "@/modules/creator-directory";
export type CampaignStatus = 'pending' | 'approved' | 'shipped' | 'completed' | 'cancelled';
export type Campaign = {
  id: string; creatorId: string; name: string; kind: 'gift' | 'paid'; productId: string;
  quantity: number; fee: number; commission: number; brief: string; status: CampaignStatus; createdAt: string;
};
