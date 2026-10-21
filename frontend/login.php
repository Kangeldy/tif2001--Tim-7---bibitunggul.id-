<?php
session_start();
require_once "koneksi.php";

$error = "";

if (isset($_SESSION["user_id"])) {
    header("Location: dashboard.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Masukkan email yang valid.";
    } else {
        try {
            $stmt = $pdo->prepare(
                "SELECT id, nama, email, password
                 FROM public.users
                 WHERE email = :email
                 LIMIT 1"
            );

            $stmt->execute(["email" => $email]);
            $user = $stmt->fetch();

            if ($user && password_verify(
                $password, $user["password"]
            )) {
                session_regenerate_id(true);

                $_SESSION["user_id"] = $user["id"];
                $_SESSION["nama"] = $user["nama"];

                header("Location: dashboard.php");
                exit;
            }

            $error = "Email atau password salah.";
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $error = "Terjadi kesalahan. Silakan coba lagi.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login - bibitunggul</title>

    <style>
        * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(
                135deg, #08c9e9, #087bff, #0645ed
            );
        }

        .login-card {
            width: 100%;
            max-width: 400px;
            padding: 38px 30px;
            border-radius: 25px;
            background: white;
            box-shadow: 0 15px 35px rgba(0,0,0,.22);
        }

        .logo {
            text-align: center;
            font-size: 42px;
        }

        h1 {
            color: #142c65;
            text-align: center;
            margin: 8px 0;
        }

        .subtitle {
            text-align: center;
            color: #71809b;
            margin-bottom: 28px;
        }

        .input-group { margin-bottom: 15px; }

        .input-group input {
            width: 100%;
            padding: 15px;
            border: 0;
            outline: none;
            border-radius: 30px;
            background: #edf0f5;
            font-size: 14px;
        }

        .options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            margin: 18px 0;
            font-size: 12px;
            color: #63718a;
        }

        a {
            color: #087bff;
            text-decoration: none;
        }

        .btn-login {
            width: 100%;
            padding: 15px;
            border: 0;
            border-radius: 30px;
            color: white;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            background: linear-gradient(90deg, #0758f9, #08c4e9);
        }

        .btn-login:hover { opacity: .85; }

        .register {
            text-align: center;
            margin-top: 22px;
            color: #71809b;
            font-size: 13px;
        }

        .error, .success {
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-size: 13px;
        }

        .error { background: #ffe5e5; color: #b42318; }
        .success { background: #e3f6e8; color: #237a3b; }

        @media (max-width: 480px) {
            .login-card { padding: 32px 22px; }
        }
    </style>
</head>

<body>
    <div class="login-card">
        <div class="logo">🌱</div>
        <h1>bibitunggul</h1>
        <p class="subtitle">Selamat datang kembali!</p>

        <?php if ($error !== ""): ?>
            <div class="error">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_GET["daftar"]) &&
                  $_GET["daftar"] === "berhasil"): ?>
            <div class="success">
                Pendaftaran berhasil. Silakan login.
            </div>
        <?php endif; ?>

        <form method="POST">
            <div class="input-group">
                <input type="email" name="email"
                       placeholder="Email address"
                       autocomplete="username" required>
            </div>

            <div class="input-group">
                <input type="password" name="password"
                       placeholder="Password"
                       autocomplete="current-password" required>
            </div>

            <div class="options">
                <span>🌱 Bibit berkualitas</span>
                <a href="daftar.php">Buat akun</a>
            </div>

            <button type="submit" class="btn-login">
                MASUK
            </button>
        </form>

        <p class="register">
            Belum punya akun?
            <a href="daftar.php">Daftar sekarang</a>
        </p>
    </div>
</body>
</html>
