-- Admin landing page translations (English + Georgian)
-- Run in Supabase SQL Editor, then commit alongside this file

-- English translations (en)
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
('admin.home', 'loading', 'en', 'Loading...', false),
('admin.home', 'guest.badge', 'en', 'Coordinator Access', false),
('admin.home', 'guest.title', 'en', 'Private admin signup portal', false),
('admin.home', 'guest.description', 'en', 'This page is reserved for program coordinators we''ve invited to manage the mentoring program. Use the secure signup link to create your coordinator account or sign in if you already have one.', false),
('admin.home', 'guest.cards.request.title', 'en', 'Request Coordinator Access', false),
('admin.home', 'guest.cards.request.description', 'en', 'Use the coordinator signup flow with the invitation email you received.', false),
('admin.home', 'guest.cards.login.title', 'en', 'Already have access?', false),
('admin.home', 'guest.cards.login.description', 'en', 'Sign in to continue coordinating mentor / mentee onboarding and program activities.', false),
('admin.home', 'guest.footer', 'en', 'Didn''t receive an invitation? Contact the Adviso program team so we can verify and onboard you.', false),
('admin.home', 'nav.back', 'en', '← Back to Dashboard', false),
('admin.home', 'nav.panelLabel', 'en', 'Admin Panel', false),
('admin.home', 'panel.title', 'en', 'Admin Panel', false),
('admin.home', 'cards.users', 'en', 'Manage Users', false),
('admin.home', 'cards.pairings', 'en', 'Create Pairings', false),
('admin.home', 'cards.reports', 'en', 'View Reports', false),
('admin.home', 'cards.settings', 'en', 'System Settings', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated;

-- Georgian translations (ka)
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
('admin.home', 'loading', 'ka', 'იტვირთება...', true),
('admin.home', 'guest.badge', 'ka', 'კოორდინატორის წვდომა', true),
('admin.home', 'guest.title', 'ka', 'ადმინისტრატორის დახურული რეგისტრაცია', true),
('admin.home', 'guest.description', 'ka', 'ეს გვერდი განკუთვნილია მხოლოდ იმ პროგრამის კოორდინატორებისთვის, რომლებიც მოვიწვიეთ მენტორინგის პროგრამის სამართავად. გამოიყენეთ დაცული ბმული ახალი ანგარიშისთვის ან შედით, თუ უკვე გაქვთ წვდომა.', true),
('admin.home', 'guest.cards.request.title', 'ka', 'მოითხოვეთ კოორდინატორის წვდომა', true),
('admin.home', 'guest.cards.request.description', 'ka', 'გამოიყენეთ კოორდინატორის რეგისტრაციის ნაკადი იმ მიწვევის ელფოსტით, რომელიც მიიღეთ.', true),
('admin.home', 'guest.cards.login.title', 'ka', 'უკვე გაქვთ წვდომა?', true),
('admin.home', 'guest.cards.login.description', 'ka', 'შედით, რათა გააგრძელოთ მენტორებისა და მოსწავლეების მართვა და პროგრამის პროცესები.', true),
('admin.home', 'guest.footer', 'ka', 'მიწვევა ვერ მიიღეთ? დაგვიკავშირდით, რომ დავადას्टუროთ და onboarding-ი გავაკეთოთ.', true),
('admin.home', 'nav.back', 'ka', '← დაბრუნდით დაფაზე', true),
('admin.home', 'nav.panelLabel', 'ka', 'ადმინ პანელი', true),
('admin.home', 'panel.title', 'ka', 'ადმინ პანელი', true),
('admin.home', 'cards.users', 'ka', 'მომხმარებლების მართვა', true),
('admin.home', 'cards.pairings', 'ka', 'წყვილების შექმნა', true),
('admin.home', 'cards.reports', 'ka', 'ანგარიშების ნახვა', true),
('admin.home', 'cards.settings', 'ka', 'სისტემური პარამეტრები', true)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated;
