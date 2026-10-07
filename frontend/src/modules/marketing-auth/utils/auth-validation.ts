export function referralIssue(value:string):string {
 const code=value.trim();
 return code&&!/^[A-Za-z0-9][A-Za-z0-9-]{2,31}$/.test(code)?'Referans kodu 3–32 karakter olmalı; yalnızca harf, rakam ve tire kullanılabilir.':'';
}
export function recoveryEmailIssue(value:string):string {
 return value.trim().length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())?'':'Geçerli bir e-posta adresi girin.';
}
