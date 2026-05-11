-- ============================================================
-- Promote xandermacayan79@gmail.com to ADMIN + ACTIVE
-- Run in Supabase SQL Editor (Role: postgres)
-- ============================================================

-- 1. Set user type to ADMIN and activate
UPDATE public.profiles
SET user_type = 'ADMIN',
    record_status = 'ACTIVE'
WHERE email = 'xandermacayan79@gmail.com';

-- 2. Grant ALL rights (so they can see admin features)
INSERT INTO public.user_module_rights (user_id, right_id)
SELECT p.id, r.id
FROM public.profiles p
CROSS JOIN public.rights r
WHERE p.email = 'xandermacayan79@gmail.com'
ON CONFLICT (user_id, right_id) DO NOTHING;

-- 3. Verify
SELECT email, user_type, record_status,
       (SELECT COUNT(*) FROM user_module_rights WHERE user_id = p.id) AS rights_count
FROM public.profiles p
WHERE email = 'xandermacayan79@gmail.com';
