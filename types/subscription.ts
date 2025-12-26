export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionLimits {
  maxProperties: number;
  maxAiSearches: number;
  maxPhoneViews: number;
  featuredDays: number;
  hasAds: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxProperties: 5,
    maxAiSearches: 5,
    maxPhoneViews: 5,
    featuredDays: 0,
    hasAds: true,
  },
  premium: {
    maxProperties: 20,
    maxAiSearches: 50,
    maxPhoneViews: 30,
    featuredDays: 14,
    hasAds: true,
  },
  pro: {
    maxProperties: -1,
    maxAiSearches: -1,
    maxPhoneViews: -1,
    featuredDays: 30,
    hasAds: false,
  },
};

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  nameArabic: string;
  price: number;
  currency: 'USD' | 'IQD';
  duration: number;
  limits: SubscriptionLimits;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    nameArabic: 'مجاني',
    price: 0,
    currency: 'USD',
    duration: 0,
    limits: SUBSCRIPTION_LIMITS.free,
    features: [
      'إضافة 5 عقارات فقط',
      '5 عمليات بحث بالذكاء الاصطناعي',
      'الوصول لـ 5 أرقام هواتف',
      'ظهور إعلانات',
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    nameArabic: 'مميز',
    price: 9.99,
    currency: 'USD',
    duration: 30,
    limits: SUBSCRIPTION_LIMITS.premium,
    features: [
      'إضافة 20 عقار',
      '50 عملية بحث بالذكاء الاصطناعي',
      'الوصول لـ 30 رقم هاتف',
      'نشر إعلان مميز لمدة 14 يوم',
      'إعلانات أقل',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    nameArabic: 'احترافي',
    price: 24.99,
    currency: 'USD',
    duration: 30,
    limits: SUBSCRIPTION_LIMITS.pro,
    features: [
      'إضافة عقارات غير محدودة',
      'بحث بالذكاء الاصطناعي غير محدود',
      'الوصول لجميع أرقام الهواتف',
      'نشر إعلان مميز لمدة 30 يوم',
      'بدون إعلانات',
    ],
  },
];

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface UserUsage {
  id: string;
  userId: string;
  propertiesAdded: number;
  aiSearchesUsed: number;
  phoneViewsUsed: number;
  periodStart: string;
  periodEnd: string | null;
}

export type PaymentMethod = 'mastercard' | 'zaincash';

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
}
