'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { dashboardApi } from '@/lib/dashboard';

interface Notification {
  id: number;
  body: string;
  created_at: string;
  icon: string;
}

// Simple Arabic relative time formatter
function formatRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 15) return 'الآن';
  if (minutes < 60) return `${minutes} دقيقة`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعة`;
  
  const days = Math.floor(hours / 24);
  return `${days} يوم`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await dashboardApi.getNotifications();
        // Laravel paginate response puts the array in data.data
        if (data && data.data) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNotifications();
  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8 flex flex-col max-w-5xl">
        {/* Top Title Bar */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">الإشعارات</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1FA6BA]"></div>
          </div>
        ) : hasNotifications ? (
          <div className="flex flex-col gap-4">
            {notifications.map((notif, index) => {
              const isUnread = index === 0; // Highlight the first one as unread for the UI demo
              
              return (
                <div 
                  key={notif.id}
                  className="flex items-center justify-between p-5 bg-[#fafafa] rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  {/* Right side: Icon and Text */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl border border-gray-50 shrink-0">
                      {notif.icon || '🔔'}
                    </div>
                    <p className="text-gray-800 font-bold md:text-lg">
                      {notif.body}
                    </p>
                  </div>

                  {/* Left side: Time and Unread dot */}
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className="text-sm text-gray-400 font-medium">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center mt-20">
            <div className="w-24 h-24 rounded-full bg-[#E5F7F9] flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-[#42B7C8] fill-[#42B7C8]" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              لا يوجد إشعارات
            </h2>
            
            <p className="text-gray-500 font-medium">
              لم تصلك أي اشعارات بعد
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
