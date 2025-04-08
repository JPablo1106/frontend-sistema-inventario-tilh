import { Routes, Route, useLocation } from "react-router-dom";
import App from "../App";
import Login from "./Login";
import RegistrarAdmin from "./administrador/RegistrarAdmin";
import RestablecerContrasena from "./administrador/RestablecerContrasena";

const Main = () => {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/registrarse' element={<RegistrarAdmin/>} />
        <Route path='/restablecer-contrasena' element={<RestablecerContrasena/>} />
      </Routes>
      {location.pathname !== "/" && location.pathname != "/registrarse" && location.pathname !== "/restablecer-contrasena" && <App />}
    </>
  );
};

export default Main;
