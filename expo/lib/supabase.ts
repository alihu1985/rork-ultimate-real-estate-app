import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akyewhnbhyifqymkfwcz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreWV3aG5iaHlpZnF5bWtmd2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDkzNDgsImV4cCI6MjA4MDgyNTM0OH0.bwYyWnPq3BCPUN-j9iI8DCtrHDxre6n29TylwwBEoEk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
