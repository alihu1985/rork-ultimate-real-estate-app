import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { 
  SubscriptionTier, 
  SUBSCRIPTION_LIMITS, 
  UserSubscription, 
  UserUsage,
  SUBSCRIPTION_PLANS 
} from '@/types/subscription';

export const [SubscriptionContext, useSubscription] = createContextHook(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('Fetching subscription for user:', user.id);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          console.error('❌ الجداول غير موجودة في قاعدة البيانات');
          console.error('يرجى تنفيذ ملف supabase-schema.sql في Supabase SQL Editor');
          throw new Error('يرجى تنفيذ ملف supabase-schema.sql في قاعدة البيانات أولاً');
        }
        if (error.code === 'PGRST116') {
          console.log('No active subscription found, creating free tier...');
          
          const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!userExists) {
            console.log('User not found in database, creating user record...');
            const { error: userCreateError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.name || 'مستخدم',
                user_type: user.type || 'user',
                role: user.role || 'user',
              });

            if (userCreateError) {
              console.error('Error creating user:', userCreateError);
              return {
                id: 'temp-id',
                userId: user.id,
                tier: 'free' as SubscriptionTier,
                startDate: new Date().toISOString(),
                endDate: null,
                isActive: true,
              } as UserSubscription;
            }
          }

          const { data: newSub, error: createError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              tier: 'free',
              is_active: true,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating subscription:', {
              message: createError.message,
              code: createError.code,
              details: createError.details,
            });
            if (createError.code === 'PGRST205') {
              throw new Error('يرجى تنفيذ ملف supabase-schema.sql في قاعدة البيانات أولاً');
            }
            return {
              id: 'temp-id',
              userId: user.id,
              tier: 'free' as SubscriptionTier,
              startDate: new Date().toISOString(),
              endDate: null,
              isActive: true,
            } as UserSubscription;
          }

          return {
            id: newSub.id,
            userId: newSub.user_id,
            tier: newSub.tier as SubscriptionTier,
            startDate: newSub.start_date,
            endDate: newSub.end_date,
            isActive: newSub.is_active,
          } as UserSubscription;
        }
        console.error('Error fetching subscription:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        return {
          id: 'temp-id',
          userId: user.id,
          tier: 'free' as SubscriptionTier,
          startDate: new Date().toISOString(),
          endDate: null,
          isActive: true,
        } as UserSubscription;
      }

      return {
        id: data.id,
        userId: data.user_id,
        tier: data.tier as SubscriptionTier,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
      } as UserSubscription;
    },
    enabled: !!user?.id,
  });

  const usageQuery = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('Fetching usage for user:', user.id);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', startOfMonth.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          console.error('❌ الجداول غير موجودة في قاعدة البيانات');
          console.error('يرجى تنفيذ ملف supabase-schema.sql في Supabase SQL Editor');
          throw new Error('يرجى تنفيذ ملف supabase-schema.sql في قاعدة البيانات أولاً');
        }
        if (error.code === 'PGRST116') {
          console.log('No usage record found, creating one...');
          
          const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!userExists) {
            console.log('User not found in database, creating user record...');
            const { error: userCreateError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.name || 'مستخدم',
                user_type: user.type || 'user',
                role: user.role || 'user',
              });

            if (userCreateError) {
              console.error('Error creating user:', userCreateError);
              return {
                id: 'temp-id',
                userId: user.id,
                propertiesAdded: 0,
                aiSearchesUsed: 0,
                phoneViewsUsed: 0,
                periodStart: startOfMonth.toISOString(),
                periodEnd: null,
              } as UserUsage;
            }
          }

          const { data: newUsage, error: createError } = await supabase
            .from('user_usage')
            .insert({
              user_id: user.id,
              properties_added: 0,
              ai_searches_used: 0,
              phone_views_used: 0,
              period_start: startOfMonth.toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating usage:', {
              message: createError.message,
              code: createError.code,
              details: createError.details,
            });
            if (createError.code === 'PGRST205') {
              throw new Error('يرجى تنفيذ ملف supabase-schema.sql في قاعدة البيانات أولاً');
            }
            return {
              id: 'temp-id',
              userId: user.id,
              propertiesAdded: 0,
              aiSearchesUsed: 0,
              phoneViewsUsed: 0,
              periodStart: startOfMonth.toISOString(),
              periodEnd: null,
            } as UserUsage;
          }

          return {
            id: newUsage.id,
            userId: newUsage.user_id,
            propertiesAdded: newUsage.properties_added,
            aiSearchesUsed: newUsage.ai_searches_used,
            phoneViewsUsed: newUsage.phone_views_used,
            periodStart: newUsage.period_start,
            periodEnd: newUsage.period_end,
          } as UserUsage;
        }
        console.error('Error fetching usage:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        return {
          id: 'temp-id',
          userId: user.id,
          propertiesAdded: 0,
          aiSearchesUsed: 0,
          phoneViewsUsed: 0,
          periodStart: startOfMonth.toISOString(),
          periodEnd: null,
        } as UserUsage;
      }

      return {
        id: data.id,
        userId: data.user_id,
        propertiesAdded: data.properties_added,
        aiSearchesUsed: data.ai_searches_used,
        phoneViewsUsed: data.phone_views_used,
        periodStart: data.period_start,
        periodEnd: data.period_end,
      } as UserUsage;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (subscriptionQuery.data?.tier) {
      setCurrentTier(subscriptionQuery.data.tier);
    }
  }, [subscriptionQuery.data]);

  const upgradeMutation = useMutation({
    mutationFn: async (newTier: SubscriptionTier) => {
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      if (user.type === 'guest') throw new Error('لا يمكن للضيوف الترقية. يرجى إنشاء حساب أولاً.');

      console.log('Upgrading subscription to:', newTier);

      const { data: userExists, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError || !userExists) {
        console.error('❌ المستخدم غير موجود في قاعدة البيانات');
        throw new Error('المستخدم غير موجود في قاعدة البيانات. يرجى تسجيل الخروج وإعادة تسجيل الدخول.');
      }

      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (updateError) {
        console.error('Error deactivating old subscriptions:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        if (updateError.code === 'PGRST205') {
          throw new Error('يرجى تنفيذ ملف supabase-schema.sql في قاعدة البيانات أولاً. الجداول المطلوبة غير موجودة.');
        }
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.tier === newTier);
      const endDate = plan && plan.duration > 0 
        ? new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          tier: newTier,
          is_active: true,
          end_date: endDate,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        if (error.code === 'PGRST205') {
          throw new Error('يرجى تنفيذ ملف supabase-schema.sql في قاعدة البيانات أولاً. الجداول المطلوبة غير موجودة.');
        }
        throw new Error(error.message || 'فشل في إنشاء الاشتراك');
      }

      return {
        id: data.id,
        userId: data.user_id,
        tier: data.tier as SubscriptionTier,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
      } as UserSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
  });

  const incrementUsageMutation = useMutation({
    mutationFn: async ({ 
      field 
    }: { 
      field: 'propertiesAdded' | 'aiSearchesUsed' | 'phoneViewsUsed' 
    }) => {
      if (!user?.id || !usageQuery.data?.id) throw new Error('No usage data');

      console.log('Incrementing usage:', field);

      const fieldMap = {
        propertiesAdded: 'properties_added',
        aiSearchesUsed: 'ai_searches_used',
        phoneViewsUsed: 'phone_views_used',
      };

      const dbField = fieldMap[field];
      const currentValue = usageQuery.data[field];

      const { data, error } = await supabase
        .from('user_usage')
        .update({ [dbField]: currentValue + 1 })
        .eq('id', usageQuery.data.id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        propertiesAdded: data.properties_added,
        aiSearchesUsed: data.ai_searches_used,
        phoneViewsUsed: data.phone_views_used,
        periodStart: data.period_start,
        periodEnd: data.period_end,
      } as UserUsage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage', user?.id] });
    },
  });

  const limits = SUBSCRIPTION_LIMITS[currentTier];
  const usage = usageQuery.data || {
    propertiesAdded: 0,
    aiSearchesUsed: 0,
    phoneViewsUsed: 0,
  };

  const canAddProperty = limits.maxProperties === -1 || usage.propertiesAdded < limits.maxProperties;
  const canUseAiSearch = limits.maxAiSearches === -1 || usage.aiSearchesUsed < limits.maxAiSearches;
  const canViewPhone = limits.maxPhoneViews === -1 || usage.phoneViewsUsed < limits.maxPhoneViews;

  return {
    subscription: subscriptionQuery.data,
    usage,
    tier: currentTier,
    limits,
    canAddProperty,
    canUseAiSearch,
    canViewPhone,
    hasAds: limits.hasAds,
    featuredDays: limits.featuredDays,
    isLoading: subscriptionQuery.isLoading || usageQuery.isLoading,
    upgradeTo: upgradeMutation.mutateAsync,
    incrementPropertyCount: () => incrementUsageMutation.mutateAsync({ field: 'propertiesAdded' }),
    incrementAiSearchCount: () => incrementUsageMutation.mutateAsync({ field: 'aiSearchesUsed' }),
    incrementPhoneViewCount: () => incrementUsageMutation.mutateAsync({ field: 'phoneViewsUsed' }),
    isUpgrading: upgradeMutation.isPending,
  };
});
