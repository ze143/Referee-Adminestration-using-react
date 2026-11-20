// ============================================
// الثوابت — كل القيم الثابتة في المشروع
// ============================================

// درجات الحكام
export const DEGREES = [
  { value: '1st', label: 'درجة أولى' },
  { value: '2nd', label: 'درجة ثانية' },
  { value: '3rd', label: 'درجة ثالثة' },
  { value: 'International', label: 'دولي' },
  { value: 'New', label: 'جدد' },
]

// وظائف الحكام
export const JOBS = [
  { value: 'referee', label: 'حكم' },
  { value: 'assistant', label: 'حكم مساعد' },
  { value: 'both', label: 'حكم ومساعد' },
]

// أدوار الحكام في المباراة
export const ROLES = [
  { value: 'main', label: 'رئيسي' },
  { value: 'assistant1', label: 'مساعد أول' },
  { value: 'assistant2', label: 'مساعد ثاني' },
  { value: 'fourth', label: 'رابع' },
  { value: 'var', label: 'VAR' },
  { value: 'avar', label: 'AVAR' },
]

// المناطق (محافظات مصر)
export const REGIONS = [
  'القاهره', 'الجيزه', 'الاسكندرية', 'الشرقيه', 'الدقهليه',
  'البحيرة', 'الغربيه', 'المنوفيه', 'القليوبيه', 'سوهاج',
  'اسيوط', 'الأقصر', 'اسوان', 'بورسعيد', 'السويس',
  'الاسماعيليه', 'الفيوم', 'بنى سويف', 'المنيا', 'قنا',
  'دمياط', 'كفر الشيخ', 'سيناء', 'الوادي الجديد',
  'البحر الأحمر', 'مطروح',
].map((r) => ({ value: r, label: r }))

// حالة الحكم
export const REFEREE_STATUS = [
  { value: 'active', label: 'نشط' },
  { value: 'suspended', label: 'موقوف' },
]

// helper: جلب label من value
export const getLabel = (list, value) =>
  list.find((item) => item.value === value)?.label || value