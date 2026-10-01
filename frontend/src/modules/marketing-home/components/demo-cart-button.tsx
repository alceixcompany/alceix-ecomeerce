"use client";
import { useState } from "react";
export function DemoCartButton({ className }: { className?: string }) {
 const [isAdded, setIsAdded] = useState(false);
 return <button type="button" className={className} onClick={() => setIsAdded(!isAdded)} aria-pressed={isAdded}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">{isAdded ? "check_circle" : "shopping_bag"}</span><span aria-live="polite">{isAdded ? "Demo sepetine eklendi" : "Sepete Ekle • 3 Taksit İmkanı"}</span></button>;
}
