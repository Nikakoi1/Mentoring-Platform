-- Mentee Clients Page Translations
-- Adds English and Georgian translations for the mentee clients management interface

-- English translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated) VALUES
  -- mentee.clientsPage namespace
  ('mentee.clientsPage', 'title', 'en', 'Client Management', false),
  ('mentee.clientsPage', 'loading', 'en', 'Loading your account...', false),
  ('mentee.clientsPage', 'unauthorized', 'en', 'Only mentees can manage clients.', false),
  
  -- mentee.clients namespace
  ('mentee.clients', 'title', 'en', 'Your Clients', false),
  ('mentee.clients', 'description', 'en', 'Manage the clients you currently serve.', false),
  ('mentee.clients', 'sectionManage', 'en', 'Client List', false),
  ('mentee.clients', 'buttonAdd', 'en', 'Add Client', false),
  ('mentee.clients', 'buttonSave', 'en', 'Save Client', false),
  ('mentee.clients', 'buttonUpdate', 'en', 'Update Client', false),
  ('mentee.clients', 'buttonCancel', 'en', 'Cancel', false),
  ('mentee.clients', 'buttonActivate', 'en', 'Activate', false),
  ('mentee.clients', 'buttonDeactivate', 'en', 'Deactivate', false),
  ('mentee.clients', 'buttonEdit', 'en', 'Edit', false),
  ('mentee.clients', 'loading', 'en', 'Loading your clients...', false),
  ('mentee.clients', 'empty', 'en', 'You have not added any clients yet.', false),
  ('mentee.clients', 'statusLabel', 'en', 'Status:', false),
  ('mentee.clients', 'statusActive', 'en', 'Active', false),
  ('mentee.clients', 'statusInactive', 'en', 'Inactive', false),
  ('mentee.clients', 'formTitleNew', 'en', 'Add New Client', false),
  ('mentee.clients', 'formTitleEdit', 'en', 'Edit Client', false),
  ('mentee.clients', 'formLabelName', 'en', 'Client Name / Identification Code', false),
  ('mentee.clients', 'formLabelAddress', 'en', 'Address', false),
  ('mentee.clients', 'formLabelServices', 'en', 'Services Provided', false),
  ('mentee.clients', 'formPlaceholderName', 'en', 'e.g., ABC Enterprises / 123456789', false),
  ('mentee.clients', 'formPlaceholderAddress', 'en', 'Street, City, Country', false),
  ('mentee.clients', 'formPlaceholderServices', 'en', 'Describe the services you deliver', false),
  ('mentee.clients', 'errorLoad', 'en', 'Failed to load clients. Please try again later.', false),
  ('mentee.clients', 'errorSave', 'en', 'Unable to save the client. Please try again.', false),
  ('mentee.clients', 'successSave', 'en', 'Client saved successfully.', false)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE
  SET value = EXCLUDED.value,
      auto_generated = EXCLUDED.auto_generated,
      updated_at = NOW();

-- Georgian translations
INSERT INTO public.translations (namespace, translation_key, locale, value, auto_generated) VALUES
  -- mentee.clientsPage namespace
  ('mentee.clientsPage', 'title', 'ka', 'კლიენტების მართვა', true),
  ('mentee.clientsPage', 'loading', 'ka', 'თქვენი ანგარიშის ჩატვირთვა...', true),
  ('mentee.clientsPage', 'unauthorized', 'ka', 'მხოლოდ მენტორებს შეუძლიათ კლიენტების მართვა.', true),
  
  -- mentee.clients namespace
  ('mentee.clients', 'title', 'ka', 'თქვენი კლიენტები', true),
  ('mentee.clients', 'description', 'ka', 'მართეთ კლიენტები, რომლებსაც ამჟამად ემსახურებით.', true),
  ('mentee.clients', 'sectionManage', 'ka', 'კლიენტების სია', true),
  ('mentee.clients', 'buttonAdd', 'ka', 'კლიენტის დამატება', true),
  ('mentee.clients', 'buttonSave', 'ka', 'კლიენტის შენახვა', true),
  ('mentee.clients', 'buttonUpdate', 'ka', 'კლიენტის განახლება', true),
  ('mentee.clients', 'buttonCancel', 'ka', 'გაუქმება', true),
  ('mentee.clients', 'buttonActivate', 'ka', 'გააქტიურება', true),
  ('mentee.clients', 'buttonDeactivate', 'ka', 'დეაქტივაცია', true),
  ('mentee.clients', 'buttonEdit', 'ka', 'რედაქტირება', true),
  ('mentee.clients', 'loading', 'ka', 'თქვენი კლიენტების ჩატვირთვა...', true),
  ('mentee.clients', 'empty', 'ka', '�ერ არ დაგიმატებიათ კლიენტები.', true),
  ('mentee.clients', 'statusLabel', 'ka', 'სტატუსი:', true),
  ('mentee.clients', 'statusActive', 'ka', 'აქტიური', true),
  ('mentee.clients', 'statusInactive', 'ka', 'არააქტიური', true),
  ('mentee.clients', 'formTitleNew', 'ka', 'ახალი კლიენტის დამატება', true),
  ('mentee.clients', 'formTitleEdit', 'ka', 'კლიენტის რედაქტირება', true),
  ('mentee.clients', 'formLabelName', 'ka', 'კლიენტის სახელი / იდენტიფიკაციო კოდი', true),
  ('mentee.clients', 'formLabelAddress', 'ka', 'მისამართი', true),
  ('mentee.clients', 'formLabelServices', 'ka', 'მომსახურება', true),
  ('mentee.clients', 'formPlaceholderName', 'ka', 'მაგ: ABC Enterprises / 123456789', true),
  ('mentee.clients', 'formPlaceholderAddress', 'ka', 'ქუჩა, ქალაქი, ქვეყანა', true),
  ('mentee.clients', 'formPlaceholderServices', 'ka', 'აღწერეთ მომსახურება, რომელსაც აღასრულებთ', true),
  ('mentee.clients', 'errorLoad', 'ka', 'კლიენტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.', true),
  ('mentee.clients', 'errorSave', 'ka', 'კლიენტის შენახვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.', true),
  ('mentee.clients', 'successSave', 'ka', 'კლიენტი წარმატებით შეინახა.', true)
ON CONFLICT (namespace, translation_key, locale) DO UPDATE
  SET value = EXCLUDED.value,
      auto_generated = EXCLUDED.auto_generated,
      updated_at = NOW();
