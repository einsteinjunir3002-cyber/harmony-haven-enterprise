'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  BellRing,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Phone,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderAlert {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  deliveryMethod: string;
  deliveryAddressJson?: string | null;
  internalNotes?: string | null;
  createdAt: string;
}

export function AdminOrderAlarm() {
  const [activeAlert, setActiveAlert] = useState<OrderAlert | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioNeedsInteraction, setAudioNeedsInteraction] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());

  // Initialize Audio Context on user gesture or mount
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play an unmistakable, loud, synthesized dual-tone siren/chime
  const playSirenPulse = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.connect(ctx.destination);

      // Tone 1: High alert beep (950Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(950, now);
      osc1.frequency.exponentialRampToValueAtTime(1250, now + 0.15);
      gain1.gain.setValueAtTime(0.8, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Tone 2: Urgent follow-up chime (1350Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(1550, now + 0.38);
      gain2.gain.setValueAtTime(0.9, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.4);

      // Tone 3: Resonant deep accent (650Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(650, now + 0.42);
      osc3.frequency.linearRampToValueAtTime(800, now + 0.6);
      gain3.gain.setValueAtTime(0.6, now + 0.42);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.62);
      osc3.connect(gain3);
      gain3.connect(masterGain);
      osc3.start(now + 0.42);
      osc3.stop(now + 0.62);
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  };

  // Start continuous looping alarm until acknowledged
  const startAlarmLoop = (repeatTimes = 12) => {
    stopAlarmLoop();
    setIsPlayingSound(true);

    // Play immediately
    playSirenPulse();

    let count = 1;
    alarmIntervalRef.current = setInterval(() => {
      if (count >= repeatTimes) {
        stopAlarmLoop();
        return;
      }
      playSirenPulse();
      count++;
    }, 1200);
  };

  const stopAlarmLoop = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsPlayingSound(false);
  };

  // Manual Test button for Owner
  const handleTestAlarm = () => {
    setAudioTesting(true);
    setSoundEnabled(true);
    setAudioNeedsInteraction(false);
    getAudioContext();

    // Trigger 3 test pulses
    startAlarmLoop(3);

    // Also trigger sample test notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      } else if (Notification.permission === 'granted') {
        new Notification('🔔 Alarm Test: Harmony Haven Enterprise', {
          body: 'Audio siren and notification system is working perfectly!',
          icon: '/images/gallery/alberta-glory-founder.jpg',
        });
      }
    }

    setTimeout(() => {
      setAudioTesting(false);
    }, 3600);
  };

  // Request browser desktop notification permissions on interaction
  const enableSoundAndNotifications = () => {
    getAudioContext();
    setSoundEnabled(true);
    setAudioNeedsInteraction(false);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
    playSirenPulse();
  };

  // Initialize seen orders from storage
  useEffect(() => {
    try {
      const storedSeen = sessionStorage.getItem('hh_admin_seen_orders');
      if (storedSeen) {
        seenOrderIdsRef.current = new Set(JSON.parse(storedSeen));
      }
    } catch {}

    // Check browser notification permission state
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setSoundEnabled(true);
      } else {
        setAudioNeedsInteraction(true);
      }
    }
  }, []);

  // Poll for new incoming orders every 6 seconds
  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (!res.ok) return;

        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          const newest = data.orders[0];

          // If we haven't seen this order yet in this session:
          if (!seenOrderIdsRef.current.has(newest.id)) {
            seenOrderIdsRef.current.add(newest.id);
            try {
              sessionStorage.setItem(
                'hh_admin_seen_orders',
                JSON.stringify(Array.from(seenOrderIdsRef.current))
              );
            } catch {}

            // Trigger the alarm!
            setActiveAlert(newest);
            startAlarmLoop(15); // loops for ~18 seconds or until user taps acknowledge

            // Fire desktop push notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`🚨 NEW ORDER: ${newest.orderNumber}`, {
                body: `${newest.customerName} ordered for ${formatCurrency(newest.total)} (${newest.paymentStatus === 'PAY_ON_DELIVERY' ? 'Payment on Delivery' : 'Pay Before Delivery'})`,
                icon: '/images/gallery/alberta-glory-founder.jpg',
              });
            }
          }
        }
      } catch (e) {
        // silent polling failure
      }
    };

    // Initial check
    checkNewOrders();

    const interval = setInterval(checkNewOrders, 6000);
    return () => {
      clearInterval(interval);
      stopAlarmLoop();
    };
  }, []);

  const handleAcknowledge = () => {
    stopAlarmLoop();
    setActiveAlert(null);
  };

  return (
    <>
      {/* 1. Header Toolbar Control: Test Alarm Sound & Audio Status */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-300 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-stone-200">
            Order Dispatch Monitor Active
          </span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="hidden sm:inline text-stone-400">
            Real-time audio alert triggers when customer places an order
          </span>
        </div>

        <div className="flex items-center gap-2">
          {audioNeedsInteraction && (
            <button
              onClick={enableSoundAndNotifications}
              className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 transition-colors font-medium flex items-center gap-1.5 animate-pulse"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Enable Sound Alerts</span>
            </button>
          )}

          <button
            onClick={handleTestAlarm}
            disabled={audioTesting}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-gold-400 border border-gold-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            title="Click to test loud alarm sound"
          >
            {isPlayingSound ? (
              <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-gold-400" />
            )}
            <span>{audioTesting ? 'Playing Alarm Siren...' : 'Test Alarm Sound'}</span>
          </button>
        </div>
      </div>

      {/* 2. Flashing Attention-Grabbing Order Banner & Modal */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-rose-600 shadow-2xl overflow-hidden animate-bounce-subtle">
            {/* Flashing Top Alert Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 p-6 text-white text-center relative">
              <div className="w-16 h-16 rounded-full bg-white text-rose-600 flex items-center justify-center mx-auto shadow-lg mb-3 animate-pulse">
                <BellRing className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-block mb-1">
                Immediate Action Required
              </span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-tight">
                NEW ORDER RECEIVED!
              </h2>
              <p className="text-white/90 text-sm mt-1 font-mono font-bold">
                {activeAlert.orderNumber}
              </p>

              <button
                onClick={handleAcknowledge}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Highlights Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-stone-400 block font-medium">Customer</span>
                  <p className="text-stone-900 font-bold text-sm mt-0.5">{activeAlert.customerName}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{activeAlert.customerPhone}</p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-stone-400 block font-medium">Order Total</span>
                  <p className="text-harmony-950 font-serif font-black text-lg mt-0.5">
                    {formatCurrency(activeAlert.total)}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">
                    Ghana MoMo
                  </span>
                </div>
              </div>

              {/* Payment Mode Highlight */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/70 space-y-1 text-xs text-amber-900">
                <div className="flex items-center justify-between font-bold">
                  <span>Payment Arrangement:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase font-black text-[10px]">
                    {activeAlert.paymentStatus === 'PAY_ON_DELIVERY'
                      ? 'Payment on Delivery'
                      : 'Paid Before Delivery'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed pt-1">
                  {activeAlert.paymentStatus === 'PAY_ON_DELIVERY'
                    ? 'Customer will pay dispatch rider via Mobile Money upon arrival of delivery.'
                    : 'Customer selected pay before delivery via Mobile Money.'}
                </p>
                {activeAlert.internalNotes && (
                  <p className="text-[10px] text-amber-700 pt-1 font-mono">
                    {activeAlert.internalNotes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/admin/orders"
                  onClick={handleAcknowledge}
                  className="w-full py-3.5 bg-harmony-900 hover:bg-harmony-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-gold-400" />
                  <span>Open Orders & Dispatch</span>
                </Link>

                <button
                  onClick={handleAcknowledge}
                  className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  {isPlayingSound ? <VolumeX className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span>Mute & Acknowledge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
