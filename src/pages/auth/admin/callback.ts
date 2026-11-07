import type { APIRoute } from 'astro';
import { adminConfiguration, readAdminFlow, consumeAdminTicket, createAdminSession, isAdminOwner, ADMIN_COOKIE, ADMIN_FLOW_COOKIE, ADMIN_SECONDS } from '../../../lib/admin.mjs';
import { authConfiguration } from '../../../lib/github-auth.mjs';
import { accountDatabase } from '../../../lib/firestore.mjs';
import { accountStore } from '../../../lib/accounts.mjs';
export const GET: APIRoute = async ({url,cookies,redirect}) => {
 const config=adminConfiguration();
 if(process.env.SIDEWORK_SITE!=='admin' || !config.ready || url.origin!==config.origin) return new Response('Unavailable',{status:503});
 const flow=readAdminFlow(cookies.get(ADMIN_FLOW_COOKIE)?.value,url.searchParams.get('state'),config);
 cookies.delete(ADMIN_FLOW_COOKIE,{path:'/auth/admin/'});
 if(!flow) return redirect('/admin/login/?error=expired',303);
 try {
  const dbConfig=authConfiguration();
  const id=await consumeAdminTicket(url.searchParams.get('code'),flow,config,accountDatabase(dbConfig));
  if(!id) return redirect('/admin/login/?error=expired',303);
  const account=await accountStore(dbConfig).find(id);
  if(!isAdminOwner(account,config)) return new Response('Owner access required.',{status:403});
  cookies.set(ADMIN_COOKIE,createAdminSession(account,config),{httpOnly:true,secure:url.protocol==='https:',sameSite:'lax',path:'/',maxAge:ADMIN_SECONDS});
  return redirect('/',303);
 } catch { return redirect('/admin/login/?error=unavailable',303); }
};
