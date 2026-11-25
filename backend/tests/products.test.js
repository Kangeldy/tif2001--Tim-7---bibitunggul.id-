const request = require("supertest");

const mockQueryCalls = [];
let mockQueryResponse = { data: [], count: 0, error: null };

function createQueryBuilder() {
  const builder = {
    select: jest.fn((...args) => {
      mockQueryCalls.push(["select", ...args]);
      return builder;
    }),
    insert: jest.fn((...args) => {
      mockQueryCalls.push(["insert", ...args]);
      return builder;
    }),
    update: jest.fn((...args) => {
      mockQueryCalls.push(["update", ...args]);
      return builder;
    }),
    delete: jest.fn((...args) => {
      mockQueryCalls.push(["delete", ...args]);
      return builder;
    }),
    eq: jest.fn((...args) => {
      mockQueryCalls.push(["eq", ...args]);
      return builder;
    }),
    ilike: jest.fn((...args) => {
      mockQueryCalls.push(["ilike", ...args]);
      return builder;
    }),
    or: jest.fn((...args) => {
      mockQueryCalls.push(["or", ...args]);
      return builder;
    }),
    gte: jest.fn((...args) => {
      mockQueryCalls.push(["gte", ...args]);
      return builder;
    }),
    lte: jest.fn((...args) => {
      mockQueryCalls.push(["lte", ...args]);
      return builder;
    }),
    gt: jest.fn((...args) => {
      mockQueryCalls.push(["gt", ...args]);
      return builder;
    }),
    order: jest.fn((...args) => {
      mockQueryCalls.push(["order", ...args]);
      return builder;
    }),
    range: jest.fn((...args) => {
      mockQueryCalls.push(["range", ...args]);
      return builder;
    }),
    single: jest.fn(() => Promise.resolve(mockQueryResponse)),
    maybeSingle: jest.fn(() => Promise.resolve(mockQueryResponse)),
    then: (resolve, reject) => Promise.resolve(mockQueryResponse).then(resolve, reject),
  };
  return builder;
}

const mockSupabase = {
  from: jest.fn((table) => {
    mockQueryCalls.push(["from", table]);
    return createQueryBuilder();
  }),
};

jest.mock("../config/supabaseAdmin", () => mockSupabase);
jest.mock("../config/supabaseClient", () => mockSupabase);
jest.mock("../config/supabase", () => ({
  auth: { getUser: jest.fn() },
}));

const app = require("../app");

describe("Products CRUD, Dynamic Query (ILIKE, LIMIT/OFFSET), & Pagination JSON", () => {
  beforeEach(() => {
    mockQueryCalls.length = 0;
    mockQueryResponse = { data: [], count: 0, error: null };
    jest.clearAllMocks();
  });

  test("GET /api/products mengembalikan data beserta metadata paginasi JSON", async () => {
    mockQueryResponse = {
      data: [
        { id: 3, name: "Bibit Tomat Unggul", category: "Sayuran", price: 7000, stock: 50 },
        { id: 2, name: "Bibit Cabai Rawit", category: "Sayuran", price: 5000, stock: 45 },
      ],
      count: 12,
      error: null,
    };

    const res = await request(app).get("/api/products?page=2&limit=2");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual({
      total: 12,
      limit: 2,
      offset: 2,
      page: 2,
      totalPages: 6,
      hasNextPage: true,
      hasPrevPage: true,
    });
    expect(mockQueryCalls).toContainEqual(["select", "*", { count: "exact" }]);
    expect(mockQueryCalls).toContainEqual(["range", 2, 3]);
  });

  test("GET /api/products mendukung kueri dinamis ILIKE, filter harga, dan LIMIT/OFFSET langsung", async () => {
    mockQueryResponse = {
      data: [{ id: 1, name: "Bibit Jeruk Santang", category: "Buah", price: 25000, stock: 10 }],
      count: 1,
      error: null,
    };

    const res = await request(app).get(
      "/api/products?search=jeruk&category=buah&minPrice=10000&maxPrice=30000&inStock=true&sortBy=price&sortOrder=asc&limit=5&offset=10"
    );

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({
      total: 1,
      limit: 5,
      offset: 10,
      page: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: true,
    });
    expect(mockQueryCalls).toContainEqual(["ilike", "category", "buah"]);
    expect(mockQueryCalls).toContainEqual(["or", "name.ilike.%jeruk%,description.ilike.%jeruk%"]);
    expect(mockQueryCalls).toContainEqual(["gte", "price", 10000]);
    expect(mockQueryCalls).toContainEqual(["lte", "price", 30000]);
    expect(mockQueryCalls).toContainEqual(["gt", "stock", 0]);
    expect(mockQueryCalls).toContainEqual(["order", "price", { ascending: true }]);
    expect(mockQueryCalls).toContainEqual(["range", 10, 14]);
  });

  test("GET /api/products/:id mengembalikan 404 jika produk tidak ditemukan", async () => {
    mockQueryResponse = { data: null, error: null };

    const res = await request(app).get("/api/products/999");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/products memvalidasi input dan membuat produk baru", async () => {
    const invalidRes = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer admin-token-test")
      .send({ name: "", price: -10 });
    expect(invalidRes.status).toBe(400);

    mockQueryResponse = {
      data: { id: 10, name: "Bibit Durian Musang King", price: 75000, stock: 15, category: "Buah" },
      error: null,
    };

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer admin-token-test")
      .send({
        name: "Bibit Durian Musang King",
        price: 75000,
        stock: 15,
        category: "Buah",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Bibit Durian Musang King");
  });

  test("PUT /api/products/:id dan PATCH /api/products/:id memperbarui produk", async () => {
    mockQueryResponse = {
      data: { id: 10, name: "Bibit Durian Updated", price: 80000, stock: 20 },
      error: null,
    };

    const putRes = await request(app)
      .put("/api/products/10")
      .set("Authorization", "Bearer admin-token-test")
      .send({ name: "Bibit Durian Updated", price: 80000 });

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.price).toBe(80000);

    const patchRes = await request(app)
      .patch("/api/products/10")
      .set("Authorization", "Bearer admin-token-test")
      .send({ stock: 20 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.stock).toBe(20);
  });

  test("DELETE /api/products/:id mengembalikan 404 jika tidak ditemukan dan 200 jika berhasil", async () => {
    mockQueryResponse = { data: null, error: null };
    const notFoundRes = await request(app)
      .delete("/api/products/999")
      .set("Authorization", "Bearer admin-token-test");
    expect(notFoundRes.status).toBe(404);

    mockQueryResponse = { data: { id: 10, name: "Bibit Durian Updated" }, error: null };
    const okRes = await request(app)
      .delete("/api/products/10")
      .set("Authorization", "Bearer admin-token-test");
    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);
  });
});
