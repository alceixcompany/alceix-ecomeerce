export type ReviewKind='store'|'supplier'|'creator';
export type ReviewEntity={id:string;name:string;kind:ReviewKind;city:string};
export type Review={id:string;target:ReviewEntity;author:ReviewEntity;rating:number;body:string;createdAt:string;reply:string;reported:boolean};
