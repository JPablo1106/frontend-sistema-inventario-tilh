import "bootstrap/dist/css/bootstrap.min.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { FaEye, FaEyeSlash, FaUser, FaLock, FaUserPlus, FaSignInAlt } from "react-icons/fa"
import axios from "axios"
import "../../styles/Login.css"
import registerImage from "../../img/invCompuLogin.jpg"
import logo from "../../img/logo.png"

const RegistrarAdmin = () => {
  const [nombreAdmin, setNombreAdmin] = useState("")
  const [usuario, setUsuario] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [confirmarContraseña, setConfirmarContraseña] = useState("")
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const redirigirLogin = () => {
    // Navegar a la ruta "/" sin dejar un historial de navegación
    navigate("/", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Validación de que las contraseñas sean iguales
    if (contraseña !== confirmarContraseña) {
      Swal.fire({
        icon: "warning",
        title: "Contraseñas no coinciden",
        text: "Por favor, asegúrate de que la contraseña y la confirmación sean iguales.",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, status } = await axios.post(
        "https://backendsistemainventario.onrender.com/api/Administrador/Registrarse",
        { nombreAdmin, usuario, contraseña },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      )

      setIsLoading(false)
      if (status === 200) {
        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "El administrador se ha registrado correctamente.",
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: "animated fadeInDown",
          },
        }).then(() => {
          navigate("/", { replace: true })
        })
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error en el registro:", error)
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: error.response?.data?.message || "No se pudo registrar el administrador",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card row g-0">
        <div className="col-lg-6 d-none d-lg-flex login-image-container">
          <img src={registerImage || "/placeholder.svg"} alt="Registro de Administrador" className="login-image" />
          <div className="login-image-overlay">
            <div className="login-image-text">
              <h2>Sistema de Inventario</h2>
              <p>Gestión eficiente de equipos tecnológicos</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-8 col-sm-12 login-form-container">
          <div className="login-header">
            <img src={logo || "/placeholder.svg"} alt="Logo" className="login-logo" />
            <div className="login-divider">
              <span className="login-divider-text">Sistema de Inventario</span>
            </div>
            <h3 className="login-title">Registro de Administrador</h3>
            <p className="login-subtitle">
              Ingresa los datos para crear una nueva cuenta de administrador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group mb-4">
              <label className="form-label">
                <FaUser className="icon-label" /> Nombre del Administrador
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese su nombre completo"
                  value={nombreAdmin}
                  onChange={(e) => setNombreAdmin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
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

            <div className="form-group mb-4">
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

            <div className="form-group mb-4">
              <label className="form-label">
                <FaLock className="icon-label" /> Confirmar Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type={mostrarContraseña ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirme su contraseña"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <button type="submit" className="btn btn-primary btn-login" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="me-2" /> Registrarse
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="register-section">
            <div className="register-divider">
              <span>¿Ya tienes una cuenta?</span>
            </div>
            <button type="button" className="btn btn-secondary btn-register" onClick={redirigirLogin}>
              <FaSignInAlt className="me-2" /> Inicia Sesión
            </button>
          </div>

          <div className="login-footer">
            <p>© {new Date().getFullYear()} Sistema de Inventario. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrarAdmin
