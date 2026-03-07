-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text not null check (type in ('status_change', 'photo_captured', 'staff_action', 'system', 'registry_assigned', 'ready_for_pickup')),
  related_application_id uuid references marriage_applications(id),
  related_user_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
-- Users can view their own notifications
create policy "users_view_own_notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- Staff can view notifications they created
create policy "staff_view_created_notifications" on public.notifications
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'employee')
    )
  );

-- Authenticated users can insert notifications
create policy "authenticated_insert_notifications" on public.notifications
  for insert with check (auth.uid() is not null);

-- Users can update their own notifications (mark as read)
create policy "users_update_own_notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Function to create notification
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
$$ language plpgsql security definer;