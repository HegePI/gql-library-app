import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../gql/mutations";
import { TOKEN } from "../constants";

const Login = ({ show, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, res] = useMutation(LOGIN);

  useEffect(() => {
    if (res.data) {
      const token = res.data.login.value;
      setToken(token);
      localStorage.setItem(TOKEN, token);
    }
  }, res.data); // eslint-disable-line

  if (!show) {
    return null;
  }

  const submit = (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{" "}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
