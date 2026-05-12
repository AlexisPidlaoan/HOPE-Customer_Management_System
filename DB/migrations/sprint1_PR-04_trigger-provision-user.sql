-- Create a function that provisions a profile row when a new user is created
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert a new profile row linked to the auth.users entry
  insert into public.profiles (id, email, full_name, user_type, record_status, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'USER',                -- default role
    'ACTIVE',              -- default status
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Attach the trigger to the auth.users table
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function handle_new_user();
