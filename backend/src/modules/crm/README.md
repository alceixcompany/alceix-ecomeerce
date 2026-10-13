# CRM

Store-scoped customer, rules and communication draft use cases. `CrmService` owns behavior, `CrmRepository` is the persistence port; the HTTP controller validates strict Zod DTOs and requests explicit crm-read/write store capabilities. Domain values are framework-free.

Unique normalized email per store; version CAS for updates/rules. Literal search and bounded stable pages. Order metrics project real captures/refunds with source revisions; verified authenticated carts project consent-aware abandonment input. No metric is invented. Communication create uses a store/request UUID unique index and checks payload equality; update uses version. Audience and send workers additionally require matching verified identity/current consent; previews remain bounded. Drafts do not send or enqueue messages.

Creation retries compare immutable `initialInput`, not the editable fields, and return the current draft without reverting edits. `initialInput` stays private. For legacy drafts, the first update captures the then-current input atomically; already-lost historical input cannot be reconstructed.

NotificationsModule owns durable send batches, delivery proof, unsubscribe and abandonment jobs; creating a CRM draft still does not send. Current contracts and limits: [13 October report](../../../docs/implementation-review-2026-10-13.md).
