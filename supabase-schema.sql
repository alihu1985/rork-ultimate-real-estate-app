-- ============================================
-- Real Estate App - Supabase Database Schema
-- ============================================
-- انسخ والصق هذا الملف بالكامل في Supabase SQL Editor
-- ============================================

-- حذف الجداول الموجودة إن وجدت
DROP TABLE IF EXISTS user_usage CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- جدول المستخدمين
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات المستخدم
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  user_type TEXT NOT NULL DEFAULT 'guest' CHECK (user_type IN ('guest', 'user')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول العقارات
-- ============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- المعلومات الأساسية
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'IQD')),
  type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'villa', 'land', 'commercial')),
  status TEXT NOT NULL CHECK (status IN ('for-sale', 'for-rent')),
  
  -- معلومات الموقع
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  
  -- مواصفات العقار
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  area NUMERIC(10, 2) NOT NULL,
  
  -- المميزات والخدمات
  parking BOOLEAN DEFAULT false,
  elevator BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  security BOOLEAN DEFAULT false,
  garden BOOLEAN DEFAULT false,
  pool BOOLEAN DEFAULT false,
  gym BOOLEAN DEFAULT false,
  
  -- الصور
  images TEXT[] DEFAULT '{}',
  
  -- معلومات المالك
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول المفضلة
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- منع التكرار
  UNIQUE(user_id, property_id)
);

-- ============================================
-- جدول الاشتراكات
-- ============================================
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'pro')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- مستخدم واحد له اشتراك نشط واحد فقط
  UNIQUE(user_id, is_active)
);

-- ============================================
-- جدول استخدام المستخدم (للحدود)
-- ============================================
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  properties_added INTEGER DEFAULT 0,
  ai_searches_used INTEGER DEFAULT 0,
  phone_views_used INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- الفهارس لتحسين الأداء
-- ============================================

-- فهارس جدول المستخدمين
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);

-- فهارس جدول العقارات
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_user_id ON properties(user_id);

-- فهرس مركب للفلاتر الشائعة
CREATE INDEX idx_properties_filters ON properties(status, type, price, bedrooms, bathrooms);

-- فهارس جدول المفضلة
CREATE INDEX idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_favorites_property_id ON user_favorites(property_id);

-- فهارس جدول الاشتراكات
CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX idx_subscriptions_active ON user_subscriptions(is_active);

-- فهارس جدول الاستخدام
CREATE INDEX idx_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_usage_period ON user_usage(period_start, period_end);

-- ============================================
-- تفعيل Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- سياسات الأمان للمستخدمين
-- ============================================

-- السماح للجميع بقراءة بيانات المستخدمين العامة
CREATE POLICY "السماح بالقراءة العامة للمستخدمين"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- السماح بإنشاء حساب جديد
CREATE POLICY "السماح بإنشاء حساب جديد"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- السماح للمستخدم بتحديث بياناته فقط
CREATE POLICY "السماح بتحديث البيانات الخاصة"
  ON users
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- سياسات الأمان للعقارات
-- ============================================

-- السماح للجميع بقراءة العقارات
CREATE POLICY "السماح بالقراءة العامة للعقارات"
  ON properties
  FOR SELECT
  TO public
  USING (true);

-- السماح للجميع بإضافة عقار
CREATE POLICY "السماح بإضافة عقار"
  ON properties
  FOR INSERT
  TO public
  WITH CHECK (true);

-- السماح بتحديث العقار
CREATE POLICY "السماح بتحديث العقار"
  ON properties
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- السماح بحذف العقار
CREATE POLICY "السماح بحذف العقار"
  ON properties
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- سياسات الأمان للمفضلة
-- ============================================

-- السماح للجميع بقراءة المفضلة
CREATE POLICY "السماح بقراءة المفضلة"
  ON user_favorites
  FOR SELECT
  TO public
  USING (true);

-- السماح للجميع بإضافة للمفضلة
CREATE POLICY "السماح بإضافة للمفضلة"
  ON user_favorites
  FOR INSERT
  TO public
  WITH CHECK (true);

-- السماح بحذف من المفضلة
CREATE POLICY "السماح بحذف من المفضلة"
  ON user_favorites
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- سياسات الأمان للاشتراكات
-- ============================================

-- السماح بقراءة الاشتراكات
CREATE POLICY "السماح بقراءة الاشتراكات"
  ON user_subscriptions
  FOR SELECT
  TO public
  USING (true);

-- السماح بإضافة اشتراك
CREATE POLICY "السماح بإضافة اشتراك"
  ON user_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- السماح بتحديث الاشتراك
CREATE POLICY "السماح بتحديث الاشتراك"
  ON user_subscriptions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- سياسات الأمان للاستخدام
-- ============================================

-- السماح بقراءة الاستخدام
CREATE POLICY "السماح بقراءة الاستخدام"
  ON user_usage
  FOR SELECT
  TO public
  USING (true);

-- السماح بإضافة سجل استخدام
CREATE POLICY "السماح بإضافة سجل استخدام"
  ON user_usage
  FOR INSERT
  TO public
  WITH CHECK (true);

-- السماح بتحديث الاستخدام
CREATE POLICY "السماح بتحديث الاستخدام"
  ON user_usage
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- الدوال المساعدة
-- ============================================

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل التحديث التلقائي للمستخدمين
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تفعيل التحديث التلقائي للعقارات
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تفعيل التحديث التلقائي للاشتراكات
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تفعيل التحديث التلقائي للاستخدام
CREATE TRIGGER update_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- بيانات تجريبية (اختيارية - للاختبار)
-- ============================================

-- إضافة مستخدم تجريبي
INSERT INTO users (name, email, user_type) VALUES 
('مستخدم تجريبي', 'test@example.com', 'user');

-- إضافة عقارات تجريبية
INSERT INTO properties (
  title,
  description,
  price,
  currency,
  type,
  status,
  latitude,
  longitude,
  address,
  city,
  neighborhood,
  bedrooms,
  bathrooms,
  area,
  parking,
  elevator,
  furnished,
  security,
  garden,
  pool,
  gym,
  images,
  owner_name,
  owner_phone
) VALUES 
(
  'شقة فاخرة في الكرادة',
  'شقة حديثة مع إطلالة رائعة على نهر دجلة. تحتوي على جميع الخدمات الحديثة وموقع استراتيجي قريب من المطاعم والمحلات.',
  450000,
  'USD',
  'apartment',
  'for-sale',
  33.3152,
  44.3661,
  'شارع الكرادة داخل',
  'بغداد',
  'الكرادة',
  3,
  2,
  180,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260066-6bc2c9f89d9c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
  ],
  'أحمد محمد',
  '+964 770 123 4567'
),
(
  'فيلا حديثة في المنصور',
  'فيلا عصرية بتصميم معماري فريد مع حديقة واسعة ومسبح خاص. مثالية للعوائل الكبيرة.',
  1232500000,
  'IQD',
  'villa',
  'for-sale',
  33.3128,
  44.3615,
  'حي المنصور',
  'بغداد',
  'المنصور',
  5,
  4,
  400,
  true,
  false,
  false,
  true,
  true,
  true,
  false,
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'
  ],
  'سارة علي',
  '+964 771 234 5678'
),
(
  'شقة للإيجار في الجادرية',
  'شقة مفروشة بالكامل قريبة من الجامعات والمراكز التجارية. مناسبة للعوائل الصغيرة أو الطلاب.',
  870000,
  'IQD',
  'apartment',
  'for-rent',
  33.2850,
  44.3900,
  'منطقة الجادرية',
  'بغداد',
  'الجادرية',
  2,
  1,
  120,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  ARRAY[
    'https://images.unsplash.com/photo-1502672260066-6bc2c9f89d9c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
  ],
  'محمد حسن',
  '+964 772 345 6789'
),
(
  'بيت واسع في الحارثية',
  'بيت تقليدي بمساحة كبيرة وحديقة واسعة. مناسب للعوائل الكبيرة ويقع في موقع هادئ.',
  550000,
  'USD',
  'house',
  'for-sale',
  33.3450,
  44.4000,
  'حي الحارثية',
  'بغداد',
  'الحارثية',
  4,
  3,
  300,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  ARRAY[
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
  ],
  'فاطمة أحمد',
  '+964 773 456 7890'
),
(
  'شقة استديو في الأعظمية',
  'شقة صغيرة ومريحة مثالية للأفراد أو الأزواج الجدد. قريبة من جميع الخدمات.',
  400,
  'USD',
  'apartment',
  'for-rent',
  33.3700,
  44.3850,
  'شارع الأعظمية الرئيسي',
  'بغداد',
  'الأعظمية',
  1,
  1,
  60,
  false,
  true,
  true,
  true,
  false,
  false,
  false,
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
  ],
  'عمر سعيد',
  '+964 774 567 8901'
),
(
  'أرض سكنية في اليرموك',
  'قطعة أرض مميزة في موقع استراتيجي، مناسبة للبناء السكني أو الاستثماري.',
  320000,
  'USD',
  'land',
  'for-sale',
  33.3200,
  44.3500,
  'حي اليرموك',
  'بغداد',
  'اليرموك',
  0,
  0,
  250,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
  ],
  'حسين علي',
  '+964 775 678 9012'
),
(
  'محل تجاري في الكاظمية',
  'محل واسع على شارع رئيسي، مناسب لجميع أنواع الأنشطة التجارية.',
  1740000,
  'IQD',
  'commercial',
  'for-rent',
  33.3810,
  44.3440,
  'شارع الكاظمية الرئيسي',
  'بغداد',
  'الكاظمية',
  0,
  1,
  80,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  ARRAY[
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
  ],
  'كريم جاسم',
  '+964 776 789 0123'
),
(
  'شقة راقية في الصليخ',
  'شقة حديثة ومجهزة بالكامل في برج سكني فاخر مع جميع المرافق.',
  380000,
  'USD',
  'apartment',
  'for-sale',
  33.3600,
  44.3700,
  'حي الصليخ',
  'بغداد',
  'الصليخ',
  2,
  2,
  140,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260066-6bc2c9f89d9c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
  ],
  'نور الهدى',
  '+964 777 890 1234'
);

-- ============================================
-- استعلامات التحقق
-- ============================================

-- التحقق من إنشاء الجداول بنجاح
SELECT 'تم إنشاء الجداول بنجاح' AS status;

-- عدد العقارات
SELECT COUNT(*) AS عدد_العقارات FROM properties;

-- عرض العقارات
SELECT 
  id,
  title,
  price,
  currency,
  type,
  status,
  city,
  neighborhood,
  bedrooms,
  bathrooms
FROM properties
ORDER BY created_at DESC;
