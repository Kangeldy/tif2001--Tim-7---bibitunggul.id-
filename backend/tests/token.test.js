
const jwt = require("jsonwebtoken");
const {
  generateToken,
  verifyToken,
} = require("../utils/token");

describe("Token generator", () => {
  beforeAll(() => {
    process.env.JWT_SECRET =
      "test-secret-yang-panjang-untuk-pengujian";
  });

  test("menghasilkan token untuk pengguna", () => {
    const token = generateToken({
      id: "user-123",
      role: "user",
    });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  test("token valid berisi identitas dan role pengguna", () => {
    const token = generateToken({
      id: "user-123",
      role: "admin",
    });

    const payload = verifyToken(token);

    expect(payload.sub).toBe("user-123");
    expect(payload.role).toBe("admin");
  });

  test("token yang diubah ditolak", () => {
    const token = generateToken({
      id: "user-123",
      role: "user",
    });

    const tamperedToken = token + "rusak";

    expect(() => verifyToken(tamperedToken)).toThrow();
  });

  test("token dengan secret yang salah ditolak", () => {
    const token = generateToken({
      id: "user-123",
      role: "user",
    });

    expect(() => {
      jwt.verify(token, "secret-yang-berbeda");
    }).toThrow();
  });
});
