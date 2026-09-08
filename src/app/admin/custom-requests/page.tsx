'use client';

import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, User, Clock, Image as ImageIcon, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/custom-requests');
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/custom-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchRequests();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-teal-800 block">
          4U HEARTLINES Creative Studio
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Custom Poem & Gifting Commissions
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Review personal stories, memories, poem themes, and recipient attachments submitted by clients.
        </p>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading custom commissions...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <Heart className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="font-serif font-bold text-base text-stone-800">No custom commissions yet</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Client requests submitted via the 4U HEARTLINES Personalization Studio will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => {
            let uploadedPhotos: string[] = [];
            try {
              uploadedPhotos = JSON.parse(req.uploadedMediaJson || '[]');
            } catch {}

            return (
              <div
                key={req.id}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                        {req.occasion} &bull; {req.relationship}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        For: {req.recipientName}
                      </h3>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'IN_PRODUCTION'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'COMPLETED'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="p-3 rounded-xl bg-stone-50 text-xs text-stone-600 flex justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{req.customerName}</span>
                      <p>{req.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 block text-[10px]">Package:</span>
                      <span className="font-bold text-harmony-950">{req.requestedItems}</span>
                    </div>
                  </div>

                  {/* Story & Sentiment Box */}
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 text-xs space-y-2">
                    <p className="font-bold text-teal-950">Client Story & Memories:</p>
                    <p className="text-stone-700 leading-relaxed font-serif italic text-xs">
                      &ldquo;{req.messageStory}&rdquo;
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-stone-500 border-t border-teal-100">
                      {req.poemTheme && <span>Theme: <b className="text-teal-900">{req.poemTheme}</b></span>}
                      {req.tone && <span>&bull; Tone: <b className="text-teal-900">{req.tone}</b></span>}
                    </div>
                  </div>

                  {/* Uploaded Customer Photos */}
                  {uploadedPhotos.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">Uploaded Photos ({uploadedPhotos.length}):</span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {uploadedPhotos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0 block">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">{formatDate(req.createdAt)}</span>

                  <div className="flex items-center gap-2">
                    {req.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                        className="px-3 py-1 rounded-lg bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider"
                      >
                        Accept
                      </button>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'IN_PRODUCTION')}
                        className="px-3 py-1 rounded-lg bg-amber-800 text-white font-bold text-[11px] uppercase tracking-wider"
                      >
                        In Production
                      </button>
                    )}
                    {req.status === 'IN_PRODUCTION' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        className="px-3 py-1 rounded-lg bg-teal-900 text-white font-bold text-[11px] uppercase tracking-wider"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
