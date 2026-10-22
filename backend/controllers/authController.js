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
                email: data.user.email
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

module.exports = { login };