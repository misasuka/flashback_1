(function () {
  async function loadEvents() {
    try {
      const response = await fetch('./data/events.json');
      if (!response.ok) {
        throw new Error('加载本地 JSON 失败');
      }
      const events = await response.json();
      return sanitizeEvents(events);
    } catch (error) {
      if (Array.isArray(window.FALLBACK_EVENTS) && window.FALLBACK_EVENTS.length > 0) {
        return sanitizeEvents(window.FALLBACK_EVENTS);
      }
      throw error;
    }
  }

  function sanitizeEvents(events) {
    return events.map((event) => ({
      ...event,
      timestamp: new Date(event.date).getTime(),
    }));
  }

  window.DataStore = {
    loadEvents,
  };
})();
