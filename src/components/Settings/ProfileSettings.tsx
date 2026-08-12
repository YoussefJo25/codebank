import { useState, useRef, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { updateProfile, uploadAvatar } from "../../services/profileService";
import { Button } from "../common/Button";
import { Camera, Loader2 } from "lucide-react";

export function ProfileSettings() {
  const user = useStore((s) => s.user);
  const userProfile = useStore((s) => s.userProfile);
  const loadUserProfile = useStore((s) => s.loadUserProfile);

  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [academicStatus, setAcademicStatus] = useState("طالب");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setPhone(userProfile.phone_number || "");
      setAcademicStatus(userProfile.academic_status || "طالب");
      setUniversity(userProfile.university || "");
      setFaculty(userProfile.faculty || "");
    } else if (user) {
      // Fallback if profile row is missing or failed to load
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone_number || "");
      setAcademicStatus(user.user_metadata?.academic_status || "طالب");
      setUniversity(user.user_metadata?.university || "");
      setFaculty(user.user_metadata?.faculty || "");
    }
  }, [userProfile, user]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-mist-500" size={24} />
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setMessage(null);

    try {
      const publicUrl = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { 
        avatar_url: publicUrl,
        full_name: fullName.trim(),
        phone_number: phone.trim(),
        academic_status: academicStatus,
        university: academicStatus === "طالب" ? university.trim() : null,
        faculty: academicStatus === "طالب" ? faculty.trim() : null,
      });
      await loadUserProfile(); // Refresh global state
      setMessage({ type: "success", text: "تم تحديث الصورة بنجاح!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل رفع الصورة." });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        phone_number: phone.trim(),
        academic_status: academicStatus,
        university: academicStatus === "طالب" ? university.trim() : null,
        faculty: academicStatus === "طالب" ? faculty.trim() : null,
      });
      await loadUserProfile(); // Refresh global state
      setMessage({ type: "success", text: "تم حفظ التعديلات بنجاح!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل حفظ التعديلات." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-mist-100">إعدادات الحساب</h1>
        <p className="mt-1 text-sm text-mist-400">يمكنك تحديث بياناتك الشخصية وصورتك من هنا.</p>
      </div>

      <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-sm">
        {/* Avatar Upload */}
        <div className="mb-8 flex flex-col items-center">
          <div 
            className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-ink-600 bg-ink-800 transition-colors hover:border-ember-500"
            onClick={handleAvatarClick}
          >
            {userProfile?.avatar_url || user.user_metadata?.avatar_url ? (
              <img 
                src={userProfile?.avatar_url || user.user_metadata?.avatar_url} 
                alt="Avatar" 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-mist-500">
                <span className="text-3xl uppercase">
                  {(userProfile?.full_name || user.user_metadata?.full_name || user.email || "?")[0]}
                </span>
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              {avatarUploading ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera className="text-white" size={24} />}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/gif, image/webp" 
            onChange={handleFileChange} 
          />
          <p className="mt-2 text-xs text-mist-500">اضغط لتغيير الصورة</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist-300">الاسم بالكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none transition-all focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist-300">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none transition-all focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist-300">الحالة الدراسية</label>
            <select
              value={academicStatus}
              onChange={(e) => setAcademicStatus(e.target.value)}
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none transition-all focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
            >
              <option value="طالب">طالب</option>
              <option value="خريج">خريج</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {academicStatus === "طالب" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-mist-300">الجامعة</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none transition-all focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-mist-300">الكلية</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ink-600 bg-ink-900 px-4 py-2.5 text-mist-200 outline-none transition-all focus:border-ember-500 focus:ring-1 focus:ring-ember-500"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-2 rounded-lg p-3 text-sm ${
              message.type === "error" ? "bg-coral-500/10 text-coral-400" : "bg-emerald-500/10 text-emerald-400"
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button type="submit" variant="primary" disabled={loading || avatarUploading} className="min-w-[120px] justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> جاري الحفظ...
                </span>
              ) : (
                "حفظ التعديلات"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
