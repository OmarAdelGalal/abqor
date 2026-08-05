'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { 
  UserPen, 
  MessageSquareHeart, 
  CreditCard, 
  Users, 
  HelpCircle, 
  Lock, 
  Star, 
  LogOut,
  ArrowLeft,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  Eye,
  EyeOff,
  BookOpen,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';

const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان", "تيميمون", "برج باجي مختار",
  "أولاد جلال", "بني عباس", "إن صالح", "إن قزام", "تقرت", "جانت", "المغير", "المنيعة"
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');
  const [educationLevel, setEducationLevel] = useState('');
  const [educationYear, setEducationYear] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Dropdown Data
  const [educationLevels, setEducationLevels] = useState<any[]>([]);
  const [educationYears, setEducationYears] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getUserProfile();
      if (data) {
        const profile = data.profile || data;
        setName(profile.name || '');
        setEmail(profile.email || '');
        setOriginalEmail(profile.email || '');
        setPhone(profile.phone || '');
        setGender(profile.gender || 'male');
        setEducationLevel(profile.education_level_id?.toString() || '');
        setEducationYear(profile.education_year_id?.toString() || '');
        setWilaya(profile.state || '');
        setAvatar(profile.avatar ? `https://mrstudy.net/storage/${profile.avatar}` : (user?.avatar || "/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png"));
        
        setEducationLevels(data.education_levels || []);
        setEducationYears(data.education_years || []);
      }
    } catch (error) {
      console.error("Failed to fetch profile info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('avatar', file);
      
      setAvatarUploading(true);
      try {
        const res = await authApi.changeAvatar(formData);
        if (res.avatar) {
          setAvatar(`https://mrstudy.net/storage/${res.avatar}`);
          alert('تم تحديث الصورة بنجاح');
        }
      } catch (error: any) {
        alert(error?.message || 'فشل رفع الصورة');
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name || !phone || !gender || !wilaya || !educationLevel || !educationYear) {
      alert('يرجى ملء جميع الحقول الإجبارية');
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateProfile({
        name,
        phone,
        gender,
        state: wilaya,
        education_level_id: Number(educationLevel),
        education_year_id: Number(educationYear)
      });

      if (oldPassword && newPassword) {
        await authApi.changePassword({
          password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: newPassword
        });
        setOldPassword('');
        setNewPassword('');
      }

      if (email !== originalEmail) {
        await authApi.changeEmail(email);
        setShowOtpModal(true);
      } else {
        alert('تم الحفظ بنجاح');
        fetchProfile();
      }

    } catch (error: any) {
      alert(error?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    try {
      await authApi.verifyEmailChange(email, otpCode);
      alert('تم تحديث البريد الإلكتروني بنجاح');
      setShowOtpModal(false);
      setOriginalEmail(email);
      setOtpCode('');
      fetchProfile();
    } catch (error: any) {
      alert(error?.message || 'رمز التحقق غير صحيح');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await authApi.deleteAccount();
        logout();
        router.push('/login');
      } catch (error: any) {
        alert(error?.message || 'حدث خطأ أثناء حذف الحساب');
      }
    }
  };

  const menuItems = [
    { title: 'تعديل الحساب', icon: <UserPen className="w-5 h-5" />, href: '/profile/edit', color: 'text-orange-500' },
    { title: 'آراء التلاميذ', icon: <MessageSquareHeart className="w-5 h-5" />, href: '/reviews', color: 'text-yellow-500' },
    { title: 'الاشتراكات', icon: <CreditCard className="w-5 h-5" />, href: '/subscriptions', color: 'text-blue-500' },
    { title: 'من نحن', icon: <Users className="w-5 h-5" />, href: '/about', color: 'text-slate-700' },
    { title: 'الأسئلة الأكثر تداولاً', icon: <HelpCircle className="w-5 h-5" />, href: '/faq', color: 'text-orange-400' },
    { title: 'الشروط و الأحكام', icon: <Lock className="w-5 h-5" />, href: '/terms', color: 'text-amber-500' },
    { title: 'تقييم التطبيق', icon: <Star className="w-5 h-5" />, href: '/rate', color: 'text-yellow-400' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <AuthenticatedHeader />
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#45B7C7] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* RIGHT COLUMN - MENU */}
          <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1">
            <div className="mb-2 px-2 text-right">
              <h3 className="text-gray-400 font-medium text-sm">حسابي</h3>
            </div>
            
            <div className="bg-gray-50/50 rounded-3xl p-3 flex flex-col gap-1">
              {menuItems.map((item, idx) => {
                const isActive = item.href === '/profile/edit';
                return (
                  <Link 
                    key={idx} 
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-gray-200 shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white rounded-xl shadow-sm border border-gray-100 ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{item.title}</span>
                    </div>
                    <ArrowLeft className={`w-5 h-5 transition-colors ${isActive ? 'text-[#45B7C7]' : 'text-gray-400 group-hover:text-[#45B7C7]'}`} />
                  </Link>
                )
              })}
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group mt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-red-500">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700 text-sm group-hover:text-red-600">تسجيل الخروج</span>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>

          {/* LEFT COLUMN - EDIT FORM */}
          <div className="w-full lg:w-2/3 bg-[#FAFAFA] rounded-[2.5rem] p-6 lg:p-10 flex flex-col order-1 lg:order-2 border border-gray-100 relative">
             <Link href="/profile" className="absolute top-8 right-8 text-gray-400 hover:text-[#45B7C7] transition-colors">
                <ArrowLeft className="w-6 h-6 rotate-180" />
             </Link>
             
             <h2 className="text-2xl font-black text-center text-gray-800 mb-8">تعديل الحساب</h2>

             {/* Avatar */}
             <div className="flex justify-center mb-8">
               <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-sm">
                   <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div 
                   className="absolute bottom-0 right-0 bg-[#45B7C7] w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-transform"
                 >
                   {avatarUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                      <Camera className="w-4 h-4 text-white" />
                   )}
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleAvatarSelect}
                 />
               </div>
             </div>

             <div className="space-y-5 max-w-xl mx-auto w-full">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#45B7C7]" /> الإسم بالكامل
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors text-right"
                    placeholder="الإسم"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#45B7C7]" /> البريد الإلكتروني
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors text-right font-sans"
                    dir="ltr"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#45B7C7]" /> رقم الهاتف
                  </label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors text-right font-sans"
                    dir="ltr"
                    placeholder="0555555555"
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#45B7C7]" /> الجنس
                  </label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setGender('male')}
                      className={`flex-1 py-3 rounded-xl font-bold transition-colors ${gender === 'male' ? 'bg-[#45B7C7] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      ذكر
                    </button>
                    <button 
                      onClick={() => setGender('female')}
                      className={`flex-1 py-3 rounded-xl font-bold transition-colors ${gender === 'female' ? 'bg-[#45B7C7] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      أنثى
                    </button>
                  </div>
                </div>

                {/* Education Level */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#45B7C7]" /> المستوى الدراسي
                  </label>
                  <select 
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors bg-white appearance-none text-right"
                  >
                    <option value="" disabled>اختر المستوى</option>
                    {educationLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                    ))}
                  </select>
                </div>

                {/* Education Year */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#45B7C7]" /> السنة الدراسية
                  </label>
                  <select 
                    value={educationYear}
                    onChange={(e) => setEducationYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors bg-white appearance-none text-right"
                  >
                    <option value="" disabled>اختر السنة</option>
                    {educationYears.filter(y => !educationLevel || y.education_level_id?.toString() === educationLevel).map((yr) => (
                      <option key={yr.id} value={yr.id}>{yr.name}</option>
                    ))}
                  </select>
                </div>

                {/* Wilaya */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#45B7C7]" /> الولاية
                  </label>
                  <select 
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors bg-white appearance-none text-right"
                  >
                    <option value="" disabled>اختر الولاية</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* Old Password */}
                <div className="flex flex-col gap-1.5 text-right mt-4">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#45B7C7]" /> كلمة المرور السابقة
                  </label>
                  <div className="relative">
                    <input 
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors text-left font-sans"
                      dir="ltr"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#45B7C7]" /> كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors text-left font-sans"
                      dir="ltr"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

             </div>

             {/* Actions */}
             <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto w-full mt-10">
                <button 
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-xl font-bold text-red-500 bg-white border border-red-200 hover:bg-red-50 transition-colors"
                >
                  حذف الحساب
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-[#0A3D4D] hover:bg-[#1a5b6e] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSaving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  حفظ
                </button>
             </div>
          </div>
        </div>
      </main>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">تحقق من البريد الإلكتروني</h3>
            <p className="text-gray-500 text-sm text-center mb-6">لقد أرسلنا رمز تحقق إلى {email}</p>
            
            <input 
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="أدخل الرمز"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#45B7C7] transition-colors text-center font-sans tracking-[0.5em] mb-6"
              dir="ltr"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#45B7C7] hover:bg-[#3ca3b3] transition-colors"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
