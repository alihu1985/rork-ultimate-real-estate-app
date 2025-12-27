import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Check, Crown, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import Colors from '@/constants/Colors';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const { tier, usage, limits, isLoading } = useSubscription();



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'الاشتراكات' }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'الاشتراكات',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>اختر الباقة المناسبة لك</Text>
          <Text style={styles.subtitle}>
            باقتك الحالية: {SUBSCRIPTION_PLANS.find(p => p.tier === tier)?.nameArabic || 'مجاني'}
          </Text>
        </View>

        {user && (
          <View style={styles.usageCard}>
            <Text style={styles.usageTitle}>استخدامك الحالي</Text>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>العقارات المضافة:</Text>
              <Text style={styles.usageValue}>
                {usage.propertiesAdded} / {limits.maxProperties === -1 ? '∞' : limits.maxProperties}
              </Text>
            </View>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>البحث بالذكاء الاصطناعي:</Text>
              <Text style={styles.usageValue}>
                {usage.aiSearchesUsed} / {limits.maxAiSearches === -1 ? '∞' : limits.maxAiSearches}
              </Text>
            </View>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>أرقام الهواتف المعروضة:</Text>
              <Text style={styles.usageValue}>
                {usage.phoneViewsUsed} / {limits.maxPhoneViews === -1 ? '∞' : limits.maxPhoneViews}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isCurrentPlan = plan.tier === tier;
            const Icon = plan.tier === 'free' ? Sparkles : plan.tier === 'premium' ? Check : Crown;

            return (
              <View
                key={plan.tier}
                style={[
                  styles.planCard,
                  isCurrentPlan && styles.currentPlanCard,
                ]}
              >
                {plan.tier === 'pro' && (
                  <LinearGradient
                    colors={['#FFD700', '#FFA500', '#FF8C00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                  />
                )}

                <View style={styles.planHeader}>
                  <View style={[
                    styles.iconContainer,
                    plan.tier === 'pro' && styles.proIcon,
                    plan.tier === 'premium' && styles.premiumIcon,
                  ]}>
                    <Icon 
                      size={28} 
                      color={plan.tier === 'free' ? Colors.primary : '#fff'} 
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={styles.planName}>{plan.nameArabic}</Text>
                  {isCurrentPlan && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>الحالي</Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceContainer}>
                  {plan.price > 0 ? (
                    <>
                      <Text style={styles.price}>${plan.price}</Text>
                      <Text style={styles.pricePeriod}>/ شهر</Text>
                    </>
                  ) : (
                    <Text style={styles.freeText}>مجاناً</Text>
                  )}
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Check size={18} color={Colors.success} strokeWidth={2.5} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

              </View>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>ملاحظة هامة:</Text>
          <Text style={styles.noteText}>
            • يتم تجديد حدود الاستخدام شهرياً{'\n'}
            • يمكنك الترقية في أي وقت{'\n'}
            • الأسعار بالدولار الأمريكي{'\n'}
            • الإعلانات المميزة تظهر في أعلى الصفحة الرئيسية
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  gradientBorder: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proIcon: {
    backgroundColor: '#FFD700',
  },
  premiumIcon: {
    backgroundColor: Colors.primary,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: Colors.text,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  freeText: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.success,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },

  noteCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
