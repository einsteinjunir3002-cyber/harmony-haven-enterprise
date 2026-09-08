'use client';

import React, { useEffect, useState } from 'react';
import { History, Shield, User, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Security & Compliance
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Administrative Audit Trail
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Tamper-evident logs of administrative actions, price adjustments, and status progressions.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">No administrative events recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-6 text-stone-500">{formatDate(log.createdAt)}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 font-sans">{log.actorName}</td>
                    <td className="py-3.5 px-4 font-bold text-harmony-900">{log.action}</td>
                    <td className="py-3.5 px-4 text-stone-700 font-sans">{log.entity}</td>
                    <td className="py-3.5 px-4 text-stone-400">{log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
