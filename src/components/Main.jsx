import { Routes, Route, useLocation } from "react-router-dom";
import App from "../App";
import Login from "./Login";

const Main = () => {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
      {location.pathname !== "/" && <App />}
    </>
  );
};

export default Main;
