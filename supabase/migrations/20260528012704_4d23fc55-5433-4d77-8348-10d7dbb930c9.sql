ALTER TABLE public.pending_tools RENAME TO submissions;
ALTER TABLE public.submissions RENAME COLUMN founder_name TO submitter_name;
ALTER TABLE public.submissions RENAME COLUMN contact_email TO submitter_email;
ALTER TABLE public.submissions RENAME COLUMN category_id TO tool_category;