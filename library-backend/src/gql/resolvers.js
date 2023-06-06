const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const Authors = require("../models/author");
const Books = require("../models/book");
const User = require("../models/user");

const resolvers = {
  Query: {
    dummy: () => 0,
    bookCount: async () => Books.collection.countDocuments(),
    authorCount: async () => Authors.collection.countDocuments(),
    allBooks: async (root, args) => {
      let edited_books = await Books.find({});
      if (args.author) {
        edited_books = edited_books.filter((b) => b.author === args.author);
      }
      if (args.genre) {
        edited_books = edited_books.filter((b) =>
          b.genres.includes(args.genre)
        );
      }
      return edited_books;
    },
    allAuthors: async () => Authors.find({}),
    me: (root, args, context) => context.currentUser,
    allGenres: async (root, args, { currentUser }) => Books.distinct("genres"),
    recommendations: async (root, args, { currentUser }) =>
      Books.find({ genres: currentUser.favoriteGenre }),
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      let author = await Authors.findOne({ name: args.author });
      if (!author) {
        const newAuthor = new Authors({
          name: args.author,
          born: null,
        });
        author = await newAuthor.save();
      }
      const book = new Books({
        title: args.title,
        author: author.id,
        published: args.published,
        genres: args.genres,
      });
      const savedBook = await book.save();

      pubsub.publish("BOOK_ADDED", { bookAdded: savedBook });

      return savedBook;
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const author = await Authors.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      await Authors.updateOne(
        { name: args.name },
        {
          born: args.setBornTo,
        }
      );
      return Authors.findOne({ name: args.name });
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });
      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "password") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },

  Author: {
    bookCount: async (root) => {
      const books = await Books.find({ author: root.id });
      return books.length;
    },
  },

  Book: {
    author: async (root) => {
      const author = await Authors.findOne({ _id: root.author });
      const bookCount = await Books.find({ author: author._id }).length;
      return {
        id: author.id,
        name: author.name,
        born: author.born,
        bookCount,
      };
    },
  },
};

module.exports = resolvers;
