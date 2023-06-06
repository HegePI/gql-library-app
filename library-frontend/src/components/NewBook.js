import { useState } from "react";
import { ADD_BOOK } from "../gql/mutations";
import { ALL_AUTHORS, ALL_BOOKS, USER_RECOMMENDATIONS } from "../gql/queries";
import { useMutation } from "@apollo/client";

const NewBook = ({ show }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [ALL_BOOKS, ALL_AUTHORS, USER_RECOMMENDATIONS],
    onError: (err) => {
      const messages = err.map((e) => e.message).join("\n");
      setErrorMsg(messages);
    },
  });

  if (!show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    addBook({
      variables: { title, author, published: Number(published), genres },
    });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <Error errorMessage={errorMsg} />
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

const Error = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}> {errorMessage} </div>;
};

export default NewBook;
