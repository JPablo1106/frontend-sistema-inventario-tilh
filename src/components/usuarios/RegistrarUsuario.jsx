"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import {
  FaUser,
  FaPaperPlane,
  FaTimes,
  FaBuilding,
  FaUserTie,
  FaArrowLeft,
  FaInfoCircle,
  FaUsers,
} from "react-icons/fa"
import { FaBuildingUser } from "react-icons/fa6"
import "bootstrap/dist/css/bootstrap.min.css"
import '../../styles/RegistrarUsuario.css'

const RegistrarUsuario = () => {
  const navigate = useNavigate()
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [area, setArea] = useState("")
  const [departamento, setDepartamento] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({
    nombreUsuario: "",
    area: "",
    departamento: "",
  })

  const validateForm = () => {
    let isValid = true
    const errors = {
      nombreUsuario: "",
      area: "",
      departamento: "",
    }

    if (!nombreUsuario.trim()) {
      errors.nombreUsuario = "El nombre del usuario es requerido"
      isValid = false
    }

    if (!area.trim()) {
      errors.area = "El área es requerida"
      isValid = false
    }

    if (!departamento.trim()) {
      errors.departamento = "El departamento es requerido"
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
        title: "Registrando usuario",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const token = localStorage.getItem("jwt")
      const usuarioResponse = await axios.post(
        "https://backendsistemainventario.onrender.com/api/usuarios/RegistrarUsuario",
        {
          NombreUsuario: nombreUsuario,
          Area: area,
          Departamento: departamento,
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Respuesta de la API de Usuarios:", usuarioResponse.data)

      // Limpiar los campos del formulario
      setNombreUsuario("")
      setArea("")
      setDepartamento("")

      Swal.fire({
        icon: "success",
        title: "¡Usuario registrado!",
        text: "El usuario ha sido registrado exitosamente en el sistema.",
        showConfirmButton: true,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          navigate("/usuarios")
        }
      })
    } catch (error) {
      console.error("Error al enviar los datos:", error.message)
      Swal.fire({
        icon: "error",
        title: "Error al registrar usuario",
        text: "No se pudo registrar el usuario. Por favor, intenta de nuevo.",
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
        navigate("/usuarios")
      }
    })
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-primary">
            <FaUsers className="me-2" />
            Registro de Usuario
          </h2>
          <p className="text-muted">Complete el formulario para registrar un nuevo usuario en el sistema</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/usuarios")}>
            <FaArrowLeft className="me-2" /> Volver a Usuarios
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
                    backgroundColor: `rgba(13, 110, 253, 0.1)`,
                    padding: "1rem",
                    width: "50px",
                    height: "50px",
                    boxShadow: `0 0 15px rgba(13, 110, 253, 0.2)`,
                  }}
                >
                  <FaUserTie
                    style={{
                      fontSize: "1.5rem",
                      color: "#0d6efd",
                      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                    }}
                  />
                </div>
                <h4 className="mb-0">Información del Usuario</h4>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="nombre" className="form-label fw-semibold">
                        Nombre del Usuario
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaUser className="text-primary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.nombreUsuario ? "is-invalid" : ""}`}
                          id="nombre"
                          placeholder="Ingrese el nombre completo"
                          value={nombreUsuario}
                          onChange={(e) => setNombreUsuario(e.target.value)}
                        />
                        {formErrors.nombreUsuario && <div className="invalid-feedback">{formErrors.nombreUsuario}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="area" className="form-label fw-semibold">
                        Área
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaBuilding className="text-primary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.area ? "is-invalid" : ""}`}
                          id="area"
                          placeholder="Ingrese el área"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                        {formErrors.area && <div className="invalid-feedback">{formErrors.area}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="departamento" className="form-label fw-semibold">
                        Departamento
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaBuildingUser className="text-primary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.departamento ? "is-invalid" : ""}`}
                          id="departamento"
                          placeholder="Ingrese el departamento"
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                        />
                        {formErrors.departamento && <div className="invalid-feedback">{formErrors.departamento}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <FaInfoCircle className="me-2" />
                  <div>
                    <strong>Información:</strong> Todos los campos son obligatorios para el registro del usuario.
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
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
                        <FaPaperPlane className="me-2" /> Registrar Usuario
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
      `}</style>
    </div>
  )
}

export default RegistrarUsuario

