import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, FileSignature, IdCard, Car } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { HrNotification, NotificationType, AccessRoleCode } from '../types/hr.types';

interface NotificationsBellProps {
  userRoles: AccessRoleCode[];
}

const NOTIF_ICON: Record<NotificationType, React.ElementType> = {
  contrat_expire: FileSignature,
  piece_identite_expire: IdCard,
  permis_expire: Car,
  rapport_manquant: AlertTriangle,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function NotificationsBell({ userRoles }: NotificationsBellProps) {
  const [notifications, setNotifications] = useState<HrNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const targetRoles = (['rh', 'super_admin'] as const).filter((r) => userRoles.includes(r));

  const loadNotifications = async () => {
    if (!isSupabaseConfigured || !supabase || targetRoles.length === 0) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .in('target_role', targetRoles)
      .order('created_at', { ascending: false })
      .limit(30);
    setNotifications((data || []) as HrNotification[]);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRoles.join(',')]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (targetRoles.length === 0) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2.5 rounded-xl bg-black/40 border border-gray-800 text-gray-300 hover:text-gray-50 transition"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <span className="font-bold text-gray-50 text-sm">Notifications RH</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tout marquer lu</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500 text-xs">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs">Aucune notification.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((n) => {
                const Icon = NOTIF_ICON[n.type] || AlertTriangle;
                return (
                  <div key={n.id} className={`p-3.5 flex items-start gap-3 ${n.is_read ? 'opacity-60' : ''}`}>
                    <div className={`p-1.5 rounded-lg shrink-0 ${n.is_read ? 'bg-gray-800 text-gray-500' : 'bg-amber-500/15 text-amber-400'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-gray-500">{timeAgo(n.created_at)}</span>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="p-1 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-gray-800 shrink-0" title="Marquer comme lu">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
