
<?php
require_once "koneksi.php";

$pesan = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nama = trim($_POST["nama"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if (
        $nama === "" ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        strlen($password) < 8
    ) {
        $pesan = "Isi data dengan benar. Password minimal 8 karakter.";
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $pdo->prepare(
                "INSERT INTO public.users (nama, email, password)
                 VALUES (:nama, :email, :password)"
            );

            $stmt->execute([
                "nama" => $nama,
                "email" => $email,
                "password" => $hash
            ]);

            header("Location: login.php?daftar=berhasil");
            exit;
        } catch (PDOException $e) {
            if ($e->getCode() === "23505") {
                $pesan = "Email sudah terdaftar.";
            } else {
                error_log($e->getMessage());
                $pesan = "Pendaftaran gagal. Silakan coba lagi.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Daftar - bibitunggul</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 20px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #08c9e9, #0645ed);
        }
        .card {
            background: white;
            width: 100%;
            max-width: 380px;
            padding: 30px;
            box-sizing: border-box;
            border-radius: 22px;
        }
        h1 { color: #142c65; text-align: center; }
        input {
            width: 100%;
            padding: 13px;
            margin: 8px 0;
            border: 0;
            border-radius: 25px;
            background: #edf0f5;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 14px;
            margin-top: 12px;
            border: 0;
            border-radius: 25px;
            color: white;
            font-weight: bold;
            background: linear-gradient(90deg, #0758f9, #08c4e9);
            cursor: pointer;
        }
        .pesan { color: #b42318; font-size: 14px; }
        .link { text-align: center; margin-top: 18px; }
        a { color: #087bff; text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🌱 bibitunggul</h1>
        <p>Silakan buat akun baru.</p>

        <?php if ($pesan !== ""): ?>
            <p class="pesan">
                <?= htmlspecialchars($pesan) ?>
            </p>
        <?php endif; ?>

        <form method="POST">
            <input type="text" name="nama"
                   placeholder="Nama lengkap" required>

            <input type="email" name="email"
                   placeholder="Alamat email" required>

            <input type="password" name="password"
                   placeholder="Password (minimal 8 karakter)"
                   minlength="8" required>

            <button type="submit">DAFTAR</button>
        </form>

        <p class="link">
            Sudah punya akun? <a href="login.php">Login</a>
        </p>
    </div>
</body>
</html>
