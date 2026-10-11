const defaultMeetings = [
  { id: 'm-1', title: 'Research supervision check-in', date: '2026-10-18', agenda: 'Discuss methodology and chapter outline' },
  { id: 'm-2', title: 'Progress review', date: '2026-11-02', agenda: 'Review literature and next milestones' }
];

const defaultRoadmap = [
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
];

export const STORAGE_KEYS = {
  meetings: 'silvia-phd-meetings',
  roadmap: 'silvia-phd-roadmap'
};

const BACKUP_KEYS = {
  meetings: 'silvia-phd-meetings-backup',
  roadmap: 'silvia-phd-roadmap-backup'
};

export function readLocalStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not write ${key}:`, error);
  }
}

function writeBackup(key, value) {
  if (value !== undefined && value !== null) {
    writeLocalStorage(BACKUP_KEYS[key], value);
  }
}

function readBackup(key, fallback) {
  return readLocalStorage(BACKUP_KEYS[key], fallback);
}

function normalizeMeeting(meeting) {
  return {
    id: meeting?.id ?? `meeting-${Date.now()}`,
    title: meeting?.title || 'Untitled meeting',
    date: meeting?.date || '',
    time: meeting?.time || '',
    supervisor_name: meeting?.supervisor_name || '',
    agenda: meeting?.agenda || '',
    notes: meeting?.notes || '',
    decisions: meeting?.decisions || '',
    action_items: meeting?.action_items || '',
    attachments: Array.isArray(meeting?.attachments) ? meeting.attachments : [],
    created_at: meeting?.created_at || null,
    updated_at: meeting?.updated_at || null
  };
}

function normalizeRoadmapValue(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return defaultRoadmap;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function loadMeetings() {
  const fallback = readBackup('meetings', defaultMeetings);

  try {
    const data = await requestJson('/api/meetings');
    const meetings = Array.isArray(data) ? data.map(normalizeMeeting) : fallback;
    writeLocalStorage(STORAGE_KEYS.meetings, meetings);
    writeBackup('meetings', meetings);
    return meetings;
  } catch {
    const local = readLocalStorage(STORAGE_KEYS.meetings, fallback);
    return local;
  }
}

export async function saveMeetings(meetings) {
  const rows = meetings.map(normalizeMeeting);
  writeBackup('meetings', rows);

  try {
    await requestJson('/api/meetings', {
      method: 'PUT',
      body: JSON.stringify(rows)
    });
  } catch (error) {
    console.warn('Could not sync meetings to the local backend; keeping local fallback.', error);
  }

  writeLocalStorage(STORAGE_KEYS.meetings, rows);
  return rows;
}

export async function updateMeeting(meetingId, updates) {
  const current = readLocalStorage(STORAGE_KEYS.meetings, readBackup('meetings', defaultMeetings));
  const next = current.map((meeting) => {
    if (meeting.id !== meetingId) return meeting;
    return normalizeMeeting({ ...meeting, ...updates, id: meetingId });
  });

  await saveMeetings(next);
  return next.find((meeting) => meeting.id === meetingId) || null;
}

export async function deleteMeeting(meetingId) {
  const current = readLocalStorage(STORAGE_KEYS.meetings, readBackup('meetings', defaultMeetings));
  const next = current.filter((meeting) => meeting.id !== meetingId);
  await saveMeetings(next);
  return next;
}

export async function loadRoadmap() {
  const fallback = readBackup('roadmap', defaultRoadmap);

  try {
    const data = await requestJson('/api/roadmap');
    const roadmap = normalizeRoadmapValue(data);
    writeLocalStorage(STORAGE_KEYS.roadmap, roadmap);
    writeBackup('roadmap', roadmap);
    return roadmap;
  } catch {
    const local = readLocalStorage(STORAGE_KEYS.roadmap, fallback);
    return local;
  }
}

export async function saveRoadmap(roadmap) {
  const payload = Array.isArray(roadmap) ? roadmap : defaultRoadmap;
  writeBackup('roadmap', payload);

  try {
    await requestJson('/api/roadmap', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('Could not sync roadmap to the local backend; keeping local fallback.', error);
  }

  writeLocalStorage(STORAGE_KEYS.roadmap, payload);
  return payload;
}
