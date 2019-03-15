const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const uuidv4 = require("uuid/v4");

let books = [
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

const selectById = id => {
  return books.find(book => book.id === id);
};

function verifyToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.sendStatus(403);
  } else {
    if (authorization === "Bearer my-awesome-token") {
      next();
    } else {
      res.sendStatus(403);
    }
  }
}

protectedRouter.use(verifyToken);

router.route("/").get((req, res) => {
  let filteredBooks = books;
  const keys = Object.keys(req.query);
  // filteredBooks = books.filter(book => book[key]);
  for (const key in req.query) {
    filteredBooks = filteredBooks.filter(book =>
      book[key].toLowerCase().includes(req.query[key].toLowerCase())
    );
  }
  res.json(filteredBooks);
});

protectedRouter.route("/").post((req, res) => {
  const { newBook } = req.body;
  newBook.id = uuidv4();
  books.push(newBook);
  res.status(201).json(newBook);
});

protectedRouter
  .route("/:id")
  .put((req, res) => {
    const { updatedBook } = req.body;
    const found = selectById(req.params.id);
    if (found) {
      const index = books.indexOf(found);
      books[index] = updatedBook;
      res.status(202).json(updatedBook);
    } else {
      res.status(400).end();
    }
  })
  .delete((req, res) => {
    const found = selectById(req.params.id);
    if (found) {
      books = books.filter(book => book.id !== req.params.id);
      res.status(202).end();
    } else {
      res.status(400).end();
    }
  })
  .patch((req, res) => {
    const { updates } = req.body;
    const found = selectById(req.params.id);
    if (found) {
      const index = books.indexOf(found);
      books[index] = { ...found, ...updates };
      res.status(202).json(books[index]);
    } else {
      res.status(400).end();
    }
  });

module.exports = { router, protectedRouter };
