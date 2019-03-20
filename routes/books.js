const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const uuidv4 = require("uuid/v4");

const Book = require("../models/book");

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
    return res.sendStatus(403);
  }
  if (authorization === "Bearer my-awesome-token") {
    return next();
  }
  res.sendStatus(403);
}

protectedRouter.use(verifyToken);

router.route("/").get(async (req, res) => {
  // Book.findOne({title:'Spring'}).populate('author').then(function(book){
  //   return res.send(book.titleAndAuthor)
  // })
  const keys = Object.keys(req.query);
  const filterExpressions = keys.map(key => ({
    [key]: new RegExp(req.query[key], "i")
  }));
  if (keys.length === 0) {
    return res.json(await Book.find());
  }
  // else {
  try {
    const books = await Book.find().or(filterExpressions);
    res.json(books);
  } catch (err) {
    res.sendStatus(500);
  }
  // .then(books => res.json(books))
  // .catch(error => res.status(500).end());
  // .exec(function(err, books) {
  //   if (err) {
  //     return res.status(500).end();
  //   }
  //   return res.json(books);
  // });
  // }
});

protectedRouter.route("/").post(async (req, res) => {
  const book = new Book(req.body);
  try {
    const savedBook = await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.sendStatus(500);
  }
  // book.save((err, book) => {
  //   if (err) {
  //     return res.status(500).end();
  //   }
  //   return res.status(201).json(book);
  // });
  // const { newBook } = req.body;
  // newBook.id = uuidv4();
  // books.push(newBook);
  // res.status(201).json(newBook);
});

protectedRouter
  .route("/:id")
  .put((req, res) => {
    Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
      (err, book) => {
        if (err) {
          return res.sendStatus(400);
        }
        return res.status(202).json(book);
      }
    );
    // const { updatedBook } = req.body;
    // const found = selectById(req.params.id);
    // if (found) {
    //   const index = books.indexOf(found);
    //   books[index] = updatedBook;
    //   res.status(202).json(updatedBook);
    // } else {
    //   res.status(400).end();
    // }
  })
  .delete((req, res) => {
    Book.findByIdAndDelete(req.params.id, (err, book) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (!book) {
        return res.sendStatus(404);
      }
      return res.sendStatus(202);
    });

    // const found = selectById(req.params.id);
    // if (found) {
    //   books = books.filter(book => book.id !== req.params.id);
    //   res.status(202).end();
    // } else {
    //   res.status(400).end();
    // }
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
