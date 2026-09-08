export const APP_NAME = "Harmony Haven Enterprise";
export const TAGLINE = "Small Hands, Wide Reach";

export const BUSINESS_INFO = {
  name: "Harmony Haven Enterprise",
  tagline: "Small Hands, Wide Reach",
  phone: "024 514 7912",
  phoneRaw: "+233245147912",
  whatsappUrl: "https://wa.me/message/UKIZH3E3AXOXB1",
  email: "successlight@gmail.com",
  instagram: "harmony_haven.enterprise",
  instagramUrl: "https://instagram.com/harmony_haven.enterprise",
  location: "Operating in Ghana | Deliveries to Kumasi, Cape Coast & Accra (24hr to 48hrs)",
  currency: "GHS",
  currencySymbol: "GH₵",
};

export const DELIVERY_LOCATIONS = [
  "Kumasi",
  "Cape Coast",
  "Accra",
] as const;

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
] as const;

export const ORDER_STATUS_FLOW = [
  { key: "NEW", label: "New Order", color: "bg-blue-100 text-blue-800" },
  { key: "CONFIRMED", label: "Confirmed", color: "bg-indigo-100 text-indigo-800" },
  { key: "PREPARING", label: "Preparing / In Production", color: "bg-amber-100 text-amber-800" },
  { key: "READY", label: "Ready", color: "bg-emerald-100 text-emerald-800" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup", color: "bg-purple-100 text-purple-800" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "bg-cyan-100 text-cyan-800" },
  { key: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-800" },
  { key: "COLLECTED", label: "Collected", color: "bg-teal-100 text-teal-800" },
  { key: "CANCELLED", label: "Cancelled", color: "bg-rose-100 text-rose-800" },
] as const;

export const PAYMENT_STATUSES = [
  { key: "PENDING", label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
  { key: "PROCESSING", label: "Processing", color: "bg-blue-100 text-blue-800" },
  { key: "PAID", label: "Paid / Verified", color: "bg-emerald-100 text-emerald-800" },
  { key: "FAILED", label: "Failed", color: "bg-rose-100 text-rose-800" },
  { key: "REFUNDED", label: "Refunded", color: "bg-gray-100 text-gray-800" },
  { key: "CANCELLED", label: "Cancelled", color: "bg-stone-100 text-stone-800" },
] as const;
