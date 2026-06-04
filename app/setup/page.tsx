'use client';

import { useState, useEffect } from 'react';

export default function Setup() {
  const [step, setStep] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const trackingSnippet = `<script src="/tracker.js"></script>`;

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch('/api/setup/init');
      const data = await res.json();
      setInitialized(data.initialized || data.exists);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  }

  async function initializeDatabase() {
    setLoading(true);
    try {
      const res = await fetch('/api/setup/init', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setInitialized(true);
        setStep(2);
      } else {
        setTestResult('Failed to initialize database');
      }
    } catch (error) {
      setTestResult('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function testEvent() {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/setup/test', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setTestResult('✓ Test event created successfully! Check the dashboard.');
        setTimeout(() => setStep(4), 2000);
      } else {
        setTestResult('✗ Test failed: ' + data.error);
      }
    } catch (error) {
      setTestResult('✗ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(trackingSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            Setup Wizard
          </h1>
          <p className="font-body text-text-secondary text-sm">
            Get your analytics dashboard running in 3 steps
          </p>
        </header>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded transition-colors ${
                s <= step ? 'bg-accent-green' : 'bg-bg-tertiary'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Initialize Database */}
        {step === 1 && (
          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              Step 1: Initialize Database
            </h2>
            <p className="font-body text-text-secondary text-sm mb-6">
              Create the SQLite database file to store your analytics data.
              This file will be created at <code className="font-display text-accent-blue">.data/analytics.db</code>
            </p>

            {initialized ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-accent-green mb-2">
                  <span className="font-display text-xl">✓</span>
                  <span className="font-body font-medium">Database initialized</span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="font-body text-sm px-6 py-2 bg-accent-green text-bg-primary rounded hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </div>
            ) : (
              <button
                onClick={initializeDatabase}
                disabled={loading}
                className="font-body text-sm px-6 py-2 bg-accent-green text-bg-primary rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Initializing...' : 'Initialize Database'}
              </button>
            )}
          </div>
        )}

        {/* Step 2: Copy Tracking Snippet */}
        {step === 2 && (
          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              Step 2: Add Tracking Script
            </h2>
            <p className="font-body text-text-secondary text-sm mb-4">
              Copy this snippet and paste it into the <code className="font-display text-accent-blue">&lt;head&gt;</code> section of your website.
            </p>

            <div className="bg-bg-tertiary border border-border-subtle rounded p-4 mb-4">
              <code className="font-display text-text-primary text-sm whitespace-pre-wrap">
                {trackingSnippet}
              </code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="font-body text-sm px-6 py-2 bg-accent-blue text-bg-primary rounded hover:opacity-90 transition-opacity"
              >
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => setStep(3)}
                className="font-body text-sm px-6 py-2 border border-border-subtle text-text-primary rounded hover:border-border-strong transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Test Event */}
        {step === 3 && (
          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              Step 3: Test Event Tracking
            </h2>
            <p className="font-body text-text-secondary text-sm mb-6">
              Send a test event to verify everything is working.
            </p>

            <button
              onClick={testEvent}
              disabled={loading}
              className="font-body text-sm px-6 py-2 bg-accent-green text-bg-primary rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test Event'}
            </button>

            {testResult && (
              <div className={`mt-4 font-display text-sm ${testResult.startsWith('✓') ? 'text-accent-green' : 'text-accent-red'}`}>
                {testResult}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="font-display text-5xl text-accent-green mb-4">✓</div>
              <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
                You're All Set!
              </h2>
              <p className="font-body text-text-secondary text-sm">
                Your analytics dashboard is ready to track events.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-display text-accent-green">✓</span>
                <span className="font-body text-text-primary">Database initialized</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-display text-accent-green">✓</span>
                <span className="font-body text-text-primary">Tracking script copied</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-display text-accent-green">✓</span>
                <span className="font-body text-text-primary">Test event successful</span>
              </div>
            </div>

            <a
              href="/"
              className="block w-full text-center font-body text-sm px-6 py-3 bg-accent-green text-bg-primary rounded hover:opacity-90 transition-opacity"
            >
              View Dashboard
            </a>
          </div>
        )}

        {/* Back Button */}
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 font-body text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
