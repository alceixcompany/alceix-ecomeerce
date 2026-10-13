"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "../components/admin-shell";
import type { AdminStore } from "../mocks/dashboard";
import { roleLabels } from "../mocks/collaboration";
import { validEmail } from "../utils/collaboration";
import type { TeamMember } from "../types/collaboration";
import { useAccountProfile } from "../hooks/use-account-profile";
import { useStoreTeam } from "../hooks/use-store-team";
export function AccountScreen({
  store,
  section,
}: {
  store: AdminStore;
  section: "profile" | "team";
}) {
  const profile = useAccountProfile(),
    team = useStoreTeam(store.slug);
  const [draft, setDraft] = useState({
      name: store.account?.name || "",
      email: store.account?.email || "",
      phone: "",
      city: "",
      bio: "",
    }),
    [email, setEmail] = useState(""),
    [role, setRole] = useState<TeamMember["role"]>("editor"),
    [notice, setNotice] = useState(""),
    [remove, setRemove] = useState("");
  useEffect(() => {
    if (profile.ready) setDraft(profile.value);
  }, [profile.ready, profile.value]);
  async function invite() {
    if (!validEmail(email.trim())) {
      team.setError("Geçerli bir e-posta yazın.");
      return;
    }
    if (
      team.value.some(
        (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
      ) ||
      email.trim().toLowerCase() === profile.value.email.toLowerCase()
    ) {
      team.setError("Bu kullanıcı mağazada zaten mevcut veya davet edilmiş.");
      return;
    }
    if (
      await team.save([
        ...team.value,
        {
          id: crypto.randomUUID(),
          name: "Davet edilen kullanıcı",
          email: email.trim().toLowerCase(),
          role,
          status: "invited",
        },
      ])
    ) {
      setEmail("");
      setNotice(
        "Davet bağlantısı hazırlandı. E-posta gönderilmedi; bağlantıyı davet edilen kişiyle paylaşın.",
      );
    }
  }
  const dirty =
    section === "profile" &&
    profile.ready &&
    JSON.stringify(draft) !== JSON.stringify(profile.value);
  useEffect(() => {
    if (!dirty) return;
    const before = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  return (
    <AdminShell
      store={store}
      active={section}
      onNotice={setNotice}
      onNavigate={(event) => {
        if (dirty) {
          event.preventDefault();
          setNotice(
            "Kaydedilmemiş profil değişiklikleri var. Önce kaydedin veya Değişiklikleri Geri Al düğmesini kullanın.",
          );
        }
      }}
    >
      <div className="co-page">
        <header className="co-heading">
          <div>
            <span className="co-eyebrow">HESAP & EKİP · {store.name}</span>
            <h1>
              {section === "profile"
                ? "Kullanıcı Profilim"
                : "Ekip & Mağaza Yetkileri"}
            </h1>
            <p>
              {section === "profile"
                ? "Kişisel bilgilerinizi ve mağazadaki görünümünüzü düzenleyin."
                : "Bir mağazanın operasyonlarını birlikte yönetin; görev ve davetleri tek yerde takip edin."}
            </p>
          </div>
          <span className="co-badge">Hesap & Ekip</span>
        </header>
        {section === "profile" ? (
          <div className="co-grid">
            <section className="co-card">
              <h2>Profil bilgileri</h2>
              <form
                className="co-form"
                inert={profile.pending}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    team.value.some(
                      (m) =>
                        m.role !== "owner" &&
                        m.email.toLowerCase() === draft.email.toLowerCase(),
                    )
                  ) {
                    profile.setError(
                      "Bu e-posta başka bir ekip kaydında kullanılıyor.",
                    );
                    return;
                  }
                  if (await profile.save({ ...draft, name: draft.name.trim() }))
                    setNotice("Profiliniz kaydedildi.");
                }}
              >
                <label>
                  Ad Soyad
                  <input
                    disabled={!profile.ready || profile.pending}
                    required
                    maxLength={100}
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  E-posta
                  <input
                    disabled={!profile.ready || profile.pending}
                    required
                    type="email"
                    readOnly
                    maxLength={254}
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                  />
                </label>
                <label>
                  Telefon
                  <input
                    disabled={!profile.ready || profile.pending}
                    maxLength={30}
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft({ ...draft, phone: e.target.value })
                    }
                  />
                </label>
                <label>
                  Şehir
                  <input
                    disabled={!profile.ready || profile.pending}
                    maxLength={80}
                    value={draft.city}
                    onChange={(e) =>
                      setDraft({ ...draft, city: e.target.value })
                    }
                  />
                </label>
                <label>
                  Hakkımda
                  <textarea
                    disabled={!profile.ready || profile.pending}
                    maxLength={500}
                    rows={4}
                    value={draft.bio}
                    onChange={(e) =>
                      setDraft({ ...draft, bio: e.target.value })
                    }
                  />
                </label>
                {profile.error && (
                  <p className="co-error" role="alert">
                    {profile.error}
                  </p>
                )}
                <div className="co-actions">
                  <button
                    className="ad-button"
                    disabled={!profile.ready || profile.pending}
                  >
                    Profili Kaydet
                  </button>
                  <button
                    className="co-secondary"
                    disabled={!profile.ready || profile.pending}
                    type="button"
                    onClick={() => setDraft(profile.value)}
                  >
                    Değişiklikleri Geri Al
                  </button>
                </div>
              </form>
            </section>
            <aside className="co-card">
              <span className="ad-avatar">
                {draft.name.slice(0, 2).toUpperCase()}
              </span>
              <h2 style={{ marginTop: 20 }}>{draft.name}</h2>
              <p className="co-muted">{draft.city} · Mağaza sahibi</p>
              <p className="co-muted">{draft.bio}</p>
              <div className="co-demo">
                Profil bilgileriniz hesabınıza kaydedilir. Giriş e-postası
                güvenlik nedeniyle bu formdan değiştirilemez.
              </div>
            </aside>
          </div>
        ) : (
          <>
            <div className="co-grid">
              <section className="co-card">
                <h2>Ekip Arkadaşı Davet Et</h2>
                <p className="co-muted">
                  Davet edilecek kişinin e-posta adresini ve görevini
                  belirleyin.
                </p>
                <form
                  className="co-form"
                  inert={!team.ready}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void invite();
                  }}
                >
                  <label>
                    E-posta adresi
                    <input
                      type="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ekip@example.com"
                    />
                  </label>
                  <label>
                    Görev
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as TeamMember["role"])
                      }
                    >
                      {(["editor", "support", "viewer"] as const).map((r) => (
                        <option key={r} value={r}>
                          {roleLabels[r]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="ad-button"
                    disabled={!team.ready || team.value.length >= 50}
                  >
                    Davet Bağlantısı Hazırla
                  </button>
                </form>
              </section>
              <aside className="co-card">
                <h2>Görev kapsamları</h2>
                <p className="co-muted">
                  <b>Ürün & Operasyon:</b> ürün, stok ve mağaza ayarları.
                </p>
                <p className="co-muted">
                  <b>Müşteri Desteği:</b> CRM kayıtları ve destek talepleri.
                </p>
                <p className="co-muted">
                  <b>Görüntüleyici:</b> raporları ve kayıtları inceleme.
                </p>
                <div className="co-demo">
                  Yetkiler sunucuda kontrol edilir. Davet bağlantısı 7 gün
                  geçerlidir; davet edilen e-posta adresindeki hesapla kabul
                  edilir. E-posta gönderimi henüz bağlı değil.
                </div>
              </aside>
            </div>
            <section className="co-card">
              <h2>{team.value.length} Ekip Kaydı</h2>
              {team.invitation && (
                <div className="co-success">
                  <p>
                    Davet bağlantısı yalnızca bu ekranda gösterilir. E-posta
                    gönderilmedi.
                  </p>
                  <input
                    aria-label="Davet bağlantısı"
                    readOnly
                    value={team.invitation}
                  />
                  <button
                    className="co-secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(team.invitation);
                        setNotice("Davet bağlantısı kopyalandı.");
                      } catch {
                        setNotice("Bağlantıyı alandan kopyalayabilirsiniz.");
                      }
                    }}
                  >
                    Bağlantıyı Kopyala
                  </button>
                </div>
              )}
              {team.error && (
                <p className="co-error" role="alert">
                  {team.error}
                </p>
              )}
              <div className="co-table-scroll">
                <table className="co-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı</th>
                      <th>Görev</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.value.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <b>
                            {m.role === "owner" ? profile.value.name : m.name}
                          </b>
                          <br />
                          {m.role === "owner" ? profile.value.email : m.email}
                        </td>
                        <td>
                          {m.role === "owner" ? (
                            roleLabels.owner
                          ) : (
                            <select
                              aria-label={`${m.email} görevi`}
                              value={m.role}
                              onChange={(e) =>
                                team.save(
                                  team.value.map((t) =>
                                    t.id === m.id
                                      ? {
                                          ...t,
                                          role: e.target
                                            .value as TeamMember["role"],
                                        }
                                      : t,
                                  ),
                                )
                              }
                            >
                              {(["editor", "support", "viewer"] as const).map(
                                (r) => (
                                  <option key={r} value={r}>
                                    {roleLabels[r]}
                                  </option>
                                ),
                              )}
                            </select>
                          )}
                        </td>
                        <td>
                          <span className="co-badge">
                            {m.status === "active"
                              ? "Aktif"
                              : "Davet Hazırlandı"}
                          </span>
                        </td>
                        <td>
                          {m.role !== "owner" && (
                            <div className="co-actions">
                              {m.status === "invited" && (
                                <span>
                                  Davet bağlantısıyla kabul bekleniyor.
                                </span>
                              )}
                              <button
                                className="co-secondary"
                                onClick={() => setRemove(m.id)}
                              >
                                {m.status === "invited"
                                  ? "Daveti İptal Et"
                                  : "Ekipten Kaldır"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {remove && (
                <div className="co-error">
                  <p>Bu davet ve ekip kaydı kaldırılacak.</p>
                  <div className="co-actions">
                    <button
                      className="co-secondary"
                      onClick={() => setRemove("")}
                    >
                      Vazgeç
                    </button>
                    <button
                      className="co-secondary"
                      onClick={async () => {
                        if (
                          await team.save(
                            team.value
                              .filter(
                                (m) => m.id !== remove && m.role !== "owner",
                              )
                              .concat(
                                team.value.filter((m) => m.role === "owner"),
                              ),
                          )
                        ) {
                          setRemove("");
                          setNotice("Davet kaldırıldı.");
                        }
                      }}
                    >
                      Kaldırmayı Onayla
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        {notice && (
          <p className="co-success" role="status">
            {notice}
          </p>
        )}
      </div>
    </AdminShell>
  );
}
