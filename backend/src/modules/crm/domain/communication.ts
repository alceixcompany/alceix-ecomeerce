export type CommunicationInput = {
  kind: "campaign" | "email";
  segment: "all" | "vip" | "new" | "cart" | "inactive";
  subject: string;
  message: string;
};
export type CommunicationDraft = CommunicationInput & {
  id: string;
  storeId: string;
  requestId: string;
  initialInput?: CommunicationInput;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};
export const communicationView = ({
  storeId: _store,
  requestId: _request,
  initialInput: _initial,
  ...draft
}: CommunicationDraft) => draft;
