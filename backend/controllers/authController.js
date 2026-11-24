const supabase = require("../config/supabaseClient");

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

        // Login menggunakan Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        // Kirim hasil login
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
            message: "Terjadi kesalahan pada server"
        });
    }
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });

    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return res.status(400).json({ success: false, message: error.message });

    return res.status(201).json({ success: true, message: "Registrasi berhasil. Silakan cek email untuk verifikasi.", user: { id: data.user.id, email: data.user.email } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await supabase.auth.admin.signOut(token);
    }
    return res.status(200).json({ success: true, message: "Logout berhasil" });
  } catch (error) {
    return res.status(200).json({ success: true, message: "Logout berhasil" });
  }
};

module.exports = { login, register, logout };