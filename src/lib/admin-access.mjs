import { ADMIN_COOKIE, isAdminOwner, readAdminSession } from './admin.mjs';
import { readForm } from './github-auth.mjs';

const accessStatuses = ['approved', 'waiting'];
const formFields = ['github_id', 'status', 'expected_status'];

function accessRedirect(result) {
  return new Response(null, { status: 303, headers: { Location: `/?access=${result}` } });
}

export async function handleAdminAccess({ request, url, locals, cookies }, { site, config, getDatabase }) {
  if (site !== 'admin') return new Response('Not found', { status: 404 });
  if (!config.ready) return new Response('Admin access is unavailable.', { status: 503 });
  if (url.origin !== config.origin || request.headers.get('origin') !== config.origin) {
    return new Response('Invalid origin', { status: 403 });
  }

  const session = readAdminSession(cookies.get(ADMIN_COOKIE)?.value, config);
  if (!session) return new Response('Sign in again.', { status: 401 });
  if (!isAdminOwner(locals.account, config)) return new Response('Owner access required.', { status: 403 });

  let form;
  try { form = await readForm(request); }
  catch { return new Response('Invalid access change.', { status: 400 }); }
  const [targetId, status, expectedStatus] = formFields.map(field => form.get(field));
  if (form.size !== formFields.length || formFields.some(field => form.getAll(field).length !== 1)
    || !/^[1-9]\d{0,19}$/.test(targetId) || !accessStatuses.includes(status) || !accessStatuses.includes(expectedStatus)) {
    return new Response('Invalid access change.', { status: 400 });
  }
  if (targetId === session.sub) return new Response('Owner access cannot change.', { status: 403 });

  try {
    const database = getDatabase();
    const accounts = database.collection('sidework_accounts');
    const ownerRef = accounts.doc(session.sub);
    const targetRef = accounts.doc(targetId);
    const eventRef = database.collection('sidework_access_events').doc();
    const result = await database.runTransaction(async transaction => {
      const owner = await transaction.get(ownerRef);
      if (!owner.exists || !isAdminOwner(owner.data(), config)) return 'denied';

      const target = await transaction.get(targetRef);
      const account = target.exists ? target.data() : null;
      if (account?.github_id !== targetId || account.status !== expectedStatus || account.status === status) return 'conflict';

      transaction.update(targetRef, { status });
      transaction.create(eventRef, {
        actor_github_id: session.sub,
        target_github_id: targetId,
        before_status: account.status,
        after_status: status,
        changed_at: new Date().toISOString(),
      });
      return 'updated';
    });
    if (result === 'denied') return new Response('Owner access required.', { status: 403 });
    return accessRedirect(result);
  } catch {
    return accessRedirect('unavailable');
  }
}
