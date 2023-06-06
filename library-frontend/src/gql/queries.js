import { gql } from "@apollo/client";

const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    id
    name
    born
    bookCount
  }
`;

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author {
      id
      name
      born
      bookCount
    }
    published
    genres
  }
`;

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`;

export const ALL_BOOKS = gql`
  query ($genre: String, $author: String) {
    allBooks(genre: $genre, author: $author) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const ALL_GENRES = gql`
  query {
    allGenres
  }
`;

export const USER_RECOMMENDATIONS = gql`
  query {
    recommendations {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const BOOK_ADDED = gql`
  subscription bookAdded {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;
