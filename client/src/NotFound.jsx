import { useRouteError } from "react-router-dom";

const NotFound = () => {
  const error = useRouteError();
  console.log(error);

  return(
    <div id="not-found-page">
      <h1>Oops!</h1>
      <p>Seems this doesn&apos;t exist anymore.</p>
      <p><i>{error.statusText || error.message}</i></p>
    </div>
  );
}

export default NotFound;