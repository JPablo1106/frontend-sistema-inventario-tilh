import "bootstrap/dist/css/bootstrap.min.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa"
import axios from "axios"
import "../../styles/Login.css"
import processImage from "../../img/invCompuLogin.jpg"
import logo from "../../img/logo.png"

const RestablecerContrasena = () => {
  const navigate = useNavigate()
  // step 1: generar token; step 2: restablecer contraseña
  const [step, setStep] = useState(1)

  // Estados para recuperar
  const [usuario, setUsuario] = useState("")

  // Estados para restablecer
  const [token, setToken] = useState("")
  const [nuevaContrasena, setNuevaContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  // Enviar petición para generar token de recuperación
  const handleRecuperar = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const { data, status } = await axios.post(
        "https://backendsistemainventario.onrender.com/api/Administrador/RecuperarContrasena",
        { usuario },
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
          title: "Token Generado",
          text: data.mensaje,
          showConfirmButton: false,
          timer: 2000,
          customClass: { popup: "animated fadeInDown" },
        }).then(() => {
          // Auto-llenar el token recibido y pasar a la siguiente etapa
          setToken(data.token)
          setStep(2)
        })
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error al recuperar contraseña:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo generar el token",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  // Enviar petición para restablecer contraseña
  const handleRestablecer = async (event) => {
    event.preventDefault()
    // Validación: las contraseñas deben coincidir
    if (nuevaContrasena !== confirmarContrasena) {
      Swal.fire({
        icon: "warning",
        title: "Contraseñas no coinciden",
        text: "Asegúrate de que la nueva contraseña y su confirmación sean iguales.",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, status } = await axios.post(
        "https://backendsistemainventario.onrender.com/api/Administrador/RestablecerContrasena",
        { token, nuevaContrasena },
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
          title: "Contraseña Restablecida",
          text: data.mensaje,
          showConfirmButton: false,
          timer: 2000,
          customClass: { popup: "animated fadeInDown" },
        }).then(() => {
          navigate("/login", { replace: true })
        })
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error al restablecer la contraseña:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo restablecer la contraseña",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  // Botón para cancelar, redirige al login eliminando el historial
  const handleCancelar = () => {
    navigate("/", { replace: true })
  }

  return (
    <div className="login-container">
      <div className="login-card row g-0">
        {/* Imagen lateral */}
        <div className="col-lg-6 d-none d-lg-flex login-image-container">
          <img src={processImage || "/placeholder.svg"} alt="Recuperar/Restablecer Contraseña" className="login-image" />
          <div className="login-image-overlay">
            <div className="login-image-text">
              <h2>Sistema de Inventario</h2>
              <p>Gestión eficiente de equipos tecnológicos</p>
            </div>
          </div>
        </div>
        {/* Formulario */}
        <div className="col-lg-6 col-md-8 col-sm-12 login-form-container">
          <div className="login-header">
            <img src={logo || "/placeholder.svg"} alt="Logo" className="login-logo" />
            <div className="login-divider">
              <span className="login-divider-text">Sistema de Inventario</span>
            </div>
            {step === 1 ? (
              <>
                <h3 className="login-title">Recuperar Contraseña</h3>
                <p className="login-subtitle">
                  Ingresa tu usuario para generar el token de recuperación.
                </p>
              </>
            ) : (
              <>
                <h3 className="login-title">Restablecer Contraseña</h3>
                <p className="login-subtitle">
                  Ingresa el token y tu nueva contraseña.
                </p>
              </>
            )}
          </div>
          {step === 1 ? (
            <form onSubmit={handleRecuperar} className="login-form">
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
                <button type="submit" className="btn btn-primary btn-login" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRestablecer} className="login-form">
              <div className="form-group mb-4">
                <label className="form-label">Token</label>
                <div className="input-group">
                  <span className="input-group-text">TKN</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Token recibido"
                    value={token}
                    disabled
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">
                  <FaLock className="icon-label" /> Nueva Contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaLock />
                  </span>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    className="form-control"
                    placeholder="Ingresa la nueva contraseña"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary password-toggle"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  >
                    {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
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
                    type={mostrarContrasena ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirma la nueva contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4 d-flex justify-content-between">
                <button type="button" className="btn btn-outline-danger" onClick={handleCancelar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary " disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : (
                    "Restablecer Contraseña"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="login-footer">
            <p>© {new Date().getFullYear()} Sistema de Inventario. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestablecerContrasena
