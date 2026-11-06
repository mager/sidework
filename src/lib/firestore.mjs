import { Firestore } from '@google-cloud/firestore';
import { IdentityPoolClient } from 'google-auth-library';
import { getVercelOidcToken } from '@vercel/oidc';

const clients = new Map();
export function accountDatabase(config) {
  const { projectId, projectNumber, serviceAccountEmail, poolId, providerId } = config;
  if (![projectId, projectNumber, serviceAccountEmail, poolId, providerId].every(Boolean)) throw new Error('Account database unavailable');
  const key = JSON.stringify([projectId, projectNumber, serviceAccountEmail, poolId, providerId]);
  if (!clients.has(key)) {
    const authClient = new IdentityPoolClient({
      type: 'external_account',
      audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
      scopes: ['https://www.googleapis.com/auth/datastore'],
    });
    clients.set(key, new Firestore({ projectId, authClient, preferRest: true }));
  }
  return clients.get(key);
}
