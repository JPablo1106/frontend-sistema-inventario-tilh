import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../extras/axiosIntance"
import Swal from "sweetalert2"
import { FaPaperPlane, FaTrademark, FaTimes, FaInfoCircle, FaArrowLeft, FaShieldAlt } from "react-icons/fa"
import { MdElectricMeter, MdElectricalServices } from "react-icons/md"
import { BsMusicPlayerFill } from "react-icons/bs"
import "bootstrap/dist/css/bootstrap.min.css";
import '../../styles/Formulario.css';

const RegistrarEquipoSeg = () => {
  const navigate = useNavigate()
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [capacidad, setCapacidad] = useState("")
  const [tipo, setTipo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({
    marca: "",
    modelo: "",
    capacidad: "",
    tipo: "",
  })

  const validateForm = () => {
    let isValid = true
    const errors = {
      marca: "",
      modelo: "",
      capacidad: "",
      tipo: "",
    }

    if (!marca.trim()) {
      errors.marca = "La marca del equipo es requerida"
      isValid = false
    }

    if (!modelo.trim()) {
      errors.modelo = "El modelo del equipo es requerido"
      isValid = false
    }

    if (!capacidad.trim()) {
      errors.capacidad = "La capacidad del equipo es requerida"
      isValid = false
    }

    if (!tipo.trim()) {
      errors.tipo = "El tipo del equipo es requerido"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      Swal.fire({
        title: "Registrando equipo de seguridad",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const token = localStorage.getItem("jwt")
      const equipoSegResponse = await api.post(
        "EquiposSeguridad/RegistrarEquipoSeguridad",
        {
          marca,
          modelo,
          capacidad,
          tipo,
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Respuesta de la API Equipos de Seguridad", equipoSegResponse.data)

      // Limpiar los campos del formulario
      setMarca("")
      setModelo("")
      setCapacidad("")
      setTipo("")

      Swal.fire({
        icon: "success",
        title: "¡Equipo de seguridad registrado!",
        text: "El equipo de seguridad ha sido registrado exitosamente en el sistema.",
        showConfirmButton: true,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          navigate("/equipos-seguridad")
        }
      })
    } catch (error) {
      console.error("Error al enviar los datos:", error.message)
      Swal.fire({
        icon: "error",
        title: "Error al registrar equipo de seguridad",
        text: "No se pudo registrar el equipo de seguridad. Por favor, intenta de nuevo.",
        confirmButtonColor: "#3085d6",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Perderás los datos ingresados",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, continuar",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/equipos-seguridad")
      }
    })
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-primary">
            <FaShieldAlt className="me-2" />
            Registro de Equipo de Seguridad (UPS)
          </h2>
          <p className="text-muted">Complete el formulario para registrar un nuevo equipo de seguridad en el sistema</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/equipos-seguridad")}>
            <FaArrowLeft className="me-2" /> Volver a Equipos de Seguridad
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <div className="d-flex align-items-center">
                <div
                  className="icon-container rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: `rgba(255, 193, 7, 0.1)`,
                    padding: "1rem",
                    width: "50px",
                    height: "50px",
                    boxShadow: `0 0 15px rgba(255, 193, 7, 0.2)`,
                  }}
                >
                  <MdElectricalServices
                    style={{
                      fontSize: "1.5rem",
                      color: "#ffc107",
                      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                    }}
                  />
                </div>
                <h4 className="mb-0">Información del Equipo de Seguridad</h4>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="marca" className="form-label fw-semibold">
                        Marca del equipo de seguridad
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaTrademark className="text-warning" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.marca ? "is-invalid" : ""}`}
                          id="marca"
                          placeholder="Ingrese la marca del equipo de seguridad"
                          value={marca}
                          onChange={(e) => setMarca(e.target.value)}
                        />
                        {formErrors.marca && <div className="invalid-feedback">{formErrors.marca}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="modelo" className="form-label fw-semibold">
                        Modelo del equipo de seguridad
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <BsMusicPlayerFill className="text-warning" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.modelo ? "is-invalid" : ""}`}
                          id="modelo"
                          placeholder="Ingrese el modelo del equipo de seguridad"
                          value={modelo}
                          onChange={(e) => setModelo(e.target.value)}
                        />
                        {formErrors.modelo && <div className="invalid-feedback">{formErrors.modelo}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="capacidad" className="form-label fw-semibold">
                        Capacidad de voltaje
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <MdElectricMeter className="text-warning" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.capacidad ? "is-invalid" : ""}`}
                          id="capacidad"
                          placeholder="Ingrese la capacidad del equipo de seguridad"
                          value={capacidad}
                          onChange={(e) => setCapacidad(e.target.value)}
                        />
                        {formErrors.capacidad && <div className="invalid-feedback">{formErrors.capacidad}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="tipo" className="form-label fw-semibold">
                        Tipo del equipo de seguridad
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <MdElectricalServices className="text-warning" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.tipo ? "is-invalid" : ""}`}
                          id="tipo"
                          placeholder="Ingrese el tipo del equipo de seguridad"
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value)}
                        />
                        {formErrors.tipo && <div className="invalid-feedback">{formErrors.tipo}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info d-flex align-items-center mt-4" role="alert">
                  <FaInfoCircle className="me-2" />
                  <div>
                    <strong>Información:</strong> Todos los campos son obligatorios para el registro del equipo de
                    seguridad.
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button type="button" className="btn btn-outline-danger" onClick={handleCancel}>
                    <FaTimes className="me-2" /> Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </span>
                    ) : (
                      <span>
                        <FaPaperPlane className="me-2" /> Registrar UPS
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn {
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card {
          transition: all 0.3s ease;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        h2.fw-bold {
          position: relative;
          padding-bottom: 10px;
        }
        
        h2.fw-bold:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--bs-primary);
          border-radius: 3px;
        }
        
        .alert {
          border-radius: 10px;
          border-left-width: 4px;
        }
        
        .form-control {
          border-radius: 8px;
          padding: 0.6rem 1rem;
          transition: all 0.2s ease;
        }
        
        .form-control:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
        }
        
        .input-group-text {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        
        .icon-container {
          transition: all 0.3s ease;
        }
        
        .card:hover .icon-container {
          transform: scale(1.1);
        }
        
        .spinner-border {
          animation-duration: 1.5s;
        }
        
        .invalid-feedback {
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}

export default RegistrarEquipoSeg