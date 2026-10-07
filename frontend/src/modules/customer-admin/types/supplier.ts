export type Supplier={id:string;name:string;initials:string;city:string;category:string;rating:number;reviews:number;shippingHours:number;tags:string[];description:string};
export type SupplierProduct={id:string;supplierId:string;name:string;category:string;description:string;sku:string;costCents:number;stock:number;sizes:string[];colors:string[];images:string[];material:string;weight:string};
export type SupplierSettings={markup:number;packaging:boolean;protocol:"api"|"xml";endpoint:string;autoSync:boolean;interval:number};
