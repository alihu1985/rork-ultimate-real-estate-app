import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import { User, AuthMethod } from '@/types/auth';
import { supabase } from '@/lib/supabase';

const USER_KEY = 'user';

interface LoginCredentials {
  method: AuthMethod;
  value: string;
  password: string;
}

interface SignupCredentials {
  method: AuthMethod;
  value: string;
  password: string;
  name: string;
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (!stored) return null;
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing user data:', error);
        await AsyncStorage.removeItem(USER_KEY);
        return null;
      }
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async (newUser: User | null) => {
      if (newUser) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
      return newUser;
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('🔐 محاولة تسجيل الدخول:', {
        method: credentials.method,
        email: credentials.value,
        hasPassword: !!credentials.password,
      });
      
      if (credentials.method === 'phone') {
        throw new Error('تسجيل الدخول برقم الهاتف غير مدعوم حالياً. الرجاء استخدام البريد الإلكتروني.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.value,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ خطأ في تسجيل الدخول:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        
        if (error.message === 'Invalid login credentials') {
          throw new Error(
            'البريد الإلكتروني أو كلمة المرور غير صحيحة.\n\n' +
            'تأكد من:\n' +
            '• البريد الإلكتروني صحيح\n' +
            '• كلمة المرور صحيحة\n' +
            '• إذا لم يكن لديك حساب، اضغط على "إنشاء حساب جديد"'
          );
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('لم يتم تأكيد البريد الإلكتروني. الرجاء التحقق من بريدك الإلكتروني وتأكيد الحساب.');
        }
        
        throw new Error(error.message || 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
      }

      if (!data.user) {
        console.error('❌ لا توجد بيانات مستخدم بعد تسجيل الدخول');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      console.log('✅ تم تسجيل الدخول بنجاح:', {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at,
      });

      let profile = null;
      const { data: existingProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('⚠️ لم يتم العثور على ملف تعريف المستخدم، جاري الإنشاء:', profileError);
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: credentials.value,
            name: data.user.email?.split('@')[0] || 'مستخدم',
            user_type: 'user',
            role: 'user',
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ فشل إنشاء ملف التعريف:', createError);
        } else {
          console.log('✅ تم إنشاء ملف التعريف بنجاح');
          profile = newProfile;
        }
      } else {
        profile = existingProfile;
      }

      const newUser: User = {
        id: data.user.id,
        type: 'user',
        role: profile?.role || 'user',
        email: data.user.email || credentials.value,
        name: profile?.name || data.user.email?.split('@')[0] || 'مستخدم',
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      console.log('👤 بيانات المستخدم النهائية:', newUser);

      return newUser;
    },
    onSuccess: (newUser) => {
      setUser(newUser);
      saveUserMutation.mutate(newUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      Alert.alert('خطأ في تسجيل الدخول', error.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      console.log('📝 محاولة إنشاء حساب:', {
        method: credentials.method,
        email: credentials.value,
        name: credentials.name,
      });
      
      if (credentials.method === 'phone') {
        throw new Error('التسجيل برقم الهاتف غير مدعوم حالياً. الرجاء استخدام البريد الإلكتروني.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.value,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) {
        console.error('❌ خطأ في إنشاء الحساب:', error);
        
        if (error.message.includes('already registered')) {
          throw new Error('البريد الإلكتروني مسجل مسبقاً. الرجاء تسجيل الدخول أو استخدام بريد آخر.');
        }
        
        throw new Error(error.message || 'فشل إنشاء الحساب');
      }

      if (!data.user) {
        console.error('❌ لم يتم إنشاء المستخدم');
        throw new Error('لم يتم إنشاء الحساب');
      }

      console.log('✅ تم إنشاء الحساب بنجاح:', {
        id: data.user.id,
        email: data.user.email,
        needsConfirmation: !data.user.email_confirmed_at,
      });

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: credentials.value,
          name: credentials.name,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.warn('⚠️ خطأ في إنشاء ملف التعريف:', profileError);
      } else {
        console.log('✅ تم إنشاء ملف التعريف بنجاح');
      }

      const newUser: User = {
        id: data.user.id,
        type: 'user',
        role: 'user',
        email: credentials.value,
        name: credentials.name,
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      if (!data.user.email_confirmed_at) {
        Alert.alert(
          'تم إنشاء الحساب',
          'تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.\n\nملاحظة: إذا طلب منك تأكيد البريد الإلكتروني، تحقق من صندوق الوارد.',
          [{ text: 'حسناً' }]
        );
      }

      return newUser;
    },
    onSuccess: (newUser) => {
      setUser(newUser);
      saveUserMutation.mutate(newUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Signup mutation error:', error);
      Alert.alert('خطأ في إنشاء الحساب', error.message);
    },
  });

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-' + Math.random().toString(36).substring(7),
      type: 'guest',
      name: 'ضيف',
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    saveUserMutation.mutate(guestUser);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    saveUserMutation.mutate(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isGuest: user?.type === 'guest',
    isUser: user?.type === 'user',
    isAdmin: user?.role === 'admin',
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    loginAsGuest,
    logout,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isLoading: userQuery.isLoading,
  };
});
