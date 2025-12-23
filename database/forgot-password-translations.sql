-- Forgot Password and Reset Password Translations
-- English translations for auth.forgotPassword namespace
insert into public.translations (namespace, translation_key, locale, value, auto_generated)
values
  ('auth.forgotPassword', 'title', 'en', 'Reset Your Password', false),
  ('auth.forgotPassword', 'subtitle', 'en', 'Enter your email address and we''ll send you a link to reset your password.', false),
  ('auth.forgotPassword', 'label.email', 'en', 'Email', false),
  ('auth.forgotPassword', 'placeholder.email', 'en', 'Enter your email', false),
  ('auth.forgotPassword', 'cta.submit', 'en', 'Send Reset Link', false),
  ('auth.forgotPassword', 'cta.loading', 'en', 'Sending...', false),
  ('auth.forgotPassword', 'success.title', 'en', 'Reset Link Sent!', false),
  ('auth.forgotPassword', 'success.message', 'en', 'Check your email for a link to reset your password. If it doesn''t appear within a few minutes, check your spam folder.', false),
  ('auth.forgotPassword', 'cta.backToLogin', 'en', 'Back to Login', false),
  ('auth.forgotPassword', 'error.invalidEmail', 'en', 'Please enter a valid email address.', false),
  ('auth.forgotPassword', 'error.failed', 'en', 'Failed to send reset link. Please try again.', false)
on conflict (namespace, translation_key, locale) do update set
  value = excluded.value,
  auto_generated = excluded.auto_generated,
  updated_at = now();

-- English translations for auth.resetPassword namespace
insert into public.translations (namespace, translation_key, locale, value, auto_generated)
values
  ('auth.resetPassword', 'title', 'en', 'Set New Password', false),
  ('auth.resetPassword', 'subtitle', 'en', 'Enter your new password below.', false),
  ('auth.resetPassword', 'label.password', 'en', 'New Password', false),
  ('auth.resetPassword', 'placeholder.password', 'en', 'Enter your new password', false),
  ('auth.resetPassword', 'label.confirmPassword', 'en', 'Confirm Password', false),
  ('auth.resetPassword', 'placeholder.confirmPassword', 'en', 'Confirm your new password', false),
  ('auth.resetPassword', 'cta.submit', 'en', 'Update Password', false),
  ('auth.resetPassword', 'cta.loading', 'en', 'Updating...', false),
  ('auth.resetPassword', 'success.title', 'en', 'Password Updated!', false),
  ('auth.resetPassword', 'success.message', 'en', 'Your password has been successfully updated. You can now sign in with your new password.', false),
  ('auth.resetPassword', 'cta.signIn', 'en', 'Sign In', false),
  ('auth.resetPassword', 'error.passwordMismatch', 'en', 'Passwords do not match.', false),
  ('auth.resetPassword', 'error.passwordRequired', 'en', 'Password must be at least 6 characters long.', false),
  ('auth.resetPassword', 'error.failed', 'en', 'Failed to update password. The link may have expired. Please try again.', false),
  ('auth.resetPassword', 'error.invalidLink', 'en', 'This password reset link is invalid or has expired.', false)
on conflict (namespace, translation_key, locale) do update set
  value = excluded.value,
  auto_generated = excluded.auto_generated,
  updated_at = now();

-- Georgian translations for auth.forgotPassword namespace
insert into public.translations (namespace, translation_key, locale, value, auto_generated)
values
  ('auth.forgotPassword', 'title', 'ka', 'აღადგინეთ თქვენი პაროლი', true),
  ('auth.forgotPassword', 'subtitle', 'ka', 'შეიყვანეთ თქვენი ელფოსტის მისამართი და ჩვენ გამოგიგზავნით ბმულს პაროლის აღსადგენად.', true),
  ('auth.forgotPassword', 'label.email', 'ka', 'ელფოსტა', true),
  ('auth.forgotPassword', 'placeholder.email', 'ka', 'შეიყვანეთ თქვენი ელფოსტა', true),
  ('auth.forgotPassword', 'cta.submit', 'ka', 'აღდგენის ბმულის გაგზავნა', true),
  ('auth.forgotPassword', 'cta.loading', 'ka', 'გაგზავნა...', true),
  ('auth.forgotPassword', 'success.title', 'ka', 'აღდგენის ბმული გაგზავნილია!', true),
  ('auth.forgotPassword', 'success.message', 'ka', 'შეამოწმეთ თქვენი ელფოსტა პაროლის აღსადგენი ბმულისთვის. თუ ის რამდენიმე წუთში არ გამოჩნდება, შეამოწმეთ სპამ ფოლდერი.', true),
  ('auth.forgotPassword', 'cta.backToLogin', 'ka', 'შესვლის გვერდზე დაბრუნება', true),
  ('auth.forgotPassword', 'error.invalidEmail', 'ka', 'გთხოვთ, შეიყვანოთ სწორი ელფოსტის მისამართი.', true),
  ('auth.forgotPassword', 'error.failed', 'ka', 'აღდგენის ბმულის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.', true)
on conflict (namespace, translation_key, locale) do update set
  value = excluded.value,
  auto_generated = excluded.auto_generated,
  updated_at = now();

-- Georgian translations for auth.resetPassword namespace
insert into public.translations (namespace, translation_key, locale, value, auto_generated)
values
  ('auth.resetPassword', 'title', 'ka', 'დააყენეთ ახალი პაროლი', true),
  ('auth.resetPassword', 'subtitle', 'ka', 'შეიყვანეთ თქვენი ახალი პაროლი ქვემოთ.', true),
  ('auth.resetPassword', 'label.password', 'ka', 'ახალი პაროლი', true),
  ('auth.resetPassword', 'placeholder.password', 'ka', 'შეიყვანეთ თქვენი ახალი პაროლი', true),
  ('auth.resetPassword', 'label.confirmPassword', 'ka', 'დაადასტურეთ პაროლი', true),
  ('auth.resetPassword', 'placeholder.confirmPassword', 'ka', 'დაადასტურეთ თქვენი ახალი პაროლი', true),
  ('auth.resetPassword', 'cta.submit', 'ka', 'პაროლის განახლება', true),
  ('auth.resetPassword', 'cta.loading', 'ka', 'განახლება...', true),
  ('auth.resetPassword', 'success.title', 'ka', 'პაროლი განახლებულია!', true),
  ('auth.resetPassword', 'success.message', 'ka', 'თქვენი პაროლი წარმატებით განახლდა. ახლა შეგიძლიათ შეხვიდეთ თქვენი ახალი პაროლით.', true),
  ('auth.resetPassword', 'cta.signIn', 'ka', 'შესვლა', true),
  ('auth.resetPassword', 'error.passwordMismatch', 'ka', 'პაროლები არ ემთხვევა.', true),
  ('auth.resetPassword', 'error.passwordRequired', 'ka', 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო.', true),
  ('auth.resetPassword', 'error.failed', 'ka', 'პაროლის განახლება ვერ მოხერხდა. ბმული შეიძლება ვადაგასულია. გთხოვთ, სცადოთ თავიდან.', true),
  ('auth.resetPassword', 'error.invalidLink', 'ka', 'ეს პაროლის აღდგენის ბმული არასწორია ან ვადაგასულია.', true)
on conflict (namespace, translation_key, locale) do update set
  value = excluded.value,
  auto_generated = excluded.auto_generated,
  updated_at = now();
