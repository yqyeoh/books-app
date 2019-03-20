const mongoose = require("mongoose");

// const authorSchema = new mongoose.Schema({
//   name: String,
//   age: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 150
//   }
// });
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
    // authors:[authorSchema]
  },
  { timestamps: true }
);

bookSchema.virtual("titleAndAuthor").get(() => {
  return `${this.title} ${this.author}`;
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
