/* Anonymous-letters backend (Supabase). The anon key is public by design:
 * it can only INSERT letters; reading them needs the admin password, checked on the server. */
window.SCHOOL_CFG = {
  supabaseUrl: '',
  anonKey: ''
};
