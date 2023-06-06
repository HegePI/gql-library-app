import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { useApolloClient } from "@apollo/client";
import Recommended from "./components/Recommendations";
import { TOKEN } from "./constants";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (localStorage.getItem(TOKEN)) {
      const token = localStorage.getItem(TOKEN);
      setToken(token);
    }
  }, []);

  const client = useApolloClient();

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommended")}>Recommended</button>
          </>
        )}
        {token ? (
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommended show={page === "recommended"} token={token} />

      <Login show={page === "login"} setToken={setToken} />
    </div>
  );
};

export default App;
