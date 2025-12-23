-- Dashboard shell namespace translations for Georgian (ka)
-- This fixes the missing Georgian translations for the dashboard navigation

-- English translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
('dashboard.shell', 'nav.brand', 'en', 'Mentoring Platform', false),
('dashboard.shell', 'nav.welcome', 'en', 'Welcome', false),
('dashboard.shell', 'nav.roleLabel', 'en', 'coordinator', false),
('dashboard.shell', 'nav.editProfile', 'en', 'Edit Profile', false),
('dashboard.shell', 'nav.signOut', 'en', 'Sign Out', false),
-- Role-specific translations
('dashboard.shell', 'nav.role.mentor', 'en', 'mentor', false),
('dashboard.shell', 'nav.role.mentee', 'en', 'mentee', false),
('dashboard.shell', 'nav.role.coordinator', 'en', 'coordinator', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = NOW();

-- Georgian translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
('dashboard.shell', 'nav.brand', 'ka', 'მენტორინგის პლატფორმა', true),
('dashboard.shell', 'nav.welcome', 'ka', 'მოგესალმებით', true),
('dashboard.shell', 'nav.roleLabel', 'ka', 'კოორდინატორი', true),
('dashboard.shell', 'nav.editProfile', 'ka', 'პროფილის რედაქტირება', true),
('dashboard.shell', 'nav.signOut', 'ka', 'გასვლა', true),
-- Role-specific translations
('dashboard.shell', 'nav.role.mentor', 'ka', 'მენტორი', true),
('dashboard.shell', 'nav.role.mentee', 'ka', 'მოსწავლე', true),
('dashboard.shell', 'nav.role.coordinator', 'ka', 'კოორდინატორი', true)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = NOW();
