
const {
    hashPassword,
    verifyPassword,
  } = require("../utils/password");
  
  describe("Password hashing", () => {
    test("password diubah menjadi hash, bukan disimpan sebagai teks biasa", async () => {
      const password = "ContohPassword123!";
      const hashedPassword = await hashPassword(password);
  
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });
  
    test("password yang benar cocok dengan hash", async () => {
      const password = "ContohPassword123!";
      const hashedPassword = await hashPassword(password);
  
      await expect(
        verifyPassword(password, hashedPassword)
      ).resolves.toBe(true);
    });
  
    test("password yang salah tidak cocok dengan hash", async () => {
      const hashedPassword = await hashPassword(
        "ContohPassword123!"
      );
  
      await expect(
        verifyPassword("PasswordSalah!", hashedPassword)
      ).resolves.toBe(false);
    });
  });
  