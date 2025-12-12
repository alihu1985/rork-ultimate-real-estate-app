import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
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

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowRight size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سياسة الخصوصية</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. المقدمة</Text>
          <Text style={styles.sectionText}>
            نحن ملتزمون بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام تطبيقنا.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. المعلومات التي نجمعها</Text>
          <Text style={styles.sectionText}>
            نقوم بجمع المعلومات التالية عند استخدامك للتطبيق:
          </Text>
          <Text style={styles.bulletPoint}>• الاسم الكامل</Text>
          <Text style={styles.bulletPoint}>• البريد الإلكتروني</Text>
          <Text style={styles.bulletPoint}>• معلومات العقارات التي تضيفها</Text>
          <Text style={styles.bulletPoint}>• المفضلات والإعدادات الخاصة بك</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. كيفية استخدام المعلومات</Text>
          <Text style={styles.sectionText}>
            نستخدم المعلومات التي نجمعها للأغراض التالية:
          </Text>
          <Text style={styles.bulletPoint}>• تقديم وتحسين خدماتنا</Text>
          <Text style={styles.bulletPoint}>• التواصل معك بشأن حسابك</Text>
          <Text style={styles.bulletPoint}>• تخصيص تجربتك في التطبيق</Text>
          <Text style={styles.bulletPoint}>• ضمان أمان وسلامة التطبيق</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. مشاركة المعلومات</Text>
          <Text style={styles.sectionText}>
            نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية. قد نشارك معلوماتك فقط في الحالات التالية:
          </Text>
          <Text style={styles.bulletPoint}>• عندما يكون ذلك مطلوباً بموجب القانون</Text>
          <Text style={styles.bulletPoint}>• لحماية حقوقنا وسلامة المستخدمين</Text>
          <Text style={styles.bulletPoint}>• مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل التطبيق</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. أمان البيانات</Text>
          <Text style={styles.sectionText}>
            نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو الاستخدام أو الكشف. نستخدم تقنيات التشفير والبروتوكولات الآمنة لحماية بياناتك.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. حقوقك</Text>
          <Text style={styles.sectionText}>
            لديك الحق في:
          </Text>
          <Text style={styles.bulletPoint}>• الوصول إلى معلوماتك الشخصية</Text>
          <Text style={styles.bulletPoint}>• تصحيح أو تحديث معلوماتك</Text>
          <Text style={styles.bulletPoint}>• حذف حسابك ومعلوماتك</Text>
          <Text style={styles.bulletPoint}>• الاعتراض على معالجة بياناتك</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. ملفات تعريف الارتباط</Text>
          <Text style={styles.sectionText}>
            نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لتحسين تجربتك وتحليل استخدام التطبيق. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال إعدادات جهازك.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. خصوصية الأطفال</Text>
          <Text style={styles.sectionText}>
            تطبيقنا غير موجه للأطفال دون سن 13 عاماً. لا نجمع معلومات شخصية عن قصد من الأطفال. إذا علمنا أننا جمعنا معلومات من طفل، سنحذفها فوراً.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. التغييرات على سياسة الخصوصية</Text>
          <Text style={styles.sectionText}>
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ آخر تحديث.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. اتصل بنا</Text>
          <Text style={styles.sectionText}>
            إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
          </Text>
          <Text style={styles.bulletPoint}>• البريد الإلكتروني: support@example.com</Text>
          <Text style={styles.bulletPoint}>• الهاتف: +966 XX XXX XXXX</Text>
        </View>

        <View style={styles.acceptanceSection}>
          <Text style={styles.acceptanceText}>
            باستخدام تطبيقنا، فإنك توافق على شروط سياسة الخصوصية هذه.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'right',
  },
  sectionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'right',
    paddingRight: 12,
    marginBottom: 4,
  },
  acceptanceSection: {
    backgroundColor: Colors.primaryLight + '20',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  acceptanceText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
