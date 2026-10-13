# Orders

Ortak perakende sipariş kaynağı: store capability ve authenticated buyer ownership. Strict DTO → application/snapshot/reservation → persistence. Değişmez actor/store requestId ve CAS; variant ID/SKU/fiyat snapshot'ı, stock/kupon transaction'ları. Held/consumed/released reservation, preparing/cancelled/shipped/delivered, pending/paid/refunded ve finans durumu ayrı tutulur.

Commerce modülü provider tahsilat/ret/kargo/iade/maturity işlemlerini OrdersService üzerinden yürütür. Geç capture iptal edilmiş siparişi yeniden satışa çevirmez; refund telafisi gerekir. 30 dakika rezervasyon + bounded sweeper. Daily satış UTC application-payment-confirmation üzerinden 1–90 gün; tarih bilinmeyen legacy kayıt uydurulmaz. Public buyer view private not/actor/commission bilgisi taşımaz.

Tam akış/sınırlar ve frontend boşlukları: [13 Ekim raporu](../../../docs/implementation-review-2026-10-13.md), [005 karar](../../../docs/decisions/005-commerce-and-provider-boundaries.md).
