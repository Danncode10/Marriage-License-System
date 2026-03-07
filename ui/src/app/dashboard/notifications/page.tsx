import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/roles";
import NotificationClient from "@/components/dashboard/NotificationClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function NotificationsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page } = await searchParams;
    const supabase = await createClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        redirect("/login");
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const role = await getUserRole();
    const currentPage = parseInt(page || '1');
    const limit = 10; // Change this how many notifications per page
    const offset = (currentPage - 1) * limit;

    // First, try a simple query to check if table exists
    const { data: testData, error: testError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

    if (testError) {
        console.error('Notifications table test failed:', testError);
        // If table doesn't exist, return empty
        if (testError.code === 'PGRST116' || testError.message?.includes('notifications')) {
            console.log('Notifications table does not exist yet. Please run the SQL migration.');
            return (
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
                        <Badge variant="secondary" className="text-sm">0 unread</Badge>
                    </div>
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center text-zinc-500">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">Notifications Table Missing</h3>
                                <p className="text-sm mb-4">The notifications table needs to be created first.</p>
                                <p className="text-xs text-zinc-400 mb-4">Please run the provided SQL migration in your Supabase SQL Editor.</p>
                                <div className="text-left bg-zinc-50 p-4 rounded-lg text-xs font-mono">
                                    <p className="font-bold mb-2">Copy and run this SQL:</p>
                                    <pre className="whitespace-pre-wrap">
                                        {`-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text not null check (type in ('status_change', 'photo_captured', 'staff_action', 'system')),
  related_application_id uuid references marriage_applications(id),
  related_user_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Recreate policies
create policy "users_view_own_notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "staff_view_created_notifications" on public.notifications
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'employee')
    )
  );

create policy "authenticated_insert_notifications" on public.notifications
  for insert with check (auth.uid() is not null);

create policy "users_update_own_notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Function to create notification
drop function if exists create_notification(uuid, text, text, text, uuid, uuid, jsonb);
create or replace function create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_related_application_id uuid default null,
  p_related_user_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    related_application_id,
    related_user_id,
    created_by,
    metadata
  ) values (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_application_id,
    p_related_user_id,
    auth.uid(),
    p_metadata
  ) returning id into notification_id;

  return notification_id;
end;
$$ language plpgsql security definer;`}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

    // Fetch total count for pagination
    let countQuery = supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (role === 'admin') {
        countQuery = supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .or(`user_id.eq.${user.id},created_by.eq.${user.id}`);
    }

    const { count: totalCount } = await countQuery;
    const totalPages = Math.ceil((totalCount || 0) / limit);

    // Fetch unread count
    const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

    // Fetch notifications based on role with limit and offset
    let baseQuery = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // For admin, show notifications they received OR notifications they created
    if (role === 'admin') {
        baseQuery = supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
    }

    const { data: notifications, error } = await baseQuery;

    // If we have notifications, try to enrich them with profile and application data
    let enrichedNotifications = notifications;
    if (notifications && notifications.length > 0) {
        try {
            // Get unique created_by IDs and application IDs
            const createdByIds = [...new Set(notifications.map(n => n.created_by).filter(Boolean))];
            const applicationIds = [...new Set(notifications.map(n => n.related_application_id).filter(Boolean))];

            // Fetch profiles
            const { data: profilesData } = createdByIds.length > 0 ? await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', createdByIds) : { data: [] };

            // Fetch applications
            const { data: applicationsData } = applicationIds.length > 0 ? await supabase
                .from('marriage_applications')
                .select('id, application_code')
                .in('id', applicationIds) : { data: [] };

            // Enrich notifications
            enrichedNotifications = notifications.map(notification => ({
                ...notification,
                created_by_profile: profilesData?.find((p: { id: string; full_name: string; role: string }) => p.id === notification.created_by) || null,
                related_application: applicationsData?.find((a: { id: string; application_code: string }) => a.id === notification.related_application_id) || null
            }));
        } catch (enrichError) {
            console.error('Error enriching notifications:', enrichError);
            // Continue with basic notifications if enrichment fails
        }
    }

    if (error) {
        console.error('Error fetching notifications:', error);
        // If table doesn't exist yet, show empty state
        if (error.code === 'PGRST116' || error.message?.includes('notifications')) {
            console.log('Notifications table may not exist yet. Please run the provided SQL migration.');
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <NotificationClient 
                notifications={enrichedNotifications || []} 
                unreadCount={unreadCount || 0} 
            />
        </div>
    );
}
