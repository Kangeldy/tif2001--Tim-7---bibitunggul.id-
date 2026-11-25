const supabase = require("../config/supabaseClient");
const supabaseAdmin = require("../config/supabaseAdmin");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Periksa input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi"
            });
        }

        // Dukungan akun demo cepat jika tombol demo ditekan
        if (email === "admin@bibitunggul.id" && password === "admin12345") {
            return res.status(200).json({
                success: true,
                message: "Login berhasil (Admin Demo)",
                user: {
                    id: "admin-demo-id",
                    email: "admin@bibitunggul.id",
                    role: "admin",
                    app_metadata: { role: "admin" },
                    user_metadata: { name: "Administrator Demo" }
                },
                session: {
                    access_token: "admin-token-" + Date.now(),
                    token_type: "bearer"
                }
            });
        }

        if (email === "pelanggan@bibitunggul.id" && password === "demo12345") {
            return res.status(200).json({
                success: true,
                message: "Login berhasil (Pelanggan Demo)",
                user: {
                    id: "demo-user-id",
                    email: "pelanggan@bibitunggul.id",
                    role: "user",
                    app_metadata: { role: "user" },
                    user_metadata: { name: "Pelanggan Demo" }
                },
                session: {
                    access_token: "demo-token-" + Date.now(),
                    token_type: "bearer"
                }
            });
        }

        // Login menggunakan Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            let msg = error.message;
            if (msg === "Invalid login credentials") {
                msg = "Email atau password salah";
            } else if (msg === "Email not confirmed") {
                msg = "Email belum diverifikasi. Silakan hubungi admin atau konfirmasi email Anda.";
            }
            return res.status(401).json({
                success: false,
                message: msg
            });
        }

        // Kirim hasil login akun asli Supabase
        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            user: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.app_metadata?.role || "user",
                app_metadata: data.user.app_metadata || { role: "user" },
                user_metadata: data.user.user_metadata || {}
            },
            session: data.session
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server: " + error.message
        });
    }
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    // Gunakan supabaseAdmin untuk membuat akun dan langsung mengonfirmasi email (email_confirm: true)
    // agar pengguna baru bisa langsung login tanpa terkendala verifikasi email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split("@")[0] },
      app_metadata: { role: "user" }
    });

    if (error) {
      let msg = error.message;
      if (msg.includes("already been registered") || msg.includes("already registered")) {
        msg = "Email sudah terdaftar. Silakan gunakan email lain atau langsung login.";
      }
      return res.status(400).json({ success: false, message: msg });
    }

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil! Akun Anda sudah aktif, silakan login.",
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (!token.startsWith("demo-token") && !token.startsWith("admin-token")) {
        try {
          await supabase.auth.admin.signOut(token);
        } catch {}
      }
    }
    return res.status(200).json({ success: true, message: "Logout berhasil" });
  } catch (error) {
    return res.status(200).json({ success: true, message: "Logout berhasil" });
  }
};

module.exports = { login, register, logout };