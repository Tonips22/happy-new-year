-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  unsubscribe_token uuid DEFAULT gen_random_uuid() UNIQUE,
  newsletter_sent boolean DEFAULT false,
  CONSTRAINT subscribers_pkey PRIMARY KEY (id)
);