import type { APIContext } from 'astro';
import { adminConfiguration, ADMIN_COOKIE, ADMIN_SECONDS, createAdminSession, readAdminSession, isAdminOwner } from './admin.mjs';
import { accountStore } from './accounts.mjs';
import { authConfiguration } from './github-auth.mjs';
export async function adminRequest(context: APIContext, next: () => Promise<Response>) {
 const config=adminConfiguration();
 const path=context.url.pathname.replace(/\/+$/,'') || '/';
 if(!config.ready || context.url.origin!==config.origin) return new Response('Admin is not available on this address.',{status:503});
 if(['/auth/admin/start','/auth/admin/callback','/auth/admin/signout'].includes(path)) return next();
 if(!['/','/admin','/admin/access','/admin/login'].includes(path)) return new Response('Not found',{status:404});
 const session=readAdminSession(context.cookies.get(ADMIN_COOKIE)?.value,config);
 if(path==='/admin/login' && !session) return next();
 if(!session) return context.redirect('/admin/login/',303);
 try {
  const account=await accountStore(authConfiguration()).find(session.sub);
  if(!isAdminOwner(account,config)) return new Response('Owner access required.',{status:403});
  if(session.exp-Math.floor(Date.now()/1000)<ADMIN_SECONDS/2) context.cookies.set(ADMIN_COOKIE,createAdminSession(account,config),{httpOnly:true,secure:context.url.protocol==='https:',sameSite:'lax',path:'/',maxAge:ADMIN_SECONDS});
  context.locals.account=account;
  context.locals.hasAccess=true;
 } catch { return new Response('Account access is unavailable. Please try again.',{status:503}); }
 if(path==='/admin/login') return context.redirect('/',303);
 return path==='/' ? context.rewrite(`/admin/${context.url.search}`) : next();
}
