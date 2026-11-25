const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

describe("Pagination utility", () => {
  test("menggunakan default page=1, limit=10, offset=0 saat query kosong", () => {
    const result = parsePagination({});
    expect(result).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
      from: 0,
      to: 9,
    });
  });

  test("menghitung offset dan range dari page dan limit", () => {
    const result = parsePagination({ page: "3", limit: "5" });
    expect(result).toEqual({
      page: 3,
      limit: 5,
      offset: 10,
      from: 10,
      to: 14,
    });
  });

  test("mendukung offset langsung dan menghitung page yang sesuai", () => {
    const result = parsePagination({ limit: "10", offset: "20" });
    expect(result).toEqual({
      page: 3,
      limit: 10,
      offset: 20,
      from: 20,
      to: 29,
    });
  });

  test("membatasi limit maksimal ke 100 dan minimal ke 1", () => {
    expect(parsePagination({ limit: "500" }).limit).toBe(100);
    expect(parsePagination({ limit: "0" }).limit).toBe(1);
    expect(parsePagination({ limit: "-5" }).limit).toBe(1);
  });

  test("buildPaginationMeta menghasilkan metadata JSON paginasi yang akurat", () => {
    expect(buildPaginationMeta({ total: 25, page: 2, limit: 10, offset: 10 })).toEqual({
      total: 25,
      limit: 10,
      offset: 10,
      page: 2,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });

    expect(buildPaginationMeta({ total: 0, page: 1, limit: 10, offset: 0 })).toEqual({
      total: 0,
      limit: 10,
      offset: 0,
      page: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });
});
