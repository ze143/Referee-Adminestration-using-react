import { useState } from 'react'
import { Plus, Trash2, Search, Edit } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Table from '@/components/ui/Table'
import { toast } from 'sonner'

export default function TestComponents() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // بيانات تجريبية للجدول
  const testData = [
    { id: 1, name: 'محمد أحمد', degree: '1st', status: true },
    { id: 2, name: 'علي حسن', degree: '2nd', status: false },
    { id: 3, name: 'أحمد محمود', degree: 'International', status: true },
  ]

  const columns = [
    { header: 'الاسم', accessor: (row) => <strong>{row.name}</strong> },
    {
      header: 'الدرجة',
      accessor: (row) => <Badge variant="info">{row.degree}</Badge>,
    },
    {
      header: 'الحالة',
      accessor: (row) => (
        <Badge variant={row.status ? 'success' : 'danger'}>
          {row.status ? 'نشط' : 'موقوف'}
        </Badge>
      ),
    },
    {
      header: 'الإجراءات',
      accessor: () => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleTestLoading = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('تم التحميل!')
    }, 2000)
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gold-500 mb-2">
          🧪 اختبار المكونات
        </h1>
        <p className="text-white/60">
          لو كل حاجة ظاهرة صح، المكونات شغالة
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">1. الأزرار</h2>
        <div className="flex flex-wrap gap-3">
          <Button>أساسي</Button>
          <Button variant="secondary">ثانوي</Button>
          <Button variant="success">نجاح</Button>
          <Button variant="danger">خطر</Button>
          <Button variant="warning">تحذير</Button>
          <Button variant="ghost">شبح</Button>
          <Button variant="outline">محدد</Button>
          <Button icon={Plus}>إضافة</Button>
          <Button loading>جاري...</Button>
          <Button disabled>معطل</Button>
        </div>
      </Card>

      {/* Inputs */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">2. المدخلات</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="الاسم" placeholder="اكتب اسمك" />
          <Input
            label="بحث"
            placeholder="ابحث..."
            icon={Search}
          />
          <Input
            label="بريد"
            placeholder="test@test.com"
            error="البريد غير صحيح"
          />
          <Select label="الدرجة">
            <option value="">اختر الدرجة</option>
            <option value="1st">درجة أولى</option>
            <option value="2nd">درجة ثانية</option>
          </Select>
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">3. الشارات</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>أساسي</Badge>
          <Badge variant="success">نجاح</Badge>
          <Badge variant="warning">تحذير</Badge>
          <Badge variant="danger">خطر</Badge>
          <Badge variant="info">معلومات</Badge>
          <Badge variant="gold">ذهبي</Badge>
          <Badge variant="gray">رمادي</Badge>
        </div>
      </Card>

      {/* Modal + Confirm */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">4. النوافذ</h2>
        <div className="flex gap-3">
          <Button onClick={() => setModalOpen(true)}>فتح Modal</Button>
          <Button
            variant="danger"
            onClick={() => setConfirmOpen(true)}
          >
            فتح Confirm
          </Button>
        </div>
      </Card>

      {/* Spinner */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">5. التحميل</h2>
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Button onClick={handleTestLoading} loading={loading}>
            اختبر التحميل
          </Button>
        </div>
      </Card>

      {/* Empty State */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">6. حالة فاضية</h2>
        <EmptyState
          title="لا يوجد حكام"
          description="لم يتم إضافة أي حكام بعد. اضغط إضافة للبدء."
          action={
            <Button icon={Plus}>إضافة حكم</Button>
          }
        />
      </Card>

      {/* Table */}
      <Card>
        <h2 className="text-xl font-bold text-gold-500 mb-4">7. الجدول</h2>
        <Table columns={columns} data={testData} />
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="نافذة تجريبية"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={() => setModalOpen(false)}>حفظ</Button>
          </>
        }
      >
        <p className="text-white/70">
          دي نافذة تجريبية عشان نتأكد إن الـ Modal شغال. جرب اضغط Esc
          أو برة النافذة عشان تقفلها.
        </p>
      </Modal>

      {/* Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          toast.success('تم التأكيد!')
        }}
        title="حذف الحكم"
        message="هل أنت متأكد من حذف هذا الحكم؟ لا يمكن التراجع."
        confirmText="نعم، احذف"
      />
    </div>
  )
}