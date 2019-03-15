const request = require("supertest");
const app = require("./app");

describe("My first route", () => {
  test("request for index page returns successfully", () => {
    return request(app)
      .get("/")
      .expect(200)
      .expect("hello");
  });
});
