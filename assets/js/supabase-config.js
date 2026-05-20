/* Taj Al Sukun — Supabase connection config
   ============================================================
   ONE-TIME SETUP
   --------------
   1. Get your publishable / anon key from Supabase Dashboard:
        Settings → API → Project API keys → anon public  (or)
        Settings → API Keys → Publishable keys

   2. Paste it into ANON_KEY below.

   3. Run the SQL in `db/001_initial_schema.sql` in your Supabase
      SQL Editor to create the tables.

   That's it — the site will switch from localStorage-only to
   Supabase automatically once both URL and key are present.
*/

window.TAJ_SUPABASE = {
  URL:      'https://vrljiousxfvjvkhkftwt.supabase.co',
  ANON_KEY: 'sb_publishable_u6kMuxYz8psWu1sA_DDQgg_ylMOC_Uj',
  ENABLED:  false // auto-flipped to true at runtime when key is present
};

(function () {
  const cfg = window.TAJ_SUPABASE;
  cfg.ENABLED = !!(cfg.URL && cfg.ANON_KEY && cfg.ANON_KEY.length > 20);
})();
