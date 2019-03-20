const { MongoMemoryServer } = require("mongodb-memory-server");

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const Book = require("../../models/book");

// mongoose.connect(
//   "mongodb://localhost/books-test",
//   { useNewUrlParser: true },
//   err => {
//     console.error(err);
//   }
// );

// const db = mongoose.connection;

const booksData = [
  {
    title: "Sherlock Holmes",
    author: "Arthur",
    price: 20,
    quantity: 80
  },
  { title: "Nancy Drew", author: "Mary", price: 15, quantity: 50 },
  { title: "Hello World", author: "Tim", price: 5, quantity: 30 },
  {
    title: "Sherlock Holmes",
    author: "Conan",
    price: 20,
    quantity: 80
  },
  {
    title: "Spring",
    author: "Arthur",
    price: 20,
    quantity: 80
  }
];

const route = (param = "") => {
  const path = "/books";
  return `${path}/${param}`;
};

describe("books", () => {
  let mongoServer;
  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useFindAndModify: false
    });
    // db.dropCollection("books", err => {
    //   console.error(err);
    // });
    // booksData = booksData.map(book => new Book(book));
    // console.log("books data", booksData);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // const db = mongoose.connection;
    // await db.dropCollection("books"); //why does this throw error whereas using callback doesn't?
    await Book.insertMany(booksData);
  });

  afterEach(async () => {
    const db = mongoose.connection;
    await db.dropCollection("books");
  });

  // can wrap around another describe ('[GET]')
  describe("/books", () => {
    test("get all books", () => {
      return request(app)
        .get(route())
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          const books = res.body;
          books.forEach((book, index) => {
            expect(book).toEqual(expect.objectContaining(booksData[index]));
          });
          expect(books).toHaveLength(5);
          expect(books[0]).toEqual(
            expect.objectContaining({
              _id: expect.any(String),
              title: "Sherlock Holmes",
              author: "Arthur"
            })
          );
        });
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
        .send(newBook)
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
        .send(newBook)
        .expect(403, done);
    });

    test("grants access to create new book with valid authorization token", async () => {
      const newBook = {
        title: "javascript basic",
        author: "Bob",
        price: 25,
        quantity: 60
      };

      const res = await request(app)
        .post(route())
        .set("authorization", "Bearer my-awesome-token")
        .send(newBook)
        .expect(201);

      expect(res.body.title).toBe("javascript basic");
      expect(res.body.author).toBe("Bob");

      // const expectedData = [
      //   {
      //     title: "Sherlock Holmes",
      //     author: "Arthur",
      //     price: 20,
      //     quantity: 80
      //   },
      //   { title: "Nancy Drew", author: "Mary", price: 15, quantity: 50 },
      //   { title: "Hello World", author: "Tim", price: 5, quantity: 30 },
      //   {
      //     title: "Sherlock Holmes",
      //     author: "Conan",
      //     price: 20,
      //     quantity: 80
      //   },
      //   {
      //     title: "javascript basic",
      //     author: "Bob",
      //     price: 25,
      //     quantity: 60
      //   }
      // ];

      const book = await Book.findOne({ title: "javascript basic" });
      expect(book.title).toBe("javascript basic");
      expect(book.author).toBe("Bob");

      // request(app)
      //   .get(route())
      //   .expect(200)
      //   .then(res => {
      //     const books = res.body;
      //     books.forEach((book, index) => {
      //       expect(book.title).toBe(expectedData[index].title);
      //       expect(book.author).toBe(expectedData[index].author);
      //     });
      //     expect(books).toHaveLength(5);
      //     done();
      //   });
    });
  });

  describe("/books?query", () => {
    test("get books by title & author", () => {
      const expected = [
        expect.objectContaining({ title: "Sherlock Holmes", author: "Arthur" }),
        expect.objectContaining({ title: "Sherlock Holmes", author: "Conan" }),
        expect.objectContaining({ title: "Spring", author: "Arthur" })
      ];
      return request(app)
        .get(route())
        .query({ title: "sherlock", author: "arthur" })
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          // const books = res.body
          // books.forEach((book,index)=>{
          //   expect(book).toEqual(expect.objectContaining(expectedBooks[index]))
          //   expect(book.title).toBe(expectedBooks[index].title)
          //   expect(book.author).toBe(expectedBooks[index].author)
          // })
          expect(res.body).toHaveLength(3);
          expect(res.body).toEqual(expect.arrayContaining(expected));
        });
    });
    test("get books by title", () => {
      const expected = [
        expect.objectContaining({ title: "Sherlock Holmes", author: "Arthur" }),
        expect.objectContaining({ title: "Sherlock Holmes", author: "Conan" })
      ];
      return request(app)
        .get(route())
        .query({ title: "sherlock" })
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          expect(res.body).toHaveLength(2);
          expect(res.body).toEqual(expect.arrayContaining(expected));
        });
    });
    test("get books by author", () => {
      return request(app)
        .get(route())
        .query({ author: "conan" })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty("title", "Sherlock Holmes");
          expect(res.body[0]).toHaveProperty("author", "Conan");
          expect(res.body[0]).toEqual(
            expect.objectContaining({
              title: "Sherlock Holmes",
              author: "Conan"
            })
          );
        });
    });
  });

  describe("/books/:id", () => {
    test("updates a book title via put with valid authorization token", async () => {
      // const id = "1";
      const updatedBook = {
        // id: "1",
        title: "Enid Blyton",
        author: "Mary",
        price: 20,
        quantity: 80
      };

      const book = await Book.findOne({ title: "Nancy Drew" });

      const res = await request(app)
        .put(route(book._id))
        .set("authorization", "Bearer my-awesome-token")
        .send(updatedBook)
        .expect(202);

      expect(res.body).toEqual(
        expect.objectContaining({ title: "Enid Blyton", author: "Mary" })
      );
      // return request(app)
      //   .put(route(id))
      //   .set("authorization", "Bearer my-awesome-token")
      //   .send({ updatedBook })
      //   .expect(202)
      //   .then(res => {
      //     expect(res.body).toEqual(expect.any(Object));
      //     expect(res.body).toEqual({
      //       id: "1",
      //       title: "x-men",
      //       author: "Arthur",
      //       price: 20,
      //       quantity: 80
      //     });
      //   });
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

    xtest("updates a book title via patch with valid authorization token", () => {
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

    test("deletes a book", async () => {
      const { _id } = await Book.findOne({ title: "Nancy Drew" });
      await request(app)
        .delete(route(_id))
        .set("authorization", "Bearer my-awesome-token")
        .expect(202);

      const book = await Book.findById(_id);
      expect(book).toBe(null);
      // return request(app)
      //   .delete(route(id))
      //   .set("authorization", "Bearer my-awesome-token")
      //   .expect(202);
    });

    test("deletes a book with invalid authorization token", done => {
      const _id = "1";
      request(app)
        .delete(route(_id))
        .set("authorization", "Bearer my-not-awesome-token")
        .expect(403, done);
    });

    test("deletes a book with no authorization token", done => {
      const _id = "1";
      request(app)
        .delete(route(_id))
        .expect(403, done);
    });

    test("deletes an invalid book", done => {
      const id = "5c8fb5c41529bf25dcba41a7";
      request(app)
        .delete(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .expect(404, done);
    });

    test("deletes an invalid book", done => {
      const id = "100";
      request(app)
        .delete(route(id))
        .set("authorization", "Bearer my-awesome-token")
        .catch(res => {
          expect(res.status).toBe(500);
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
