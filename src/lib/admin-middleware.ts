import type { APIContext } from 'astro';
import { adminConfiguration, ADMIN_COOKIE, readAdminSession, isAdminOwner } from './admin.mjs';
import { accountStore } from './accounts.mjs';
import { authConfiguration } from './github-auth.mjs';
export async function adminRequest(context: APIContext, next: () => Promise<Response>) {
 const config=adminConfiguration();
 const path=context.url.pathname.replace(/\/+$/,'') || '/';
 if(!config.ready || context.url.origin!==config.origin) return new Response('Admin is not available on this address.',{status:503});
 if(['/admin/login','/auth/admin/start','/auth/admin/callback','/auth/admin/signout'].includes(path)) return next();
 if(!['/','/admin'].includes(path)) return new Response('Not found',{status:404});
 const session=readAdminSession(context.cookies.get(ADMIN_COOKIE)?.value,config);
 if(!session) return context.redirect('/admin/login/',303);
 try {
  const account=await accountStore(authConfiguration()).find(session.sub);
  if(!isAdminOwner(account,config)) return new Response('Owner access required.',{status:403});
  context.locals.account=account;
  context.locals.hasAccess=true;
 } catch { return new Response('Account access is unavailable. Please try again.',{status:503}); }
 return path==='/' ? context.rewrite(`/admin/${context.url.search}`) : next();
}
