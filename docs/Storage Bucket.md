Database Schema should be finished before proceed here.

## Step 5: Set Up Storage Bucket

1. In your Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create bucket**
3. Name it: `marriage-license-files`
4. Set it to **Private** (uncheck "Public bucket")
5. Click **Create bucket**

## Step 6: Create Database Functions

Run these helper functions in your SQL Editor: (As one)

```sql
-- Function to get next document number ✅
CREATE OR REPLACE FUNCTION get_next_document_number()
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Get the current max document number
    SELECT COALESCE(MAX(document_number), 0) + 1 INTO next_number
    FROM marriage_applications
    WHERE document_number IS NOT NULL;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'user', new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Step 7: Test the Setup

Let's verify everything is working:

1. Go to **Table Editor** in Supabase
2. Check that all tables exist and RLS is enabled
3. Try inserting a test record (you can do this via SQL or the table editor)

## Step 8: Create Storage Policies (Optional but Recommended)

For the storage bucket, add these policies in the SQL Editor:

```sql
-- Storage policies for marriage-license-files bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'marriage-license-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employees can view all files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'marriage-license-files'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

CREATE POLICY "Employees can upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'marriage-license-files'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);
```

## Summary

Once you've completed these steps, the **Database Design & Row Level Security (RLS)** section from your MasterPlan will be complete! This includes:

✅ Database schema with all required tables  
✅ Row Level Security enabled  
✅ Security policies for multi-tenant access  
✅ Storage bucket setup  
✅ Helper functions for document numbering  
✅ Automatic profile creation on signup  

The next major steps would be integrating your existing marriage form with the database (saving form data to Supabase instead of just generating Excel), but that's a separate implementation task.

Would you like to proceed with these final steps, or are you ready to move on to integrating the form with the database?