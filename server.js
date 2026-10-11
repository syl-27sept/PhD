import http from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT || 3001);
const DEFAULT_OWNER_KEY = 'single-owner';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const HAS_SERVER_DB_CONFIG = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

function readLocalStorage(key, fallback) {
  try {
    const filePath = `./.local-storage/${key}.json`;
    const value = readFileSync(filePath, 'utf8');
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorage(key, value) {
  try {
    const dir = './.local-storage';
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/${key}.json`, JSON.stringify(value, null, 2));
  } catch (error) {
    console.error(`Could not write local backup for ${key}:`, error);
  }
}

function asJson(data) {
  return JSON.stringify(data);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  response.end(asJson(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function normalizeMeeting(meeting) {
  return {
    id: meeting?.id || `meeting-${randomUUID()}`,
    title: meeting?.title || 'Untitled meeting',
    date: meeting?.date || '',
    time: meeting?.time || '',
    supervisor_name: meeting?.supervisor_name || '',
    agenda: meeting?.agenda || '',
    notes: meeting?.notes || '',
    decisions: meeting?.decisions || '',
    action_items: meeting?.action_items || '',
    attachments: Array.isArray(meeting?.attachments) ? meeting.attachments : [],
    created_at: meeting?.created_at || new Date().toISOString(),
    updated_at: meeting?.updated_at || new Date().toISOString(),
    owner_key: DEFAULT_OWNER_KEY
  };
}

function normalizeRoadmapPayload(payload) {
  return Array.isArray(payload) ? payload : [];
}

async function fetchSupabase(table, method, payload) {
  if (!HAS_SERVER_DB_CONFIG) {
    return null;
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/${table}`;
  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  let response;
  if (method === 'GET') {
    response = await fetch(`${endpoint}?select=*`, {
      method: 'GET',
      headers
    });
  } else {
    response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(payload)
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  return response.headers.get('content-type')?.includes('application/json') ? response.json() : null;
}

async function handleMeetings(method, payload) {
  const fallback = readLocalStorage('silvia-phd-meetings', [
    { id: 'm-1', title: 'Research supervision check-in', date: '2026-10-18', agenda: 'Discuss methodology and chapter outline' },
    { id: 'm-2', title: 'Progress review', date: '2026-11-02', agenda: 'Review literature and next milestones' }
  ]);

  if (!HAS_SERVER_DB_CONFIG) {
    if (method === 'GET') {
      return fallback;
    }

    writeLocalStorage('silvia-phd-meetings', payload || fallback);
    return payload || fallback;
  }

  if (method === 'GET') {
    const data = await fetchSupabase('meetings', 'GET');
    const rows = Array.isArray(data) ? data.map((item) => ({
      ...item,
      id: item.id || `meeting-${randomUUID()}`
    })) : fallback;
    writeLocalStorage('silvia-phd-meetings', rows);
    return rows;
  }

  const rows = Array.isArray(payload) ? payload.map(normalizeMeeting) : [];
  await fetchSupabase('meetings', 'PUT', rows.map((row) => ({
    ...row,
    owner_key: DEFAULT_OWNER_KEY,
    updated_at: new Date().toISOString()
  })));
  writeLocalStorage('silvia-phd-meetings', rows);
  return rows;
}

async function handleRoadmap(method, payload) {
  const fallback = readLocalStorage('silvia-phd-roadmap', [
    {
      id: 1,
      year: 'Year 1',
      title: 'Foundation & Exploration',
      weight: 1,
      goals: [
        {
          id: 'g101',
          title: 'Establish the research foundations',
          description: 'Define the research problem and theoretical foundations.',
          weight: 3,
          milestones: [
            {
              id: 101,
              name: 'Complete PhD induction and training',
              weight: 1,
              criteria: 'Required induction and training activities completed.',
              evidence: '',
              due_date: '',
              completed: false,
              tasks: []
            }
          ]
        }
      ]
    }
  ]);

  if (!HAS_SERVER_DB_CONFIG) {
    if (method === 'GET') {
      return fallback;
    }

    writeLocalStorage('silvia-phd-roadmap', payload || fallback);
    return payload || fallback;
  }

  if (method === 'GET') {
    const data = await fetchSupabase('roadmap', 'GET');
    const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const value = row?.data ? normalizeRoadmapPayload(row.data) : fallback;
    writeLocalStorage('silvia-phd-roadmap', value);
    return value;
  }

  const value = normalizeRoadmapPayload(payload);
  await fetchSupabase('roadmap', 'PUT', [{
    id: 'default',
    owner_key: DEFAULT_OWNER_KEY,
    name: 'phd-roadmap',
    data: value,
    updated_at: new Date().toISOString()
  }]);
  writeLocalStorage('silvia-phd-roadmap', value);
  return value;
}

const server = http.createServer(async (request, response) => {
  const { method = 'GET', url = '/' } = request;

  if (method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      mode: HAS_SERVER_DB_CONFIG ? 'supabase' : 'local-fallback',
      hasServiceRoleKey: Boolean(SUPABASE_SERVICE_ROLE_KEY)
    });
    return;
  }

  if (url === '/api/meetings') {
    try {
      if (method === 'GET') {
        const data = await handleMeetings('GET', null);
        sendJson(response, 200, data);
      } else if (method === 'PUT') {
        const payload = await readRequestBody(request);
        const data = await handleMeetings('PUT', payload);
        sendJson(response, 200, data);
      } else {
        sendJson(response, 405, { error: 'Method not allowed' });
      }
    } catch (error) {
      sendJson(response, 500, { error: error.message || 'Meeting request failed' });
    }
    return;
  }

  if (url === '/api/roadmap') {
    try {
      if (method === 'GET') {
        const data = await handleRoadmap('GET', null);
        sendJson(response, 200, data);
      } else if (method === 'PUT') {
        const payload = await readRequestBody(request);
        const data = await handleRoadmap('PUT', payload);
        sendJson(response, 200, data);
      } else {
        sendJson(response, 405, { error: 'Method not allowed' });
      }
    } catch (error) {
      sendJson(response, 500, { error: error.message || 'Roadmap request failed' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PhD local data server listening on http://localhost:${PORT}`);
});
