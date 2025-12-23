-- Auth translations for login and register forms
-- Run this script in Supabase SQL Editor to seed auth.login and auth.register namespaces

-- English translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
  -- auth.login namespace
  ('auth.login', 'title', 'en', 'Welcome back', false),
  ('auth.login', 'subtitle', 'en', 'Sign in to your mentoring platform account', false),
  ('auth.login', 'labels.email', 'en', 'Email', false),
  ('auth.login', 'placeholders.email', 'en', 'Enter your email', false),
  ('auth.login', 'labels.password', 'en', 'Password', false),
  ('auth.login', 'placeholders.password', 'en', 'Enter your password', false),
  ('auth.login', 'forgotPassword', 'en', 'Forgot password?', false),
  ('auth.login', 'cta.loading', 'en', 'Signing in...', false),
  ('auth.login', 'cta.submit', 'en', 'Sign in', false),
  ('auth.login', 'footer.prompt', 'en', 'Don''t have an account?', false),
  ('auth.login', 'footer.link', 'en', 'Sign up', false),
  ('auth.login', 'register.mentor', 'en', 'Register as Mentor', false),
  ('auth.login', 'register.mentee', 'en', 'Register as Mentee', false),
  ('auth.login', 'register.or', 'en', 'or', false),
  -- auth.register namespace
  ('auth.register', 'title', 'en', 'Create Account', false),
  ('auth.register', 'subtitle', 'en', 'Join our mentoring platform', false),
  ('auth.register', 'labels.fullName', 'en', 'Full Name', false),
  ('auth.register', 'labels.email', 'en', 'Email', false),
  ('auth.register', 'labels.password', 'en', 'Password', false),
  ('auth.register', 'labels.region', 'en', 'Region', false),
  ('auth.register', 'labels.role', 'en', 'Role', false),
  ('auth.register', 'options.role.mentee', 'en', 'Mentee', false),
  ('auth.register', 'options.role.mentor', 'en', 'Mentor', false),
  ('auth.register', 'options.role.coordinator', 'en', 'Coordinator', false),
  ('auth.register', 'cta.loading', 'en', 'Creating Account...', false),
  ('auth.register', 'cta.submit', 'en', 'Create Account', false),
  ('auth.register', 'footer.prompt', 'en', 'Already have an account?', false),
  ('auth.register', 'footer.link', 'en', 'Sign in', false),
  ('auth.register', 'success', 'en', 'Registration successful! Please check your email to verify your account.', false),
  ('auth.register', 'errors.emailExists', 'en', 'This email is already registered. Please sign in.', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = NOW();

-- Georgian translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
  -- auth.login namespace
  ('auth.login', 'title', 'ka', 'მოგესალმებით', true),
  ('auth.login', 'subtitle', 'ka', 'შედით თქვენს მენტორინგის პლატფორმის ანგარიშზე', true),
  ('auth.login', 'labels.email', 'ka', 'ელფოსტა', true),
  ('auth.login', 'placeholders.email', 'ka', 'შეიყვანეთ თქვენი ელფოსტა', true),
  ('auth.login', 'labels.password', 'ka', 'პაროლი', true),
  ('auth.login', 'placeholders.password', 'ka', 'შეიყვანეთ თქვენი პაროლი', true),
  ('auth.login', 'forgotPassword', 'ka', 'დაგავიწყდათ პაროლი?', true),
  ('auth.login', 'cta.loading', 'ka', 'შესვლა...', true),
  ('auth.login', 'cta.submit', 'ka', 'შესვლა', true),
  ('auth.login', 'footer.prompt', 'ka', 'არ გაქვს ანგარიში?', true),
  ('auth.login', 'footer.link', 'ka', 'რეგისტრაცია', true),
  ('auth.login', 'register.mentor', 'ka', 'დარეგისტრირდი მენტორად', true),
  ('auth.login', 'register.mentee', 'ka', 'დარეგისტრირდი მოსწავლედ', true),
  ('auth.login', 'register.or', 'ka', 'ან', true),
  -- auth.register namespace
  ('auth.register', 'title', 'ka', 'ანგარიშის შექმნა', true),
  ('auth.register', 'subtitle', 'ka', 'შემოუერთდით ჩვენს მენტორინგის პლატფორმას', true),
  ('auth.register', 'labels.fullName', 'ka', 'სრული სახელი', true),
  ('auth.register', 'labels.email', 'ka', 'ელ.ფოსტა', true),
  ('auth.register', 'labels.password', 'ka', 'პაროლი', true),
  ('auth.register', 'labels.region', 'ka', 'რეგიონი', true),
  ('auth.register', 'labels.role', 'ka', 'როლი', true),
  ('auth.register', 'options.role.mentee', 'ka', 'მოსწავლე', true),
  ('auth.register', 'options.role.mentor', 'ka', 'მენტორი', true),
  ('auth.register', 'options.role.coordinator', 'ka', 'კოორდინატორი', true),
  ('auth.register', 'cta.loading', 'ka', 'ანგარიშის შექმნა...', true),
  ('auth.register', 'cta.submit', 'ka', 'ანგარიშის შექმნა', true),
  ('auth.register', 'footer.prompt', 'ka', 'უკვე გაქვს ანგარიში?', true),
  ('auth.register', 'footer.link', 'ka', 'შესვლა', true),
  ('auth.register', 'success', 'ka', 'რეგისტრაცია წარმატებულია! გთხოვთ, შეამოწმოთ თქვენი ელ.ფოსტა ანგარიშის დასადასტურებლად.', true),
  ('auth.register', 'errors.emailExists', 'ka', 'ეს ელ.ფოსტა უკვე რეგისტრირებულია. გთხოვთ, შეხვიდეთ სისტემაში.', true)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = NOW();
