const supabaseAdmin = require("../config/supabaseAdmin");

async function setAdminRole() {
  const userId = "48c324a7-fa08-45a4-8f99-7d8e8c682e93";

  const { data, error } =
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: {
        role: "admin",
      },
    });

  if (error) {
    console.error("Gagal menambahkan role admin:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log("Role berhasil diperbarui.");
  console.log(data.user.app_metadata);
}

setAdminRole();