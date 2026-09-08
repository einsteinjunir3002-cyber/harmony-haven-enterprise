'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmationIndexPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const lastOrderStr = sessionStorage.getItem('hh_last_order');
      if (lastOrderStr) {
        const lastOrder = JSON.parse(lastOrderStr);
        if (lastOrder && (lastOrder.id || lastOrder.orderNumber)) {
          router.replace(`/checkout/confirmation/${lastOrder.id || lastOrder.orderNumber}`);
          return;
        }
      }
    } catch {}

    // If no recent order found, redirect to account or order catalog
    router.replace('/account');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-harmony-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
