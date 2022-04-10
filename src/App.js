import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import Notification from "./notification";

function App() {
  return (
    <BrowserRouter>
      <Notification />
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} />
        <Route
          path="*"
          exact
          component={() => {
            return <h1>Error 404</h1>;
          }}
        />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
