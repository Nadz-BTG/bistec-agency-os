import { createClient } from '@supabase/supabase-js'

// The anon key is meant to be public — it ships in the client bundle by
// design. Access control comes entirely from the row-level security policies
// in supabase/schema.sql, not from keeping this key secret.
const SUPABASE_URL = 'https://cdsgeddamxzhroqtitfx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2dlZGRhbXh6aHJvcXRpdGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2ODI2MzUsImV4cCI6MjEwMTI1ODYzNX0.iyMfBvNdUtdxTWBpkJ8AJeODUa3ctd-iCGNSmbk0_b0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const FILES_BUCKET = 'client-files'
