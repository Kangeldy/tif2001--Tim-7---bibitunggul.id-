
<?php
session_start();

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit;
}

$nama = $_SESSION["nama"] ?? "Pengguna";
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard - bibitunggul</title>

    <style>
        * { box-sizing: border-box; }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f8f5;
            color: #25352a;
        }

        header {
            background: #198754;
            color: white;
            padding: 20px 7%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }

        header h2 { margin: 0; }

        .logout {
            background: white;
            color: #198754;
            padding: 10px 16px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
        }

        main {
            padding: 35px 7%;
        }

        .welcome {
            background: white;
            padding: 28px;
            border-radius: 16px;
            box-shadow: 0 4px 15px #0000000d;
        }

        .welcome h1 { color: #198754; }

        .products {
            display: grid;
            grid-template-columns: repeat(
                auto-fit, minmax(200px, 1fr)
            );
            gap: 20px;
            margin-top: 25px;
        }

        .product {
            background: white;
            padding: 22px;
            border-radius: 14px;
        }

        .product .icon { font-size: 40px; }
        .product h3 { margin-bottom: 8px; }
    </style>
</head>

<body>
    <header>
        <h2>🌱 bibitunggul</h2>
        <a class="logout" href="logout.php">Keluar</a>
    </header>

    <main>
        <section class="welcome">
            <h1>Selamat datang, <?= htmlspecialchars($nama) ?>!</h1>
            <p>
                Selamat datang di sistem penjualan bibit tanaman
                bibitunggul.
            </p>
            <p>Temukan bibit berkualitas untuk tanaman Anda.</p>
        </section>

        <h2>Kategori Produk</h2>

        <section class="products">
            <div class="product">
                <div class="icon">🌱</div>
                <h3>Bibit Sayuran</h3>
                <p>Berbagai bibit untuk kebun sayuran.</p>
            </div>

            <div class="product">
                <div class="icon">🌳</div>
                <h3>Bibit Buah</h3>
                <p>Bibit untuk kebun buah dan pekarangan.</p>
            </div>

            <div class="product">
                <div class="icon">🌼</div>
                <h3>Bibit Tanaman Hias</h3>
                <p>Tanaman hias untuk mempercantik rumah.</p>
            </div>
        </section>
    </main>
</body>
</html>
