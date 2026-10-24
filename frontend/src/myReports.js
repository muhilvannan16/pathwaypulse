// "My reports": a small list, kept ONLY in this browser (localStorage), of the
// reports this visitor submitted from this device. It exists so people can find
// the report they just sent even though it is hidden until it is reviewed.
//
// What is stored: the report's id, title, category and date. Nothing else, and
// never anything about the person. It is never sent anywhere.
// Storage can be blocked or unavailable (private windows, strict settings), so
// every read and write is wrapped in try/catch and the app works without it.

const KEY = 'pathwaypulse.myReports.v1'
const MAX_ITEMS = 20

function isValid(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.title === 'string' &&
    typeof item.category === 'string' &&
    typeof item.created_at === 'string'
  )
}

export function getMyReports() {
  try {
    const raw = window.localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter(isValid) : []
  } catch {
    return []
  }
}

function save(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // Storage unavailable: the report is still saved on the server; we just
    // can't remember it on this device.
  }
}

export function addMyReport(report) {
  const item = {
    id: report.id,
    title: report.title,
    category: report.category,
    created_at: report.created_at,
  }
  if (!isValid(item)) return
  const others = getMyReports().filter((existing) => existing.id !== item.id)
  save([item, ...others].slice(0, MAX_ITEMS))
}

export function removeMyReport(id) {
  save(getMyReports().filter((item) => item.id !== id))
}
