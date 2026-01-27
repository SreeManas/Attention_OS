const API_BASE_URL = 'http://127.0.0.1:8000'

export async function fetchSessions() {
    const response = await fetch(`${API_BASE_URL}/api/sessions`)
    if (!response.ok) throw new Error('Failed to fetch sessions')
    return response.json()
}

export async function fetchTimeline() {
    const response = await fetch(`${API_BASE_URL}/api/timeline`)
    if (!response.ok) throw new Error('Failed to fetch timeline')
    return response.json()
}

export async function fetchAppSwitches() {
    const response = await fetch(`${API_BASE_URL}/api/app-switches`)
    if (!response.ok) throw new Error('Failed to fetch app switches')
    return response.json()
}
