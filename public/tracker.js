// Analytics Tracker - Self-Hosted Analytics Dashboard
// Copy this snippet and paste it into your site's <head> section

(function() {
  'use strict';

  const Analytics = (function() {
    let sessionId = null;
    const eventQueue = [];
    const BATCH_SIZE = 10;
    const FLUSH_INTERVAL = 5000; // 5 seconds
    const MAX_QUEUE_SIZE = 100; // Prevent unbounded growth
    let retryCount = 0;
    const MAX_RETRY_COUNT = 3;

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

      // Prevent unbounded queue growth
      if (eventQueue.length >= MAX_QUEUE_SIZE) {
        eventQueue.shift(); // Remove oldest event
        console.warn('Analytics: Queue full, dropping oldest event');
      }

      eventQueue.push(event);

      if (eventQueue.length >= BATCH_SIZE) {
        flush();
      }
    }

    // Flush queue to server with exponential backoff
    function flush() {
      if (eventQueue.length === 0) return;

      const eventsToSend = [...eventQueue];
      eventQueue.length = 0; // Clear queue

      // Exponential backoff: 2^retryCount * 1000ms
      const backoffDelay = Math.pow(2, retryCount) * 1000;

      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        retryCount = 0; // Reset on success
        return response.json();
      })
      .catch(err => {
        console.error('Analytics flush failed:', err);
        retryCount = Math.min(retryCount + 1, MAX_RETRY_COUNT);

        // Re-queue failed events (with space check)
        const spaceAvailable = MAX_QUEUE_SIZE - eventQueue.length;
        const eventsToRequeue = eventsToSend.slice(-spaceAvailable);
        eventQueue.unshift(...eventsToRequeue);

        // Schedule retry with exponential backoff
        if (retryCount <= MAX_RETRY_COUNT) {
          setTimeout(flush, backoffDelay);
        } else {
          console.error('Analytics: Max retries reached, giving up');
          retryCount = 0; // Reset for future attempts
        }
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
