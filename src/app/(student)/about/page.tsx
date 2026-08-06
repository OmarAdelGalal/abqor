'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { generalApi } from '@/lib/general';
import { useAuthStore } from '@/store/useAuthStore';

export default function AboutUsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        const fetchedTeachers = await generalApi.getTeachers();
        setTeachers(fetchedTeachers || []);
        if (fetchedTeachers && fetchedTeachers.length > 0) {
          setSelectedTeacherId(fetchedTeachers[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { title: 'تعديل الحساب', icon: <UserPen className="w-5 h-5" />, href: '/profile/edit', color: 'text-orange-500' },
    { title: 'آراء التلاميذ', icon: <MessageSquareHeart className="w-5 h-5" />, href: '/profile/reviews', color: 'text-yellow-500' },
    { title: 'من نحن', icon: <Users className="w-5 h-5" />, href: '/about', color: 'text-slate-700' },
    { title: 'الأسئلة الأكثر تداولاً', icon: <HelpCircle className="w-5 h-5" />, href: '/faq', color: 'text-orange-400' },
    { title: 'الشروط و الأحكام', icon: <Lock className="w-5 h-5" />, href: '/terms', color: 'text-amber-500' },
    { title: 'تقييم التطبيق', icon: <Star className="w-5 h-5" />, href: '/rate', color: 'text-yellow-400' },
  ];

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

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
                const isActive = item.href === '/about';
                return (
                  <Link 
                    key={idx} 
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white rounded-xl shadow-sm border border-gray-100 ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{item.title}</span>
                    </div>
                    <ArrowLeft className={`w-5 h-5 transition-colors ${isActive ? 'text-[#45B7C7]' : 'text-gray-400 group-hover:text-[#45B7C7]'}`} />
                  </Link>
                );
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

          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="w-full lg:w-2/3 order-1 lg:order-2 flex flex-col pt-4">
            
            <h1 className="text-2xl font-black text-gray-800 mb-8 text-center">من نحن</h1>
            
            {/* Welcome Banner */}
            <div className="bg-[#eaf6f7] rounded-[40px] p-8 mb-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden h-auto md:h-56">
              <div className="text-center md:text-right z-10 w-full md:w-1/2">
                <h2 className="text-[#005c8a] text-3xl font-black mb-2 leading-tight">
                  مرحبًا بك في<br/>تطبيق ABQOR!
                </h2>
              </div>
              <div className="relative mt-4 md:mt-0 md:absolute md:left-8 md:-bottom-8 z-10 w-48 h-48 md:w-56 md:h-56">
                <img src="/boy2.png" alt="Welcome" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/image 24.png' }} />
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 text-right mb-10 text-sm md:text-base leading-relaxed text-gray-600 font-medium">
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-2">من نحن</h3>
                <p>
                  نحن فريق من المتخصصين في التعليم نسعى إلى تقديم تجربة تعليمية متميزة وممتعة للطلاب من جميع الأعمار والمستويات. هدفنا هو توفير بيئة تعليمية مبتكرة تساعد الطلاب على تحقيق أقصى إمكاناتهم الأكاديمية بأساليب متطورة ومحتوى تعليمي شامل.
                </p>
              </div>
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-2">رؤيتنا</h3>
                <p>
                  أن نكون المصدر الأول لتعلم جميع المواد والمستويات بطريقة تفاعلية وممتعة، مع دمج أحدث التقنيات التعليمية لمساعدة الطلاب على النجاح في رحلتهم التعليمية.
                </p>
              </div>
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-2">رسالتنا</h3>
                <p>
                  نحن هنا لدعم الطلاب في كل خطوة من خطوات تعليمهم، سواء كان ذلك من خلال الدروس المباشرة أو التمارين التفاعلية أو التحديات التحفيزية. نؤمن أن التعليم ليس مجرد مادة تُدرس، بل هو تجربة مستمرة تتطلب الإبداع والتحفيز المستمر.
                </p>
              </div>
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-2">فريقنا التعليمي</h3>
                <p>
                  لدينا مجموعة من الأساتذة المتخصصين في مجالات متعددة، جاهزين لدعمك في مسيرتك التعليمية. تعرف على كل أستاذ و احصل على المزيد من المحتوى التعليمي:
                </p>
              </div>
            </div>

            {/* Educational Team Section */}
            <div className="flex flex-col items-center">
              
              {/* Subjects/Teachers List */}
              <div className="flex flex-row flex-wrap justify-center items-center gap-6 mb-8 w-full">
                {isLoading ? (
                  <div className="text-gray-400 font-bold py-6">جاري التحميل...</div>
                ) : teachers.length === 0 ? (
                  <div className="text-gray-400 font-bold py-6">لا توجد بيانات متاحة</div>
                ) : (
                  teachers.map((teacher) => {
                    const isSelected = selectedTeacherId === teacher.id;
                    const subjectName = teacher.subject?.name || teacher.title || teacher.name || 'مادة';
                    // We'll use the first two letters of the subject as the icon text or a generic icon
                    const shortCode = subjectName.substring(0,2).toUpperCase();
                    
                    return (
                      <button 
                        key={teacher.id} 
                        onClick={() => setSelectedTeacherId(teacher.id)}
                        className={`flex flex-col items-center gap-3 transition-all group`}
                      >
                        <div className={`w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all border-[3px] border-white ${isSelected ? 'bg-[#45B7C7] shadow-[0_4px_15px_rgba(69,183,199,0.4)] text-white' : 'bg-[#f0f4f8] text-gray-400 hover:bg-gray-200 shadow-sm'}`}>
                           <span className="font-bold text-2xl">{shortCode}</span>
                        </div>
                        <span className={`font-bold text-sm ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
                          {subjectName}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected Teacher Banner */}
              {selectedTeacher && (
                <div className="w-full bg-gradient-to-l from-[#005c8a] to-[#45B7C7] rounded-[40px] p-6 md:px-12 md:py-8 flex flex-col md:flex-row-reverse items-center justify-between text-white relative overflow-visible mt-16 md:mt-10">
                  
                  {/* Text and Socials */}
                  <div className="text-center md:text-right z-10 w-full md:w-2/3 mb-6 md:mb-0 pb-4 md:pb-0">
                    <h3 className="text-3xl md:text-4xl font-black mb-2">{selectedTeacher.name || selectedTeacher.title || 'أستاذ غير محدد'}</h3>
                    <p className="text-base md:text-lg opacity-90 mb-8 font-medium">أستاذ(ة) {selectedTeacher.subject?.name || 'مادة'}</p>
                    
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <a href={selectedTeacher.youtube || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#ff0000] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <FaYoutube className="w-6 h-6 text-white" />
                      </a>
                      <a href={selectedTeacher.instagram || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <FaInstagram className="w-6 h-6 text-white" />
                      </a>
                      <a href={selectedTeacher.facebook || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <FaFacebookF className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  </div>

                  {/* Teacher Image */}
                  <div className="relative z-20 w-52 h-52 md:w-72 md:h-72 -mt-24 md:-mt-0 flex-shrink-0 md:absolute md:left-4 md:-bottom-4">
                    <img 
                      src={selectedTeacher.avatar ? (selectedTeacher.avatar.startsWith('http') ? selectedTeacher.avatar : `https://mrstudy.net/storage/${selectedTeacher.avatar}`) : (selectedTeacher.image ? `https://mrstudy.net/storage/${selectedTeacher.image}` : '/image 24.png')} 
                      alt={selectedTeacher.name || 'صورة الأستاذ'} 
                      className="w-full h-full object-contain object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)]" 
                      onError={(e) => { e.currentTarget.src = '/image 24.png' }}
                    />
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
