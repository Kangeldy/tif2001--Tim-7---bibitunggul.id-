
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
async function setAdminRole() {
  const userId = "48c324a7-fa08-45a4-8f99-7d8e8c682e93";

  const { data, error } =
    await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        role: "admin"
      }
    });

  if (error) {
    console.error("Gagal:", error.message);
    return;
  }

  console.log("Berhasil menambahkan role admin!");
  console.log(data.user.app_metadata);
}

setAdminRole();
module.exports = supabase;
