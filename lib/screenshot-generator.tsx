/**
 * Screenshot Generator Utility
 *
 * Generates programmatic screenshots using Next.js server-side rendering
 * This provides a fallback when browser automation is unavailable
 */

import { ImageResponse } from 'next/og';
import React from 'react';

export interface ScreenshotConfig {
  title: string;
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
  theme?: 'light' | 'dark';
}

export async function generateDashboardScreenshot(config: ScreenshotConfig) {
  const theme = config.theme || 'dark';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'dark' ? '#0a0a0b' : '#ffffff',
          fontSize: 32,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {config.title}
          </div>
          <div style={{
            fontSize: 24,
            opacity: 0.7,
            fontWeight: 400
          }}>
            {config.description}
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          marginBottom: 40,
        }}>
          {config.metrics.map((metric, index) => (
            <div
              key={index}
              style={{
                padding: 32,
                borderRadius: 16,
                backgroundColor: theme === 'dark' ? '#1a1a1b' : '#f5f5f5',
                border: `2px solid ${theme === 'dark' ? '#2a2a2b' : '#e5e5e5'}`,
              }}
            >
              <div style={{
                fontSize: 16,
                opacity: 0.6,
                marginBottom: 12,
                fontWeight: 500,
              }}>
                {metric.label}
              </div>
              <div style={{
                fontSize: 36,
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#000000',
              }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          fontSize: 18,
          opacity: 0.5,
          fontWeight: 400,
        }}>
          Self-Hosted Analytics Dashboard
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}

export async function generateSetupWizardScreenshot(step: number) {
  const steps = [
    {
      title: 'Step 1: Initialize Database',
      description: 'One-click SQLite setup',
      action: 'npm run setup',
    },
    {
      title: 'Step 2: Copy Tracking Script',
      description: 'Add to your website',
      action: '<script src="/tracker.js">',
    },
    {
      title: 'Step 3: Test Event Tracking',
      description: 'Verify installation',
      action: 'Send test event',
    },
    {
      title: 'Step 4: View Dashboard',
      description: 'See your analytics',
      action: 'Open /dashboard',
    },
  ];

  const currentStep = steps[step - 1] || steps[0];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0b',
          fontSize: 32,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          padding: 80,
        }}
      >
        {/* Progress Indicator */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex',
            gap: 16,
            marginBottom: 24,
          }}>
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: num <= step ? '#667eea' : '#2a2a2b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  border: `2px solid ${num <= step ? '#667eea' : '#3a3a3b'}`,
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{
          padding: 48,
          borderRadius: 24,
          backgroundColor: '#1a1a1b',
          border: '2px solid #2a2a2b',
          marginBottom: 32,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 20,
            color: '#ffffff',
          }}>
            {currentStep.title}
          </div>
          <div style={{
            fontSize: 24,
            opacity: 0.7,
            marginBottom: 32,
            fontWeight: 400,
          }}>
            {currentStep.description}
          </div>
          <div style={{
            padding: '16px 32px',
            backgroundColor: '#2a2a2b',
            borderRadius: 12,
            fontSize: 18,
            fontFamily: 'monospace',
            opacity: 0.8,
          }}>
            {currentStep.action}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          fontSize: 18,
          opacity: 0.5,
          fontWeight: 400,
        }}>
          Setup Wizard — 4 steps to analytics
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}