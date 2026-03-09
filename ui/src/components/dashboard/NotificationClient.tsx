"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Bell, Clock, User, FileText, Camera, ShieldCheck, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
    read_at: string | null;
    user_id: string;
    created_by: string;
    created_by_profile?: {
        full_name: string;
        role: string;
    };
    related_application?: {
        application_code: string;
    };
}

interface NotificationClientProps {
    notifications: Notification[];
    unreadCount: number;
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
}

export default function NotificationClient({ 
    notifications, 
    unreadCount, 
    currentPage = 1,
    totalPages = 1,
    totalCount = 0
}: NotificationClientProps) {
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
    const [pressedNotificationId, setPressedNotificationId] = useState<string | null>(null);
    const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        setLocalNotifications(notifications);
        setLocalUnreadCount(unreadCount);
    }, [notifications, unreadCount]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'status_change':
                return <FileText className="h-4 w-4" />;
            case 'photo_captured':
                return <Camera className="h-4 w-4" />;
            case 'staff_action':
                return <ShieldCheck className="h-4 w-4" />;
            case 'registry_assigned':
                return <FileText className="h-4 w-4" />;
            case 'ready_for_pickup':
                return <Bell className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'status_change':
                return 'text-blue-600 bg-blue-50';
            case 'photo_captured':
                return 'text-green-600 bg-green-50';
            case 'staff_action':
                return 'text-purple-600 bg-purple-50';
            case 'registry_assigned':
                return 'text-emerald-600 bg-emerald-50';
            case 'ready_for_pickup':
                return 'text-amber-600 bg-amber-50';
            default:
                return 'text-zinc-600 bg-zinc-50';
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (error) {
                console.error('Error marking notification as read:', error);
                return;
            }

            setLocalNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, read_at: new Date().toISOString() }
                        : notif
                )
            );
            setLocalUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAsUnread = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read_at: null })
                .eq('id', notificationId);

            if (error) {
                console.error('Error marking notification as unread:', error);
                return;
            }

            setLocalNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, read_at: null }
                        : notif
                )
            );
            setLocalUnreadCount(prev => prev + 1);
        } catch (error) {
            console.error('Error marking notification as unread:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
    };

    const handleTouchStart = (e: React.TouchEvent, notificationId: string) => {
        e.preventDefault();
        const timer = setTimeout(() => {
            setPressedNotificationId(notificationId);
        }, 500); // 500ms for long press
        setPressTimer(timer);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
    };

    const handleTouchMove = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
        setPressedNotificationId(null);
    };

    const handleMouseDown = (notificationId: string) => {
        const timer = setTimeout(() => {
            setPressedNotificationId(notificationId);
        }, 500); // 500ms for long press
        setPressTimer(timer);
    };

    const handleMouseUp = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
    };

    const handleMouseLeave = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
        setPressedNotificationId(null);
    };

    const handleMarkAsUnread = (e: React.MouseEvent | React.TouchEvent, notificationId: string) => {
        e.preventDefault();
        e.stopPropagation();
        markAsUnread(notificationId);
        setPressedNotificationId(null);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    const markAllAsRead = async () => {
        try {
            // Get all unread notifications
            const unreadNotifications = localNotifications.filter(n => !n.read_at);
            
            if (unreadNotifications.length === 0) return;

            // Mark all as read in database
            const { error } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .in('id', unreadNotifications.map(n => n.id));

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return;
            }

            // Update local state
            setLocalNotifications(prev => 
                prev.map(notif => 
                    ({ ...notif, read_at: new Date().toISOString() })
                )
            );
            setLocalUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {localUnreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs px-2 sm:px-3 whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Mark All as Read</span>
                            <span className="sm:hidden">All Read</span>
                        </Button>
                    )}
                    <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                        {localUnreadCount} unread
                    </Badge>
                </div>
            </div>

            <div className="space-y-4">
                {localNotifications && localNotifications.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {localNotifications.map((notification: Notification) => (
                                <Card 
                                    key={notification.id} 
                                    className={`transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                                        !notification.read_at 
                                            ? 'border-l-4 border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/50' 
                                            : 'hover:bg-zinc-50/50'
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                    // Touch events for mobile
                                    onTouchStart={(e) => handleTouchStart(e, notification.id)}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchMove={handleTouchMove}
                                    // Mouse events for desktop
                                    onMouseDown={() => handleMouseDown(notification.id)}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)} transition-transform group-hover:scale-110`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`font-semibold transition-colors ${
                                                        !notification.read_at 
                                                            ? 'text-zinc-900' 
                                                            : 'text-zinc-700'
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <p className={`transition-colors ${
                                                    !notification.read_at 
                                                        ? 'text-zinc-700 font-medium' 
                                                        : 'text-zinc-600'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                {notification.created_by_profile && notification.user_id !== notification.created_by && (
                                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                        <User className="h-3 w-3" />
                                                        <span>By {notification.created_by_profile.full_name} ({notification.created_by_profile.role})</span>
                                                    </div>
                                                )}
                                                {notification.related_application && (
                                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                        <FileText className="h-3 w-3" />
                                                        <span>Application: {notification.related_application.application_code}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    {!notification.read_at && (
                                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            Unread
                                                        </Badge>
                                                    )}
                                                    {notification.read_at && (
                                                        <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-600 border-zinc-200">
                                                            <EyeOff className="h-3 w-3 mr-1" />
                                                            Read
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Long press menu */}
                                        {pressedNotificationId === notification.id && (
                                            <div className="mt-4 pt-4 border-t border-zinc-200 animate-in slide-in-from-top-2 duration-200">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={(e) => handleMarkAsUnread(e, notification.id)}
                                                        onTouchEnd={(e) => handleMarkAsUnread(e, notification.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                                                    >
                                                        <EyeOff className="h-3 w-3" />
                                                        Mark as unread
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Simple Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-600">
                                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} notifications
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-zinc-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center text-zinc-500">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">No Notifications</h3>
                                <p>Updates about your applications and activities will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
