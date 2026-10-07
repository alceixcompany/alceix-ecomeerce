"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
export function MediaUpload({ label, defaultImage, kind, onChange }: { label: string; defaultImage: string; kind: "banner" | "logo" | "favicon"; onChange: (src: string) => void }) {
  const [image, setImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if(image) URL.revokeObjectURL(image); }, [image]);
  return <div className={`as-media as-media-${kind}`}><label htmlFor={`settings-${kind}`}>{label}</label><div className="as-media-preview"><Image src={image || defaultImage} alt={label} width={kind === "banner" ? 900 : 100} height={kind === "banner" ? 300 : 100} unoptimized={!!image} /><div><strong>{fileName || (kind === "banner" ? "Mağaza kapak görseli" : kind === "logo" ? "alceix-logo.webp" : "Mağaza simgesi")}</strong><small>{image ? "Bu oturumda önizleniyor" : "Örnek mağaza görseli"}</small><button type="button" onClick={() => input.current?.click()}>Görseli Değiştir</button>{image && <button className="as-media-remove" type="button" onClick={() => {setImage("");setFileName("");onChange(defaultImage);}}>Kaldır</button>}</div></div><input ref={input} id={`settings-${kind}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => {const file=event.target.files?.[0]; if(!file) return; if(!["image/png","image/jpeg","image/webp"].includes(file.type) || file.size > 4*1024*1024) {setError("PNG, JPG veya WebP seçin. En fazla 4 MB yükleyebilirsiniz.");event.target.value="";return;} setError("");const src=URL.createObjectURL(file);setImage(src);setFileName(file.name);onChange(src);}} aria-describedby={error ? `error-${kind}` : undefined}/>{error && <p role="alert" id={`error-${kind}`} className="as-error">{error}</p>}</div>;
}
