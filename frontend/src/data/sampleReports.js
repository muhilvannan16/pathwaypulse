// SAMPLE DATA ONLY.
// These reports are made up to show how PathwayPulse works. They are NOT
// real community observations, do not describe real hazards, and the
// locations are arbitrary points inside Rochester Hills, MI.
// Fields match the data contract exactly.

export const SAMPLE_REPORTS = [
  {
    id: 'sample-1',
    title: 'Sample: Cracked pathway surface',
    description:
      'Illustrative example, not a real observation. Shows how a damaged-surface report would look.',
    category: 'damaged_path',
    latitude: 42.6712,
    longitude: -83.1384,
    status: 'Pending Review',
    created_at: '2026-10-08T14:20:00Z',
    photo_path: null,
    reviewed_at: null,
  },
  {
    id: 'sample-2',
    title: 'Sample: Obstruction on a shared-use path',
    description:
      'Illustrative example, not a real observation. Shows how a blocked-path report would look.',
    category: 'blocked_path',
    latitude: 42.6459,
    longitude: -83.1612,
    status: 'Verified',
    created_at: '2026-10-03T09:05:00Z',
    photo_path: null,
    reviewed_at: '2026-10-05T16:40:00Z',
  },
  {
    id: 'sample-3',
    title: 'Sample: Missing curb ramp at a crossing',
    description:
      'Illustrative example, not a real observation. Shows how an accessibility-barrier report would look.',
    category: 'accessibility_barrier',
    latitude: 42.6637,
    longitude: -83.1105,
    status: 'Submitted to Agency',
    created_at: '2026-09-27T18:30:00Z',
    photo_path: null,
    reviewed_at: '2026-09-29T11:15:00Z',
  },
  {
    id: 'sample-4',
    title: 'Sample: Gap between two pathway segments',
    description:
      'Illustrative example, not a real observation. Shows how a missing-connection report would look.',
    category: 'missing_connection',
    latitude: 42.6835,
    longitude: -83.1721,
    status: 'Pending Review',
    created_at: '2026-10-10T07:45:00Z',
    photo_path: null,
    reviewed_at: null,
  },
  {
    id: 'sample-5',
    title: 'Sample: Uneven pathway edge',
    description:
      'Illustrative example, not a real observation. Shows how a resolved report would look.',
    category: 'damaged_path',
    latitude: 42.6301,
    longitude: -83.1297,
    status: 'Resolved',
    created_at: '2026-09-15T12:10:00Z',
    photo_path: null,
    reviewed_at: '2026-09-30T10:00:00Z',
  },
  {
    id: 'sample-6',
    title: 'Sample: Narrow passage near a bench',
    description:
      'Illustrative example, not a real observation. Shows how a second accessibility report would look.',
    category: 'accessibility_barrier',
    latitude: 42.6579,
    longitude: -83.1923,
    status: 'Verified',
    created_at: '2026-10-01T16:55:00Z',
    photo_path: null,
    reviewed_at: '2026-10-04T13:25:00Z',
  },
]
