-- Add role column to public.users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE public.users ADD COLUMN role text DEFAULT 'user';
    END IF;
END
$$;

-- Create a function to update auth.users app_metadata role
CREATE OR REPLACE FUNCTION public.update_auth_user_app_metadata_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET
    raw_app_meta_data = jsonb_set(raw_app_meta_data, '{user_role}', to_jsonb(NEW.role))
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on public.users to call the function when the role is updated
DROP TRIGGER IF EXISTS on_public_user_role_updated ON public.users;
CREATE TRIGGER on_public_user_role_updated
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_auth_user_app_metadata_role();
