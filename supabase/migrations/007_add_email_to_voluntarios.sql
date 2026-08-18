-- Migration 007: Add email to voluntarios table
-- Execute in Supabase SQL Editor / CLI

alter table voluntarios add column if not exists email text;
