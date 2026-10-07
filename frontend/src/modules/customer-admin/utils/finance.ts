export function normalizeIban(value: string): string { return value.replace(/\s/g, "").toUpperCase(); }
export function isValidTurkishIban(value: string): boolean {
  const iban=normalizeIban(value);
  if(!/^TR\d{24}$/.test(iban)) return false;
  const rearranged=iban.slice(4)+iban.slice(0,4);
  const digits=rearranged.replace(/[A-Z]/g,letter=>String(letter.charCodeAt(0)-55));
  let remainder=0;for(const digit of digits) remainder=(remainder*10+Number(digit))%97;
  return remainder===1;
}
export function formatIban(value: string): string {return normalizeIban(value).replace(/(.{4})/g,"$1 ").trim();}
export function maskIban(value: string): string {const iban=normalizeIban(value);return `${iban.slice(0,8)} •••• •••• •••• ${iban.slice(-6)}`;}
export function commissionFor(cents:number):number {return Math.round(cents*3/100);}
