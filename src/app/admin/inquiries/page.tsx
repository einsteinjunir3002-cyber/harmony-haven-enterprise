'use client';

import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle2, Clock, Phone, MessageSquare, Handshake, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (data.inquiries) setInquiries(data.inquiries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchInquiries();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Communications
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Customer & Partnership Inquiries
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Messages submitted from the public contact and corporate partnership inquiry forms.
        </p>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading messages...</div>
      ) : inquiries.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <Mail className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="font-serif font-bold text-base text-stone-800">No inquiries yet</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Submissions through the contact and partnerships forms will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {inq.isPartnership ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 flex items-center gap-1">
                      <Handshake className="w-3 h-3" />
                      <span>Partnership</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-900 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>General Inquiry</span>
                    </span>
                  )}
                  <h3 className="font-serif font-bold text-base text-stone-900">{inq.subject}</h3>
                </div>

                <span className="text-xs text-stone-400">{formatDate(inq.createdAt)}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 text-xs text-stone-700 leading-relaxed font-light">
                {inq.message}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-stone-100 text-xs text-stone-500">
                <div>
                  <span className="font-bold text-stone-900">{inq.name}</span> &bull; {inq.email} {inq.phone && `&bull; ${inq.phone}`}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    inq.status === 'RESPONDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {inq.status}
                  </span>

                  {inq.status !== 'RESPONDED' && (
                    <button
                      onClick={() => handleUpdateStatus(inq.id, 'RESPONDED')}
                      className="px-3 py-1 rounded-lg bg-harmony-900 text-white font-bold text-[10px] uppercase tracking-wider"
                    >
                      Mark Responded
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
