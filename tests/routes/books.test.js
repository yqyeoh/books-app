const request = require("supertest");
const app = require("../../app");

const booksData = [
  {
    id: "1",
    title: "Sherlock Holmes",
    author: "Arthur",
    price: 20,
    quantity: 80
  },
  { id: "2", title: "Nancy Drew", author: "Mary", price: 15, quantity: 50 },
  { id: "3", title: "Hello World", author: "Tim", price: 5, quantity: 30 },
  {
    id: "4",
    title: "Sherlock Holmes",
    author: "Conan",
    price: 20,
    quantity: 80
  }
];

const route = (param = "") => {
  const path = "/books";
  return `${path}/${param}`;
};

describe("books", () => {
  //can wrap around another describe ('[GET]')
  describe("/books", () => {
    test("get all books", () => {
      return request(app)
        .get(route())
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(booksData);
    });

    test("forbids access to create new book with no authorization", done => {
      const newBook = {
        title: "javascript basic",
        author: "Bob",
        price: 25,
        quantity: 60
      };
      request(app)
        .post(route())
        .send({ newBook })
        .expect(403, done);
    });

    test("forbids access to create new book with invalid authorization token", done => {
      const newBook = {
        title: "javascript basic",
        author: "Bob",
        price: 25,
        quantity: 60
      };
      request(app)
        .post(route())
        .set("authorization", "Bearer invalid-token")
        .send({ newBook })
        .expect(403, done);
    });

    test("grants access to create new book with valid authorization token", () => {
      const newBook = {
        title: "javascript basic",
        author: "Bob",
        price: 25,
        quantity: 60
      };
      return request(app)
        .post(route())
        .set("authorization", "Bearer my-awesome-token")
        .send({ newBook })
        .expect(201)
        .then(res => {
          expect(res.body).toEqual({
            id: expect.any(String),
            title: "javascript basic",
            author: "Bob",
            price: 25,
            quantity: 60
          });
        });
    });
  });

  describe("/books?query", () => {
    test("get books by title & author", () => {
      return request(app)
        .get(route())
        .query({ title: "sherlock", author: "arthur" })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect([
          {
            id: "1",
            title: "Sherlock Holmes",
            author: "Arthur",
            price: 20,
            quantity: 80
          },
          {
            id: "4",
            title: "Sherlock Holmes",
            author: "Conan",
            price: 20,
            quantity: 80
          }
        ]);
    });
    test("get books by title", () => {
      return request(app)
        .get(route())
        .query({ title: "sherlock" })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect([
          {
            id: "1",
            title: "Sherlock Holmes",
            author: "Arthur",
            price: 20,
            quantity: 80
          },
          {
            id: "4",
            title: "Sherlock Holmes",
            author: "Conan",
            price: 20,
            quantity: 80
          }
        ]);
    });
    test("get books by author", () => {
      return request(app)
        .get(route())
        .query({ author: "conan" })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect([
          {
            id: "4",
            title: "Sherlock Holmes",
            author: "Conan",
            price: 20,
            quantity: 80
          }
        ]);
    });
  });

  describe("/books/:id", () => {
    test("updates a book title via put with valid authorization token", () => {
      const id = "1";
      const updatedBook = {
        id: "1",
        title: "x-men",
        author: "Arthur",
        price: 20,
        quantity: 80
      };
      return request(app)
        .put(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .send({ updatedBook })
        .expect(202)
        .then(res => {
          expect(res.body).toEqual(expect.any(Object));
          expect(res.body).toEqual({
            id: "1",
            title: "x-men",
            author: "Arthur",
            price: 20,
            quantity: 80
          });
        });
    });

    test("updates an invalid book via put with valid authorization token", done => {
      const id = "100";
      const updatedBook = {
        id: "100",
        title: "x-men",
        author: "Arthur",
        price: 20,
        quantity: 80
      };
      request(app)
        .put(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .send({ updatedBook })
        .expect(400, done);
    });

    test("updates a book title via put with invalid authorization token", done => {
      const id = "1";
      const updatedBook = {
        id: "1",
        title: "x-men",
        author: "Arthur",
        price: 20,
        quantity: 80
      };
      request(app)
        .put(route(id))
        .set("authorization", "Bearer my-not-awesome-token")
        .send({ updatedBook })
        .expect(403, done);
    });

    test("updates a book title via put with no authorization token", done => {
      const id = "1";
      const updatedBook = {
        id: "1",
        title: "x-men",
        author: "Arthur",
        price: 20,
        quantity: 80
      };
      request(app)
        .put(route(id))
        .send({ updatedBook })
        .expect(403, done);
    });

    test("updates a book title via patch with valid authorization token", () => {
      const id = "1";
      const updatedTitle = { title: "x-men" };
      return request(app)
        .patch(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .send({ updatedTitle })
        .expect(202)
        .then(res => {
          expect(res.body).toEqual(expect.any(Object));
          expect(res.body).toEqual({
            id: "1",
            title: "x-men",
            price: 20,
            quantity: 80,
            author: "Arthur"
          });
        });
    });

    test("updates an invalid book via patch with valid authorization token", done => {
      const id = "100";
      const updatedTitle = { title: "x-men" };
      request(app)
        .patch(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .send({ updatedTitle })
        .expect(400, done);
    });

    test("updates a book title via patch with no authorization token", done => {
      const id = "1";
      const updatedTitle = { title: "x-men" };
      request(app)
        .patch(route(id))
        .send({ updatedTitle })
        .expect(403, done);
    });

    test("updates a book title via patch with invalid authorization token", done => {
      const id = "1";
      const updatedTitle = { title: "x-men" };
      return request(app)
        .patch(route(id))
        .set("authorization", "Bearer my-not-awesome-token")
        .send({ updatedTitle })
        .expect(403, done);
    });

    test("deletes a book", () => {
      const id = "1";
      return request(app)
        .delete(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .expect(202);
    });

    test("deletes a book with invalid authorization token", done => {
      const id = "1";
      request(app)
        .delete(route(id))
        .set("authorization", "Bearer my-not-awesome-token")
        .expect(403, done);
    });

    test("deletes a book with no authorization token", done => {
      const id = "1";
      request(app)
        .delete(route(id))
        .expect(403, done);
    });

    test("deletes an invalid book", done => {
      const id = "100";
      request(app)
        .delete(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .expect(400, done);
    });

    test("deletes an invalid book", done => {
      const id = "100";
      request(app)
        .delete(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .catch(res => {
          expect(res.status).toBe(400);
          done();
        });
    });

    // should not use this as there'll be false positive - if you expect it to fail but it returns 200, won't fall into the catch block
    // test("deletes an invalid book", async () => {
    //   const id = "100";
    //   try {
    //     await request(app)
    //       .delete(route(id))
    //       .set("authorization", "Bearer my-awesome-token");
    //   } catch (error) {
    //     const { response } = error;
    //     expect(response.status).toEqual(400);
    //   }
    // });

    // test('deletes a book', ()=>{
    //     const id = '100'
    //     return request(app)
    //     .delete(route(id))
    //     .expect(400)
    // }) //will throw error
  });
});
