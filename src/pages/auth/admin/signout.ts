import type { APIRoute } from 'astro';
import { ADMIN_COOKIE, ADMIN_FLOW_COOKIE } from '../../../lib/admin.mjs';
export const POST: APIRoute = ({url,request,cookies,redirect}) => {
 if(process.env.SIDEWORK_SITE!=='admin' || request.headers.get('origin')!==url.origin) return new Response('Invalid origin',{status:403});
 cookies.delete(ADMIN_COOKIE,{path:'/'});cookies.delete(ADMIN_FLOW_COOKIE,{path:'/auth/admin/'});
 return redirect('/admin/login/',303);
};
