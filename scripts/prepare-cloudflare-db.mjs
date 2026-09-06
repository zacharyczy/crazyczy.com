// Resolve the production D1 binding without changing the local Sites manifest.
import fs from 'node:fs/promises';

export async function prepareDatabase({ configPath = 'dist/server/wrangler.json', accountId = process.env.CLOUDFLARE_ACCOUNT_ID, token = process.env.CLOUDFLARE_API_TOKEN, request = fetch } = {}) {
  if (!accountId || !token) throw new Error('Cloudflare deployment credentials are unavailable.');
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  const binding = config.d1_databases?.find(item => item.binding === 'DB');
  if (!binding) throw new Error('The built application is missing its DB binding.');
  if (config.name !== 'crazyczy') throw new Error('Unexpected Worker; refusing to change another site.');
  async function api(route, method = 'GET', body) {
    const response = await request(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/${route}`, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      const details = (data.errors ?? []).map(error => `${error.code}: ${error.message}`).join('; ').replaceAll(token, '[redacted]');
      throw new Error(`Cloudflare ${response.status}: ${details}`);
    }
    return data.result;
  }
  const settings = await api('workers/scripts/crazyczy/settings');
  let databaseId = settings.bindings?.find(item => item.type === 'd1' && item.name === 'DB')?.id;
  const name = 'crazyczy-suggestions';
  if (!databaseId) {
    const databases = await api(`d1/database?name=${name}`);
    const matches = databases.filter(database => database.name === name);
    if (matches.length > 1) throw new Error('Multiple matching production databases; refusing to guess.');
    databaseId = matches[0]?.uuid;
    if (!databaseId) databaseId = (await api('d1/database', 'POST', { name })).uuid;
  }
  if (!databaseId || databaseId === '00000000-0000-4000-8000-000000000000') throw new Error('Production database could not be resolved.');
  Object.assign(binding, { database_id: databaseId, database_name: name, migrations_dir: '../../drizzle' });
  await fs.writeFile(configPath, JSON.stringify(config));
  console.log('Production suggestions database is ready.');
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/prepare-cloudflare-db.mjs')) await prepareDatabase();
