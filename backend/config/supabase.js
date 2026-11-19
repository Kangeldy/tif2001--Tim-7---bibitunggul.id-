const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;