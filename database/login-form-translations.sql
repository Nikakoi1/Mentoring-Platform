-- Add login form registration options translations
-- This adds Georgian translations for the login form registration options

-- English translations (already exist, but adding for completeness)
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated) VALUES
('auth.login', 'register.mentor', 'en', 'Register as Mentor', false),
('auth.login', 'register.mentee', 'en', 'Register as Mentee', false),
('auth.login', 'register.or', 'en', 'or', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

-- Georgian translations (broken into two lines for better UI)
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated) VALUES
('auth.login', 'register.mentor', 'ka', 'დარეგისტრირდი<br/>მენტორად', false),
('auth.login', 'register.mentee', 'ka', 'დარეგისტრირდი<br/>მოსწავლედ', false),
('auth.login', 'register.or', 'ka', 'ან', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

-- Add missing Georgian login form translations if they don't exist
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated) VALUES
('auth.login', 'title', 'ka', 'მოგესალმეთ კვლავ', false),
('auth.login', 'subtitle', 'ka', 'შედით თქვენს მენტორინგის პლატფორმის ანგარიშზე', false),
('auth.login', 'labels.email', 'ka', 'ელფოსტა', false),
('auth.login', 'placeholders.email', 'ka', 'შეიყვანეთ თქვენი ელფოსტა', false),
('auth.login', 'labels.password', 'ka', 'პაროლი', false),
('auth.login', 'placeholders.password', 'ka', 'შეიყვანეთ თქვენი პაროლი', false),
('auth.login', 'forgotPassword', 'ka', 'დაგავიწყდათ პაროლი?', false),
('auth.login', 'cta.loading', 'ka', 'შესვლა...', false),
('auth.login', 'cta.submit', 'ka', 'შესვლა', false),
('auth.login', 'footer.prompt', 'ka', 'არ გაქვს ანგარიში?', false),
('auth.login', 'footer.link', 'ka', 'რეგისტრაცია', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;
