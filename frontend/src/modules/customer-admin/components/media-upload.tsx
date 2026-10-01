"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { uploadMedia } from "../services/admin-api";
import { errorMessage } from "@/lib/http";
export function MediaUpload({ label, defaultImage, kind, onChange, storeSlug, onPending }: { storeSlug: string; onPending: (pending: boolean)=>void; label: string; defaultImage: string; kind: "banner" | "logo" | "favicon"; onChange: (src: string) => void }) {
  const [image, setImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isUploading,setIsUploading]=useState(false);
  const input = useRef<HTMLInputElement>(null);
  return <div className={`as-media as-media-${kind}`}><label htmlFor={`settings-${kind}`}>{label}</label><div className="as-media-preview"><Image src={image || defaultImage} alt={label} width={kind === "banner" ? 900 : 100} height={kind === "banner" ? 300 : 100} unoptimized={!!image} /><div><strong>{fileName || (kind === "banner" ? "Mağaza kapak görseli" : kind === "logo" ? "alceix-logo.webp" : "Mağaza simgesi")}</strong><small>{image ? "Sunucuya yüklendi" : "Mağaza görseli"}</small><button type="button" disabled={isUploading} onClick={() => input.current?.click()}>Görseli Değiştir</button>{(image || defaultImage.startsWith("/api/v1/media/")) && <button className="as-media-remove" type="button" onClick={() => {setImage("");setFileName("");onChange("");}}>Kaldır</button>}</div></div><input ref={input} id={`settings-${kind}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={isUploading} onChange={async event => {const inputElement=event.currentTarget; const file=event.target.files?.[0]; if(!file) return; if(!["image/png","image/jpeg","image/webp"].includes(file.type) || file.size > 4*1024*1024) {setError("PNG, JPG veya WebP seçin. En fazla 4 MB yükleyebilirsiniz.");event.target.value="";return;} setError("");setIsUploading(true);onPending(true);try{const result=await uploadMedia(storeSlug,file,kind);setImage(result.url);setFileName(file.name);onChange(result.url);}catch(error){setError(errorMessage(error));}finally{setIsUploading(false);onPending(false);inputElement.value="";}}} aria-describedby={error ? `error-${kind}` : undefined}/>{error && <p role="alert" id={`error-${kind}`} className="as-error">{error}</p>}</div>;
}
