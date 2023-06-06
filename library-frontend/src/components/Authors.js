import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS } from "../gql/queries";
import { EDIT_AUTHOR } from "../gql/mutations";
import { useState } from "react";

const Authors = (props) => {
  const [name, setName] = useState(null);
  const [birthyear, setBirthyear] = useState(null);

  const res = useQuery(ALL_AUTHORS);

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ALL_AUTHORS],
  });

  if (res.loading || !res.data) {
    return <div>Loading...</div>;
  }

  if (!props.show) {
    return null;
  }

  const updateBirthyear = () => {
    editAuthor({ variables: { name, setBornTo: Number(birthyear) } });
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {res.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <select onChange={(e) => setName(e.target.value)}>
        {res.data.allAuthors.map((a) => (
          <option key={a.id} value={a.name}>
            {a.name}
          </option>
        ))}
      </select>
      <div>
        born
        <input
          type="number"
          onChange={({ target }) => setBirthyear(target.value)}
        />
        <br />
        <button onClick={updateBirthyear}>Set birthyear</button>
      </div>
    </div>
  );
};

export default Authors;
