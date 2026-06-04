'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface Stats {
  pageViews: number;
  uniqueVisitors: number;
  activeSessions: number;
  daily: Array<{ date: string; views: number }>;
}

interface PageData {
  path: string;
  views: number;
  uniqueVisitors: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

export default function Dashboard() {
  const [range, setRange] = useState(7);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRawEvents, setShowRawEvents] = useState(false);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [range]);

  async function fetchData() {
    try {
      setLoading(true);
      const [statsRes, pagesRes, referrersRes] = await Promise.all([
        fetch(`/api/stats?range=${range}`),
        fetch(`/api/pages?range=${range}`),
        fetch(`/api/referrers?range=${range}`),
      ]);

      const [statsData, pagesData, referrersData] = await Promise.all([
        statsRes.json(),
        pagesRes.json(),
        referrersRes.json(),
      ]);

      setStats(statsData);
      setPages(pagesData.pages || []);
      setReferrers(referrersData.referrers || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  function MetricCard({
    label,
    value,
    sublabel,
    className = '',
  }: {
    label: string;
    value: number | string;
    sublabel?: string;
    className?: string;
  }) {
    return (
      <div
        className={`metric-card bg-bg-secondary border border-border-subtle p-6 rounded-lg ${className}`}
      >
        <div className="font-body text-text-secondary text-sm mb-2">{label}</div>
        <div className="font-display text-4xl font-bold text-text-primary mb-1">
          {value}
        </div>
        {sublabel && (
          <div className="font-body text-text-tertiary text-xs">{sublabel}</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            Analytics Dashboard
          </h1>
          <p className="font-body text-text-secondary text-sm">
            Self-hosted. No API keys. Privacy-first.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/setup"
            className="font-body text-sm px-4 py-2 bg-bg-tertiary border border-border-subtle text-text-primary rounded hover:border-border-strong transition-colors"
          >
            Setup
          </a>
          <button
            onClick={() => setShowRawEvents(!showRawEvents)}
            className="font-body text-sm px-4 py-2 bg-accent-blue text-bg-primary rounded hover:opacity-90 transition-opacity"
          >
            {showRawEvents ? 'Hide Events' : 'Raw Events'}
          </button>
        </div>
      </header>

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-2">
        {[7, 30, 90].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`font-body text-sm px-4 py-2 rounded transition-colors ${
              range === r
                ? 'bg-accent-green text-bg-primary'
                : 'bg-bg-secondary border border-border-subtle text-text-secondary hover:border-border-strong'
            }`}
          >
            {r} days
          </button>
        ))}
      </div>

      {/* Metrics Grid - Asymmetrical Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          label="Total Page Views"
          value={stats?.pageViews || 0}
          sublabel={`Last ${range} days`}
          className="lg:col-span-3 animate-fade-up"
        />
        <div className="lg:col-span-2 flex flex-col gap-4">
          <MetricCard
            label="Unique Visitors"
            value={stats?.uniqueVisitors || 0}
            className="flex-1 animate-fade-up-delay-1"
          />
          <MetricCard
            label="Active Sessions"
            value={stats?.activeSessions || 0}
            sublabel="Last 30 min"
            className="flex-1 animate-fade-up-delay-1"
          />
        </div>
      </div>

      {/* Page Views Chart */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6 mb-6 animate-fade-up-delay-2">
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          Page Views Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats?.daily || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickFormatter={(str) => format(new Date(str), 'MMM d')}
            />
            <YAxis
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--accent-green)' }}
              labelFormatter={(str) => format(new Date(String(str)), 'MMM d, yyyy')}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="var(--accent-green)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Top Pages
          </h2>
          {loading ? (
            <div className="font-body text-text-secondary text-sm">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="font-body text-text-secondary text-sm">
              No data yet. Visit your site to generate events.
            </div>
          ) : (
            <div className="space-y-2">
              {pages.map((page, idx) => (
                <div
                  key={page.path}
                  className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-text-tertiary text-sm w-6">
                      {idx + 1}
                    </span>
                    <span className="font-body text-text-primary text-sm font-mono">
                      {page.path}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-text-primary font-bold">
                      {page.views}
                    </div>
                    <div className="font-body text-text-tertiary text-xs">
                      {page.uniqueVisitors} unique
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Top Referrers
          </h2>
          {loading ? (
            <div className="font-body text-text-secondary text-sm">Loading...</div>
          ) : referrers.length === 0 ? (
            <div className="font-body text-text-secondary text-sm">
              No referrer data yet.
            </div>
          ) : (
            <div className="space-y-2">
              {referrers.map((ref, idx) => (
                <div
                  key={ref.referrer}
                  className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-text-tertiary text-sm w-6">
                      {idx + 1}
                    </span>
                    <span className="font-body text-text-primary text-sm">
                      {ref.referrer}
                    </span>
                  </div>
                  <div className="font-display text-text-primary font-bold">
                    {ref.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Raw Events Stream (Optional) */}
      {showRawEvents && (
        <div className="mt-6 bg-bg-secondary border border-border-subtle rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Raw Event Stream
          </h2>
          <div className="font-display text-text-secondary text-xs bg-bg-tertiary p-4 rounded max-h-96 overflow-y-auto">
            <div className="text-accent-green">// Waiting for events...</div>
            <div className="mt-2 text-text-tertiary">
              Add the tracking script to your site to see real-time events here.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
