import { useRouter } from 'expo-router';
import { Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

export default function DeleteAccountInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Trash2 size={48} color={Colors.error} />
          </View>
          <Text style={styles.title}>حذف الحساب والبيانات</Text>
          <Text style={styles.subtitle}>
            تطبيق العقارات - Real Estate App
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>نظرة عامة</Text>
          </View>
          <Text style={styles.text}>
            يمكنك طلب حذف حسابك وجميع البيانات المرتبطة به في أي وقت. نحن ملتزمون بحماية خصوصيتك وحقك في التحكم ببياناتك.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={24} color={Colors.success} />
            <Text style={styles.sectionTitle}>خطوات حذف الحساب</Text>
          </View>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>افتح التطبيق</Text>
                <Text style={styles.stepText}>قم بتشغيل تطبيق العقارات على جهازك</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>انتقل إلى الملف الشخصي</Text>
                <Text style={styles.stepText}>اضغط على أيقونة الملف الشخصي في أسفل الشاشة</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>اضغط على &quot;حذف الحساب&quot;</Text>
                <Text style={styles.stepText}>ستجد زر &quot;حذف الحساب&quot; في أسفل صفحة الملف الشخصي</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>أكد الحذف</Text>
                <Text style={styles.stepText}>قم بتأكيد رغبتك في حذف الحساب عبر النافذة التي ستظهر</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trash2 size={24} color={Colors.error} />
            <Text style={styles.sectionTitle}>البيانات التي سيتم حذفها</Text>
          </View>
          <Text style={styles.text}>
            عند حذف حسابك، سيتم حذف جميع البيانات التالية بشكل دائم:
          </Text>
          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <View style={styles.bullet} />
              <Text style={styles.dataText}>معلومات الحساب (الاسم، البريد الإلكتروني، رقم الهاتف)</Text>
            </View>
            <View style={styles.dataItem}>
              <View style={styles.bullet} />
              <Text style={styles.dataText}>جميع العقارات التي قمت بإضافتها</Text>
            </View>
            <View style={styles.dataItem}>
              <View style={styles.bullet} />
              <Text style={styles.dataText}>قائمة المفضلة الخاصة بك</Text>
            </View>
            <View style={styles.dataItem}>
              <View style={styles.bullet} />
              <Text style={styles.dataText}>الفلاتر والتفضيلات المحفوظة</Text>
            </View>
            <View style={styles.dataItem}>
              <View style={styles.bullet} />
              <Text style={styles.dataText}>سجل النشاط والتفاعلات</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color={Colors.warning} />
            <Text style={styles.sectionTitle}>فترة الاحتفاظ</Text>
          </View>
          <Text style={styles.text}>
            يتم حذف جميع بياناتك <Text style={styles.highlight}>فوراً وبشكل دائم</Text> عند تأكيد الحذف. لا نحتفظ بأي نسخ احتياطية بعد حذف الحساب.
          </Text>
          <View style={styles.warningBox}>
            <AlertCircle size={20} color={Colors.error} />
            <Text style={styles.warningText}>
              تحذير: لا يمكن التراجع عن هذا الإجراء. تأكد من نسخ أي بيانات مهمة قبل الحذف.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>تحتاج مساعدة؟</Text>
          </View>
          <Text style={styles.text}>
            إذا واجهت أي مشاكل في حذف حسابك أو لديك أسئلة إضافية، يمكنك التواصل معنا عبر:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>البريد الإلكتروني: support@realestate.app</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>العودة</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  highlight: {
    fontWeight: 'bold' as const,
    color: Colors.error,
  },
  stepsList: {
    marginTop: 16,
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  dataList: {
    marginTop: 16,
    gap: 12,
  },
  dataItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
    marginTop: 8,
  },
  dataText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.error,
    fontWeight: '500' as const,
  },
  contactInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  backButton: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
