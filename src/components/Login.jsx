import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import axios from "axios";
import "../styles/Login.css";
import login from '../img/invCompuLogin.jpg';
import logo from '../img/logo.png';

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      const { data, status } = await axios.post(
        "https://backendsistemainventario.onrender.com/api/Administrador/Login",
        { usuario, contraseña },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );
  
      setIsLoading(false);
  
      if (status === 200 && data.token) {
        // Guardar en localStorage
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("expira", data.expira);
        localStorage.setItem("nombreAdmin", data.nombreAdmin);
        localStorage.setItem("usuario", data.usuario);
  
        Swal.fire({
          icon: "success",
          title: `¡Bienvenido, ${data.nombreAdmin}!`,
          text: "Inicio de sesión exitoso",
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: "animated fadeInDown",
          },
        }).then(() => {
          navigate("/dashboard", { replace: true });
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error en el login:", error);
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Usuario o contraseña incorrectos",
        confirmButtonColor: "#0275d8",
      });
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-card row g-0">
        <div className="col-lg-6 d-none d-lg-flex login-image-container">
          <img
            src={login}
            alt="Sistema de Inventario"
            className="login-image"
          />
          <div className="login-image-overlay">
            <div className="login-image-text">
              <h2>Sistema de Inventario</h2>
              <p>Gestión eficiente de equipos tecnológicos</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-8 col-sm-12 login-form-container">
          <div className="login-header">
            <img src={logo} alt="Logo" className="login-logo" />
            <hr />
            <h3 className="login-title">Iniciar Sesión</h3>
            <p className="login-subtitle">
              Bienvenido al <strong>Sistema de Inventario de Equipos Tecnológicos</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group mb-3">
              <label className="form-label">
                <FaUser className="icon-label" /> Usuario
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese su nombre de usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">
                <FaLock className="icon-label" /> Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type={mostrarContraseña ? "text" : "password"}
                  className="form-control"
                  placeholder="Ingrese su contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary password-toggle"
                  onClick={() => setMostrarContraseña(!mostrarContraseña)}
                >
                  {mostrarContraseña ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group mb-3">
              <a href="#" className="forgot-password">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary btn-login" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Autenticando...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="me-2" /> Iniciar Sesión
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p>© {new Date().getFullYear()} Sistema de Inventario. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
