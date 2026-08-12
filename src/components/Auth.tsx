import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./common/Button";
import { Library, Loader2 } from "lucide-react";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [academicStatus, setAcademicStatus] = useState("طالب");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");

  const validateSignUp = () => {
    if (!fullName.trim()) return "الرجاء إدخال الاسم بالكامل.";
    if (!email.trim()) return "الرجاء إدخال البريد الإلكتروني.";
    if (!password.trim()) return "الرجاء إدخال كلمة المرور.";
    if (!phone.trim()) return "الرجاء إدخال رقم الهاتف.";
    if (academicStatus === "طالب") {
      if (!university.trim()) return "الرجاء إدخال اسم الجامعة.";
      if (!faculty.trim()) return "الرجاء إدخال اسم الكلية.";
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isLogin) {
      const errorMsg = validateSignUp();
      if (errorMsg) {
        setMessage({ type: "error", text: errorMsg });
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setMessage({ type: "error", text: "الرجاء إدخال البريد الإلكتروني وكلمة المرور." });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone_number: phone.trim(),
              gender,
              academic_status: academicStatus,
              university: academicStatus === "طالب" ? university.trim() : null,
              faculty: academicStatus === "طالب" ? faculty.trim() : null,
            },
          },
        });
        if (error) throw error;
        setMessage({ type: "success", text: "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني (إن لزم الأمر) أو تسجيل الدخول." });
        setIsLogin(true);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء المصادقة" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto flex flex-col items-center justify-start py-12 px-4 bg-ink-900">
      <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl h-auto my-auto">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-ember-500/15 text-ember-400">
            <Library size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold text-mist-100">CodeBank</h1>
        </div>

        {/* Toggle navigation */}
        <div className="flex mb-6 rounded-lg bg-ink-900 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${isLogin ? 'bg-ink-700 text-white shadow-sm' : 'text-mist-400 hover:text-mist-200'}`}
            onClick={() => { setIsLogin(true); setMessage(null); }}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${!isLogin ? 'bg-ink-700 text-white shadow-sm' : 'text-mist-400 hover:text-mist-200'}`}
            onClick={() => { setIsLogin(false); setMessage(null); }}
          >
            إنشاء حساب
          </button>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          
          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist-300">الاسم بالكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
                placeholder="أحمد محمود"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist-300">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist-300">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-mist-300">رقم الهاتف</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-mist-300">النوع</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
                  >
                    <option value="Male">ذكر</option>
                    <option value="Female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-mist-300">الحالة الدراسية</label>
                  <select
                    value={academicStatus}
                    onChange={(e) => setAcademicStatus(e.target.value)}
                    className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
                  >
                    <option value="طالب">طالب</option>
                    <option value="خريج">خريج</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              {academicStatus === "طالب" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-mist-300">الجامعة</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
                      placeholder="Minya National University"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-mist-300">الكلية</label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500 transition-all"
                      placeholder="Faculty of Computers and Artificial Intelligence"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {message && (
            <div
              className={`rounded-lg p-3 text-sm leading-relaxed ${
                message.type === "error" ? "bg-coral-500/10 text-coral-400" : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full justify-center py-2.5">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                جاري التحميل...
              </span>
            ) : isLogin ? (
              "تسجيل الدخول"
            ) : (
              "إنشاء حساب"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
