// Analytics Tracker - Self-Hosted Analytics Dashboard
// Copy this snippet and paste it into your site's <head> section

(function() {
  'use strict';

  const Analytics = (function() {
    let sessionId = null;
    const eventQueue = [];
    const BATCH_SIZE = 10;
    const FLUSH_INTERVAL = 5000; // 5 seconds

    // Get or create session ID
    function getSessionId() {
      if (!sessionId) {
        sessionId = localStorage.getItem('analytics_session_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
          localStorage.setItem('analytics_session_id', sessionId);
        }
      }
      return sessionId;
    }

    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Extract referrer
    function getReferrer() {
      if (document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          // Return only if external referrer
          if (referrerUrl.hostname !== window.location.hostname) {
            return document.referrer;
          }
        } catch (e) {
          return document.referrer;
        }
      }
      return 'direct';
    }

    // Track event
    function track(type, properties = {}) {
      if (navigator.doNotTrack === '1') {
        return; // Respect DNT
      }

      const event = {
        type,
        properties: {
          ...properties,
          path: window.location.pathname,
          referrer: getReferrer(),
          userAgent: navigator.userAgent,
        },
        session_id: getSessionId(),
        ts: Date.now(),
      };

      eventQueue.push(event);

      if (eventQueue.length >= BATCH_SIZE) {
        flush();
      }
    }

    // Flush queue to server
    function flush() {
      if (eventQueue.length === 0) return;

      const eventsToSend = [...eventQueue];
      eventQueue.length = 0; // Clear queue

      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
      }).catch(err => {
        console.error('Analytics flush failed:', err);
        // Re-queue failed events
        eventQueue.unshift(...eventsToSend);
      });
    }

    // Auto-flush on interval
    setInterval(flush, FLUSH_INTERVAL);

    // Flush on page hide
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    });

    // Track initial page view
    track('pageview');

    // Public API
    return {
      track,
      flush,
    };
  })();

  // Expose globally
  window.Analytics = Analytics;

  // Auto-track page views on navigation (SPA support)
  let lastPathname = window.location.pathname;
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      Analytics.track('pageview');
    }
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      Analytics.track('pageview');
    }
  };

  window.addEventListener('popstate', function() {
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      Analytics.track('pageview');
    }
  });
})();
