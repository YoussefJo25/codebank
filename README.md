# CodeBank

مكتبتك الشخصية لتنظيم حلول مسائل الـ competitive programming، وتصديرها كمرجع PDF احترافي.

## الميزات

- شريط جانبي بفولدرات ومسائل (CRUD كامل مع تأكيد قبل الحذف).
- محرر أكواد بصياغة ملوّنة حقيقية (CodeMirror) — C++, Python, Java, JavaScript.
- تبويب شرح بصيغة Markdown مع معاينة حية.
- بيانات المسألة: عنوان، تاجز، درجة تعقيد، وToggle لتضمينها في التصدير.
- تصدير PDF احترافي: غلاف، فهرس (TOC) تلقائي، عمود واحد أو عمودين، تحكم في حجم الخط والورقة، ترقيم صفحات ورأس صفحة اختياريين — لكل المرجع أو لمسألة واحدة.
- حفظ تلقائي بالكامل في localStorage، بالإضافة لزرّي Backup/Restore بصيغة JSON لنقل البيانات بين الأجهزة.
- واجهة عربية RTL بالكامل، تصميم داكن مستوحى من أدوات المطورين.

## التشغيل محليًا

```bash
npm install
npm run dev
```

الموقع هيفتح على `http://localhost:5173`.

## البناء للإنتاج

```bash
npm run build
```

الناتج بيتحط في مجلد `dist/` — ملفات static بالكامل، جاهزة للنشر على أي static host.

## النشر (Vercel / Netlify)

المشروع frontend بالكامل من غير باك إند، فمفيش إعدادات سيرفر خاصة مطلوبة:

- **Vercel**: `vercel.com` → Import Project → اختار الريبو → Framework Preset: Vite (بيتكشف تلقائيًا) → Deploy.
- **Netlify**: `netlify.com` → Add new site → Import from Git → Build command: `npm run build`، Publish directory: `dist` → Deploy.

## التقنيات

React + TypeScript + Vite + Tailwind CSS v4 + Zustand + CodeMirror 6 + pdfmake.
