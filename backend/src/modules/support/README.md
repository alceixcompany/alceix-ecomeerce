# Support

`SupportService` owns ticket, reply, status and per-user draft behavior. `SupportRepository` abstracts MongoDB. `AttachmentsService` uses file metadata/storage ports and the exported image processor. HTTP controllers validate strict input and store capabilities; platform access goes through the guarded platform module.

Ticket messages are capped at 100. UUID message IDs prevent duplicate replies and reject different replay payloads. Version CAS prevents lost writes. A matching actor draft is cleared in the same transaction as the reply; a different draft remains and revisions never reset.

New messages persist the authenticated `actorId`; a retry must match that user, author type, text and attachment IDs. Actor IDs stay out of HTTP responses. Legacy messages without actor identity remain readable, but replay returns a conflict rather than guessing ownership. A failed draft refresh after a committed reply does not turn the write into a failure; the UI invalidates the draft revision and reloads it before allowing another write.

Attachments are private; three files per reply, 2 MB each. Images become normalized WebP, text is checked UTF-8, PDF signature/EOF is checked. Platform download additionally requires the file to belong to that platform-channel ticket. New unclaimed uploads have opt-in bounded cleanup; retained/legacy files remain. External malware scanning requires a provider adapter.

Partner controllers use the same exported ticket/file use cases with verified partner capability; scopeKind identifies partner vs store while the legacy storeId column keeps the scope UUID. Root partner replies/downloads verify parent/ticket linkage. Buyer controllers restrict customer tickets to their own order. Assignment/private notes are root support operations and stay private.

Current contracts: [13 October report](../../../docs/implementation-review-2026-10-13.md).
