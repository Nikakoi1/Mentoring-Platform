-- Add login form registration options translations
-- This adds Georgian translations for the login form registration options

-- English translations (already exist, but adding for completeness)
INSERT INTO translations (namespace, locale, key, value) VALUES
('auth.login', 'en', 'register.mentor', 'Register as Mentor'),
('auth.login', 'en', 'register.mentee', 'Register as Mentee'),
('auth.login', 'en', 'register.or', 'or')
ON CONFLICT (namespace, locale, key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

-- Georgian translations
INSERT INTO translations (namespace, locale, key, value) VALUES
('auth.login', 'ka', 'register.mentor', 'დარეგისტრირდი მენტორად'),
('auth.login', 'ka', 'register.mentee', 'დარეგისტრირდი მოსწავლედ'),
('auth.login', 'ka', 'register.or', 'ან')
ON CONFLICT (namespace, locale, key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

-- Add missing Georgian login form translations if they don't exist
INSERT INTO translations (namespace, locale, key, value) VALUES
('auth.login', 'ka', 'title', 'მოგესალმეთ კვლავ'),
('auth.login', 'ka', 'subtitle', 'შედით თქვენს მენტორინგის პლატფორმის ანგარიშზე'),
('auth.login', 'ka', 'labels.email', 'ელფოსტა'),
('auth.login', 'ka', 'placeholders.email', 'შეიყვანეთ თქვენი ელფოსტა'),
('auth.login', 'ka', 'labels.password', 'პაროლი'),
('auth.login', 'ka', 'placeholders.password', 'შეიყვანეთ თქვენი პაროლი'),
('auth.login', 'ka', 'forgotPassword', 'დაგავიწყდათ პაროლი?'),
('auth.login', 'ka', 'cta.loading', 'შესვლა...'),
('auth.login', 'ka', 'cta.submit', 'შესვლა'),
('auth.login', 'ka', 'footer.prompt', 'არ გაქვს ანგარიში?'),
('auth.login', 'ka', 'footer.link', 'რეგისტრაცია')
ON CONFLICT (namespace, locale, key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;
