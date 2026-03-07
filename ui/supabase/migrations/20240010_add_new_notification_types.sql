-- Add new notification types to the check constraint
-- This migration adds support for 'registry_assigned' and 'ready_for_pickup' notification types

-- First, drop the existing check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new check constraint with the updated notification types
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('status_change', 'photo_captured', 'staff_action', 'system', 'registry_assigned', 'ready_for_pickup'));

-- This migration ensures that the new notification types are properly supported
-- while maintaining backward compatibility with existing notification types
