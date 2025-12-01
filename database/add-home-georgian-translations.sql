-- Home page translations
-- English translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
('home', 'nav.brand', 'en', 'Mentoring Platform', false),
('home', 'nav.dashboard', 'en', 'Dashboard', false),
('home', 'nav.signIn', 'en', 'Sign In', false),
('home', 'nav.register', 'en', 'Register', false),
('home', 'hero.heading.leading', 'en', 'Welcome to the', false),
('home', 'hero.heading.highlight', 'en', 'Mentoring Platform', false),
('home', 'hero.description', 'en', 'Connect mentors and mentees for meaningful professional development relationships. Build skills, share knowledge, and grow together.', false),
('home', 'hero.ctaPrimary', 'en', 'Go to Dashboard', false),
('home', 'hero.ctaGetStarted', 'en', 'Get Started', false),
('home', 'hero.ctaLearnMore', 'en', 'Learn More', false),
('home', 'features.title', 'en', 'Platform Features', false),
('home', 'features.subtitle', 'en', 'Everything you need for successful mentoring relationships', false),
('home', 'features.matching.title', 'en', 'Mentor Matching', false),
('home', 'features.matching.description', 'en', 'Connect with experienced mentors in your field based on skills, interests, and goals.', false),
('home', 'features.tracking.title', 'en', 'Progress Tracking', false),
('home', 'features.tracking.description', 'en', 'Monitor your development journey with goal setting and milestone tracking.', false),
('home', 'features.communication.title', 'en', 'Communication Tools', false),
('home', 'features.communication.description', 'en', 'Built-in messaging and video call scheduling for seamless mentor-mentee interactions.', false),
('home', 'footer.copy', 'en', '© 2025 Mentoring Platform. Built for professional development.', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = NOW();

-- Georgian translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated)
VALUES
('home', 'nav.brand', 'ka', 'მენტორინგის პლატფორმა', true),
('home', 'nav.dashboard', 'ka', 'დაფა', true),
('home', 'nav.signIn', 'ka', 'შესვლა', true),
('home', 'nav.register', 'ka', 'რეგისტრაცია', true),
('home', 'hero.heading.leading', 'ka', 'მოგესალმებათ', true),
('home', 'hero.heading.highlight', 'ka', 'მენტორინგის პლატფორმა', true),
('home', 'hero.description', 'ka', 'დააკავშირეთ მენტორები და მოსწავლეები მნიშვნელოვანი პროფესიული განვითარების ურთიერთობებისთვის. ააშენეთ უნარები, გააზიარეთ ცოდნა და ერთად გაიზარდეთ.', true),
('home', 'hero.ctaPrimary', 'ka', 'დაფაზე გადასვლა', true),
('home', 'hero.ctaGetStarted', 'ka', 'დაწყება', true),
('home', 'hero.ctaLearnMore', 'ka', 'მეტის გაგება', true),
('home', 'features.title', 'ka', 'პლატფორმის ფუნქციები', true),
('home', 'features.subtitle', 'ka', 'ყველაფერი, რაც გჭირდებათ წარმატებული მენტორული ურთიერთობებისთვის', true),
('home', 'features.matching.title', 'ka', 'მენტორთან დაკავშირება', true),
('home', 'features.matching.description', 'ka', 'დაუკავშირდით გამოცდილ მენტორებს თქვენი სფეროდან უნარების, ინტერესების და მიზნების მიხედვით.', true),
('home', 'features.tracking.title', 'ka', 'პროგრესის ტრეკინგი', true),
('home', 'features.tracking.description', 'ka', 'მეთვალყურეობეთ თქვენს განვითარების გზას მიზნების დაყენებით და ეტაპების ტრეკინგით.', true),
('home', 'features.communication.title', 'ka', 'კომუნიკაციის ხელსაწყოები', true),
('home', 'features.communication.description', 'ka', 'ჩაშენებული მესიჯინგი და ვიდეო ზარების დაგეგმვა უწყვეტი მენტორ-მოსწავლე ინტერაქციებისთვის.', true),
('home', 'footer.copy', 'ka', '© 2025 მენტორინგის პლატფორმა. შექმნილია პროფესიული განვითარებისთვის.', true)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE SET
  value = EXCLUDED.value,
  auto_generated = EXCLUDED.auto_generated,
  updated_at = NOW();
