import React, { useEffect } from "react";
import { useQuery, useApolloClient, useSubscription } from "@apollo/client";
import { USER_RECOMMENDATIONS, BOOK_ADDED } from "../gql/queries";

const updateRecommendationsCache = (cache, query, addedBook) => {
  const uniqueRecommendations = (allRecommendations) => {
    let recs = new Set();
    return allRecommendations.filter((r) =>
      recs.has(r.name) ? false : recs.add(r)
    );
  };
  cache.updateQuery(query, ({ recommendations }) => {
    return {
      recommendations: uniqueRecommendations(recommendations.concat(addedBook)),
    };
  });
};

const Recommended = ({ show, token }) => {
  const { loading, data, refetch } = useQuery(USER_RECOMMENDATIONS);

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data.data.bookAdded);
      window.alert(`New book added, ${data.data.bookAdded.title}`);
      updateRecommendationsCache(
        client.cache,
        { query: USER_RECOMMENDATIONS },
        data.data.bookAdded
      );
    },
  });

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [refetch, token]);

  if (!show) {
    return null;
  }

  if (loading || !data) {
    return <p>Loading...</p>;
  }

  if (!token) {
    return <p>Login to view recommendations</p>;
  }

  return (
    <div>
      <h2>Recommendations</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.recommendations.map((r) => (
            <tr key={r.title}>
              <td>{r.title}</td>
              <td>{r.author.name}</td>
              <td>{r.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommended;
