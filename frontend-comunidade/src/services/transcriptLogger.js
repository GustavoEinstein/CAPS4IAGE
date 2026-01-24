// Lightweight transcript logger. Swallows errors so UI is never blocked.
export const logTranscript = async (payload) => {
  try {
    const token = localStorage.getItem('access_token');
    await fetch('http://127.0.0.1:8000/kipo_playground/api/ai/log-transcript/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Intentionally ignore logging errors; do not disrupt UX
    console.warn('Transcript log failed (ignored):', e.message);
  }
};
