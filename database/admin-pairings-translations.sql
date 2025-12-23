-- Admin Pairings List Translations
-- English translations for adminPairingsList namespace

INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated, updated_at) VALUES
('adminPairingsList', 'title', 'en', 'Existing Mentor-Mentee Pairs', false, NOW()),
('adminPairingsList', 'loading', 'en', 'Loading existing pairs...', false, NOW()),
('adminPairingsList', 'noPermission', 'en', 'You do not have permission to view this information.', false, NOW()),
('adminPairingsList', 'loadError', 'en', 'Failed to load pairings. Please try again later.', false, NOW()),
('adminPairingsList', 'noPairs', 'en', 'No mentor-mentee pairs have been created yet.', false, NOW()),
('adminPairingsList', 'mentorLabel', 'en', 'Mentor:', false, NOW()),
('adminPairingsList', 'menteeLabel', 'en', 'Mentee:', false, NOW()),
('adminPairingsList', 'coordinatorLabel', 'en', 'Coordinator:', false, NOW()),
('adminPairingsList', 'statusLabel', 'en', 'Status:', false, NOW()),
('adminPairingsList', 'createdLabel', 'en', 'Created:', false, NOW()),
('adminPairingsList', 'activeStatus', 'en', 'Active', false, NOW()),
('adminPairingsList', 'inactiveStatus', 'en', 'Inactive', false, NOW()),
('adminPairingsList', 'pendingStatus', 'en', 'Pending', false, NOW())
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = EXCLUDED.updated_at;

-- Georgian translations for adminPairingsList namespace

INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated, updated_at) VALUES
('adminPairingsList', 'title', 'ka', 'არსებული მენტორ-სტუდენტის წყვილები', true, NOW()),
('adminPairingsList', 'loading', 'ka', 'არსებული წყვილების ჩატვირთვა...', true, NOW()),
('adminPairingsList', 'noPermission', 'ka', 'თქვენ არ გაქვთ ნებართვა ამ ინფორმაციის სანახავად.', true, NOW()),
('adminPairingsList', 'loadError', 'ka', 'წყვილების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.', true, NOW()),
('adminPairingsList', 'noPairs', 'ka', 'ჯერ არცერთი მენტორ-სტუდენტის წყვილი არაა შექმნილი.', true, NOW()),
('adminPairingsList', 'mentorLabel', 'ka', 'მენტორი:', true, NOW()),
('adminPairingsList', 'menteeLabel', 'ka', 'სტუდენტი:', true, NOW()),
('adminPairingsList', 'coordinatorLabel', 'ka', 'კოორდინატორი:', true, NOW()),
('adminPairingsList', 'statusLabel', 'ka', 'სტატუსი:', true, NOW()),
('adminPairingsList', 'createdLabel', 'ka', 'შექმნილია:', true, NOW()),
('adminPairingsList', 'activeStatus', 'ka', 'აქტიური', true, NOW()),
('adminPairingsList', 'inactiveStatus', 'ka', 'არააქტიური', true, NOW()),
('adminPairingsList', 'pendingStatus', 'ka', 'მოლოდინში', true, NOW())
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = EXCLUDED.updated_at;
