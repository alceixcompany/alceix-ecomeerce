export type ReplyDraft = {
  storeId: string;
  ticketId: string;
  userId: string;
  text: string;
  attachmentIds: string[];
  version: number;
  updatedAt: Date;
};
