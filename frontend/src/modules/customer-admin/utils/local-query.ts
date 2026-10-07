export function localQueryTarget(href:string,currentHref:string):string|undefined {
 const current=new URL(currentHref),target=new URL(href,current);
 return target.origin===current.origin&&target.pathname===current.pathname ? `${target.pathname}${target.search}${target.hash}`:undefined;
}
export function replaceLocalQuery(href:string){
 const target=localQueryTarget(href,window.location.href);
 if(target===undefined)throw new Error('Local filters must stay on the current route.');
 window.history.replaceState(null,'',target);
}
