import type { APIRoute } from 'astro';
import { adminConfiguration, beginAdminLogin, ADMIN_FLOW_COOKIE } from '../../../lib/admin.mjs';
export const POST: APIRoute = ({request,url,cookies,redirect}) => {
 const config=adminConfiguration();
 if(process.env.SIDEWORK_SITE!=='admin' || !config.ready || url.origin!==config.origin) return new Response('Unavailable',{status:503});
 if(request.headers.get('origin')!==url.origin) return new Response('Invalid origin',{status:403});
 const flow=beginAdminLogin(config);
 cookies.set(ADMIN_FLOW_COOKIE,flow.cookie,{httpOnly:true,secure:url.protocol==='https:',sameSite:'lax',path:'/auth/admin/',maxAge:600});
 return redirect(`${config.mainOrigin}/admin/connect/?${new URLSearchParams({state:flow.state,challenge:flow.challenge})}`,303);
};
