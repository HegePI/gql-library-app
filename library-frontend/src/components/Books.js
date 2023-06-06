import React from "react";

import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { ALL_BOOKS, ALL_GENRES, BOOK_ADDED } from "../gql/queries";

const updateAllBooksCache = (cache, query, addedBook) => {
  const uniqueBooksByName = (allBooks) => {
    let books = new Set();
    return allBooks.filter((b) => (books.has(b.name) ? false : books.add(b)));
  };
  cache.updateQuery(query, ({ allBooks }) => {
    return { allBooks: uniqueBooksByName(allBooks.concat(addedBook)) };
  });
};

const Books = ({ show }) => {
  const allBooks = useQuery(ALL_BOOKS);
  const allGenres = useQuery(ALL_GENRES);

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      window.alert(`New book added, ${data.data.bookAdded.title}`);
      updateAllBooksCache(
        client.cache,
        { query: ALL_BOOKS },
        data.data.bookAdded
      );
      allGenres.refetch();
    },
  });

  if (
    allBooks.loading ||
    !allBooks.data ||
    allGenres.loading ||
    !allGenres.data
  ) {
    return <div>Loading...</div>;
  }

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {allBooks.data.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {allGenres.data.allGenres.map((genre) => (
        <button key={genre} onClick={() => allBooks.refetch({ genre })}>
          {genre}
        </button>
      ))}
      <button onClick={() => allBooks.refetch({ genre: null })}>
        All genres
      </button>
    </div>
  );
};

export default Books;
