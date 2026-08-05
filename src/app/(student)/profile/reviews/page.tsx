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
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { generalApi } from '@/lib/general';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'books' | 'teachers'>('books');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Fetch Items (Books or Teachers) based on active tab
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        let response;
        if (activeTab === 'books') {
          response = await generalApi.getBooks();
        } else {
          response = await generalApi.getTeachers();
        }
        
        const fetchedItems = response || [];
        setItems(fetchedItems);
        
        if (fetchedItems.length > 0) {
          setSelectedItemId(fetchedItems[0].id);
        } else {
          setSelectedItemId(null);
          setReviews([]);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [activeTab]);

  // Fetch reviews when selected item changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedItemId) return;
      
      setIsLoadingReviews(true);
      try {
        const type = activeTab === 'books' ? 'book' : 'teacher';
        const response = await generalApi.getAppReviews(type, selectedItemId);
        
        // Ensure we always have an array of reviews
        const fetchedReviews = Array.isArray(response) ? response : (response?.data || []);
        
        // If there are no reviews, mock some data for the UI to look good as requested by the user
        // We will use placeholder images if the backend has no reviews yet.
        if (fetchedReviews.length === 0) {
           setReviews([
             { id: 1, text: 'استعملت بلانر مستر باك وتحصلت على معدل 16', image: '/media_1785957697398.png' },
             { id: 2, text: 'تجربة رائعة مع هذا الكتاب!', image: '/media_1785959186420.png' },
             { id: 3, text: 'انصح الجميع بالاشتراك', image: '/media_1785959934291.png' }
           ]);
        } else {
           setReviews(fetchedReviews);
        }
        setActiveReviewIndex(0);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [selectedItemId, activeTab]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { title: 'تعديل الحساب', icon: <UserPen className="w-5 h-5" />, href: '/profile/edit', color: 'text-orange-500' },
    { title: 'آراء التلاميذ', icon: <MessageSquareHeart className="w-5 h-5" />, href: '/profile/reviews', color: 'text-yellow-500' },
    { title: 'الاشتراكات', icon: <CreditCard className="w-5 h-5" />, href: '/subscriptions', color: 'text-blue-500' },
    { title: 'من نحن', icon: <Users className="w-5 h-5" />, href: '/about', color: 'text-slate-700' },
    { title: 'الأسئلة الأكثر تداولاً', icon: <HelpCircle className="w-5 h-5" />, href: '/faq', color: 'text-orange-400' },
    { title: 'الشروط و الأحكام', icon: <Lock className="w-5 h-5" />, href: '/terms', color: 'text-amber-500' },
    { title: 'تقييم التطبيق', icon: <Star className="w-5 h-5" />, href: '/rate', color: 'text-yellow-400' },
  ];

  const handleNextReview = () => {
    setActiveReviewIndex((prev) => (prev + 1) % Math.max(1, reviews.length));
  };

  const handlePrevReview = () => {
    setActiveReviewIndex((prev) => (prev === 0 ? Math.max(0, reviews.length - 1) : prev - 1));
  };

  const getReviewImage = (review: any) => {
    if (!review) return '/image 24.png';
    if (review.image && review.image.startsWith('/media')) return review.image; // Mocked
    return review.image ? `https://mrstudy.net/storage/${review.image}` : '/image 24.png';
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* RIGHT COLUMN - MENU (Visual right, logical order 2 in DOM for mobile first) */}
          <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1">
            <div className="mb-2 px-2 text-right">
              <h3 className="text-gray-400 font-medium text-sm">حسابي</h3>
            </div>
            
            <div className="bg-gray-50/50 rounded-3xl p-3 flex flex-col gap-1">
              {menuItems.map((item, idx) => {
                const isActive = item.href === '/profile/reviews';
                return (
                  <Link 
                    key={idx} 
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all group ${isActive ? 'bg-white shadow-sm' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white rounded-xl shadow-sm border border-gray-100 ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{item.title}</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#45B7C7] transition-colors" />
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

          {/* LEFT COLUMN - MAIN PROFILE (Visual left, logical order 1) */}
          <div className="w-full lg:w-2/3 order-1 lg:order-2 flex flex-col items-center pt-4">
            
            <h1 className="text-3xl font-black text-gray-800 mb-8 text-center">آراء التلاميذ</h1>
            
            {/* Tabs */}
            <div className="flex w-full bg-[#f2f8fc] rounded-2xl p-1.5 mb-10">
              <button
                onClick={() => setActiveTab('books')}
                className={`flex-1 py-3 text-center rounded-xl font-bold transition-all text-sm ${activeTab === 'books' ? 'bg-[#005c8a] text-white shadow-md' : 'text-[#005c8a] hover:bg-white/50'}`}
              >
                عن الكتب و المطبوعات
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`flex-1 py-3 text-center rounded-xl font-bold transition-all text-sm ${activeTab === 'teachers' ? 'bg-[#005c8a] text-white shadow-md' : 'text-[#005c8a] hover:bg-white/50'}`}
              >
                عن الأساتذة
              </button>
            </div>

            {/* Categories List (Teachers or Books) */}
            <div className="flex flex-row-reverse flex-wrap justify-center items-center gap-6 mb-8 w-full max-w-lg">
              {isLoading ? (
                <div className="text-gray-400 font-bold py-6">جاري التحميل...</div>
              ) : items.length === 0 ? (
                <div className="text-gray-400 font-bold py-6">لا توجد بيانات متاحة</div>
              ) : (
                items.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  // Handle both book image and teacher avatar structures
                  const imageSrc = item.avatar ? (item.avatar.startsWith('http') ? item.avatar : `https://mrstudy.net/storage/${item.avatar}`) : (item.image ? `https://mrstudy.net/storage/${item.image}` : (item.cover ? `https://mrstudy.net/storage/${item.cover}` : '/image 24.png'));
                  
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedItemId(item.id)}
                      className={`flex flex-col items-center gap-2 transition-all ${isSelected ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                    >
                      <div className={`w-[70px] h-[70px] rounded-full p-[3px] ${isSelected ? 'bg-gradient-to-tr from-[#008db9] to-[#45B7C7] shadow-md' : 'bg-transparent'}`}>
                         <img 
                           src={imageSrc} 
                           alt={item.name || item.title || 'صورة'} 
                           className="w-full h-full rounded-full object-cover bg-white" 
                         />
                      </div>
                      <span className={`font-bold text-sm ${isSelected ? 'text-[#005c8a]' : 'text-gray-500'}`}>
                        {item.name || item.title || (item.subject?.name ?? 'بدون اسم')}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Item Review Description */}
            {!isLoadingReviews && reviews.length > 0 && (
              <p className="text-gray-600 font-bold text-center mb-12 max-w-lg leading-relaxed px-4">
                {reviews[activeReviewIndex]?.text || 'ايناس تلميذة تحصلت على بكالوريا 2023 ب 9 من 20 وفي عام 2024 استعملت بلانر مستر باك وتحصلت على معدل 16'}
              </p>
            )}

            {/* 3D Image Carousel */}
            {!isLoadingReviews && reviews.length > 0 ? (
              <div className="relative w-full h-[450px] flex items-center justify-center mb-10 overflow-hidden perspective-1000">
                
                {/* Prev Button */}
                <button 
                  onClick={handlePrevReview}
                  className="absolute right-4 md:right-10 z-30 w-12 h-12 bg-[#008db9] rounded-full text-white flex items-center justify-center shadow-lg hover:bg-[#007a9e] transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Next Button */}
                <button 
                  onClick={handleNextReview}
                  className="absolute left-4 md:left-10 z-30 w-12 h-12 bg-[#008db9] rounded-full text-white flex items-center justify-center shadow-lg hover:bg-[#007a9e] transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Carousel Images container */}
                <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
                  <AnimatePresence initial={false}>
                    {reviews.map((review, idx) => {
                      // Calculate offset relative to active index
                      let offset = idx - activeReviewIndex;
                      // Handle wrapping for smooth circular feel (only if more than 2 reviews)
                      if (reviews.length > 2) {
                        if (offset === reviews.length - 1) offset = -1;
                        if (offset === -(reviews.length - 1)) offset = 1;
                      }

                      // Only render visible items (-1, 0, 1)
                      if (Math.abs(offset) > 1) return null;

                      // Properties for active (center) and inactive (side) cards
                      const isActive = offset === 0;
                      const isNext = offset === -1; // -1 because RTL, left is next
                      const isPrev = offset === 1;

                      let xPos = 0;
                      if (isNext) xPos = -120;
                      if (isPrev) xPos = 120;
                      
                      const scale = isActive ? 1 : 0.8;
                      const zIndex = isActive ? 20 : 10;
                      const opacity = isActive ? 1 : 0.6;
                      
                      return (
                        <motion.div
                          key={review.id || idx}
                          initial={{ opacity: 0, scale: 0.8, x: xPos * 1.5 }}
                          animate={{ 
                            opacity: opacity,
                            scale: scale,
                            x: xPos,
                            zIndex: zIndex
                          }}
                          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50"
                          style={{
                            width: isActive ? '240px' : '200px',
                            height: isActive ? '400px' : '330px',
                            boxShadow: isActive ? '0 20px 40px rgba(0,0,0,0.15)' : '0 10px 20px rgba(0,0,0,0.05)',
                          }}
                        >
                          <img 
                            src={getReviewImage(review)} 
                            alt="Student Review" 
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

              </div>
            ) : isLoadingReviews ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-[#008db9] font-bold">جاري تحميل الآراء...</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] opacity-50">
                <MessageSquareHeart className="w-16 h-16 text-gray-300 mb-4" />
                <span className="font-bold text-gray-400">لا توجد آراء مسجلة حتى الآن</span>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
