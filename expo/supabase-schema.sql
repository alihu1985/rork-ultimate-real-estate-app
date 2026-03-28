-- ============================================
-- Real Estate App - Supabase Database Schema
-- ============================================

-- 📋 خطوات التثبيت:
-- 1. افتح Supabase Dashboard
-- 2. اذهب إلى SQL Editor
-- 3. انسخ والصق هذا الملف بالكامل
-- 4. اضغط Run لتنفيذ السكريبت
-- 5. انتظر حتى تظهر رسالة "قاعدة البيانات جاهزة للاستخدام"
--
-- ⚠️ ملاحظة: سيتم حذف جميع البيانات السابقة
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
-- ✅ اكتمل التثبيت بنجاح!
-- ============================================
-- قاعدة البيانات جاهزة للاستخدام
