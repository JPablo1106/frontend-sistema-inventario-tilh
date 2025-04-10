import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { useNavigate } from "react-router-dom"
import api from "../extras/axiosIntance"
import Swal from "sweetalert2"
import '../../styles/RegistrarEquipo.css'

// Íconos
import {
  FaLaptop,
  FaPaperPlane,
  FaTimes,
  FaTrademark,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaClone,
  FaArrowLeft,
  FaInfoCircle,
  FaDesktop,
} from "react-icons/fa"
import { BsPcDisplay } from "react-icons/bs"

const RegistrarEquipo = () => {
  const navigate = useNavigate()
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [tipoEquipo, setTipoEquipo] = useState("")
  const [velocidadProcesador, setVelocidadProcesador] = useState("")
  const [tipoProcesador, setTipoProcesador] = useState("")
  const [memoriaRam, setMemoriaRam] = useState("")
  const [tipoMemoriaRam, setTipoMemoriaRam] = useState("")
  const [marcaDisco, setMarcaDisco] = useState("")
  const [modeloDisco, setModeloDisco] = useState("")
  const [c, setC] = useState("")
  const [d, setD] = useState("")
  const [e, setE] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({
    marca: "",
    modelo: "",
    tipoEquipo: "",
    velocidadProcesador: "",
    tipoProcesador: "",
    memoriaRam: "",
    tipoMemoriaRam: "",
    marcaDisco: "",
    modeloDisco: "",
    c: "",
  })

  const validarFormulario = () => {
    let esValido = true
    const errores = {
      marca: "",
      modelo: "",
      tipoEquipo: "",
      velocidadProcesador: "",
      tipoProcesador: "",
      memoriaRam: "",
      tipoMemoriaRam: "",
      marcaDisco: "",
      modeloDisco: "",
      c: "",
    }

    if (!marca.trim()) {
      errores.marca = "La marca del equipo es requerida"
      esValido = false
    }

    if (!modelo.trim()) {
      errores.modelo = "El modelo del equipo es requerido"
      esValido = false
    }

    if (!tipoEquipo) {
      errores.tipoEquipo = "El tipo de equipo es requerido"
      esValido = false
    }

    if (!velocidadProcesador.trim()) {
      errores.velocidadProcesador = "La velocidad del procesador es requerida"
      esValido = false
    }

    if (!tipoProcesador.trim()) {
      errores.tipoProcesador = "El tipo de procesador es requerido"
      esValido = false
    }

    if (!memoriaRam) {
      errores.memoriaRam = "La capacidad de memoria RAM es requerida"
      esValido = false
    }

    if (!tipoMemoriaRam) {
      errores.tipoMemoriaRam = "El tipo de memoria RAM es requerido"
      esValido = false
    }

    if (!marcaDisco.trim()) {
      errores.marcaDisco = "La marca del disco es requerida"
      esValido = false
    }

    if (!modeloDisco.trim()) {
      errores.modeloDisco = "El modelo del disco es requerido"
      esValido = false
    }

    if (!c.trim()) {
      errores.c = "La partición C es requerida"
      esValido = false
    }

    setFormErrors(errores)
    return esValido
  }

  const handleSubmit = async (a) => {
    a.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setIsLoading(true)

    try {
      Swal.fire({
        title: "Registrando equipo",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const token = localStorage.getItem("jwt")
      const equipoResponse = await api.post(
        "equipos/RegistrarEquipo",
        {
          marca,
          modelo,
          tipoEquipo,
          velocidadProcesador,
          tipoProcesador,
          memoriaRam,
          tipoMemoriaRam,
          marcaDisco,
          modeloDisco,
          c: Number.parseInt(c, 10) || 0,
          d: Number.parseInt(d, 10) || 0,
          e: Number.parseInt(e, 10) || 0,
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Respuesta de la API Equipos", equipoResponse.data)

      //Limpiamos los campos del formulario
      setMarca("")
      setModelo("")
      setTipoEquipo("")
      setVelocidadProcesador("")
      setTipoProcesador("")
      setMemoriaRam("")
      setTipoMemoriaRam("")
      setMarcaDisco("")
      setModeloDisco("")
      setC("")
      setD("")
      setE("")

      Swal.fire({
        icon: "success",
        title: "¡Equipo registrado!",
        text: "El equipo ha sido registrado exitosamente en el sistema.",
        showConfirmButton: true,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          navigate("/equipos")
        }
      })
    } catch (error) {
      console.error("Error al enviar los datos: ", error.message)
      Swal.fire({
        icon: "error",
        title: "Error al registrar equipo",
        text: "No se pudo registrar el equipo. Por favor, intenta de nuevo.",
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
        navigate("/equipos")
      }
    })
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-primary">
            <FaDesktop className="me-2" />
            Registro de Equipo
          </h2>
          <p className="text-muted">Complete el formulario para registrar un nuevo equipo en el sistema</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/equipos")}>
            <FaArrowLeft className="me-2" /> Volver a Equipos
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <div className="d-flex align-items-center">
                <div
                  className="icon-container rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: `rgba(73, 80, 87, 0.1)`,
                    padding: "1rem",
                    width: "50px",
                    height: "50px",
                    boxShadow: `0 0 15px rgba(73, 80, 87, 0.2)`,
                  }}
                >
                  <BsPcDisplay
                    style={{
                      fontSize: "1.5rem",
                      color: "#495057",
                      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                    }}
                  />
                </div>
                <h4 className="mb-0">Información del Equipo</h4>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Sección: Información General */}
                <div className="section-title mb-3">
                  <h5 className="text-secondary">Información General</h5>
                  <hr className="mt-0" />
                </div>

                {/* Fila 1 */}
                <div className="row mb-4">
                  {/* Marca */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="marca" className="form-label fw-semibold">
                        Marca del equipo
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaTrademark className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.marca ? "is-invalid" : ""}`}
                          id="marca"
                          placeholder="Ingrese la marca del equipo"
                          value={marca}
                          onChange={(a) => setMarca(a.target.value)}
                        />
                        {formErrors.marca && <div className="invalid-feedback">{formErrors.marca}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Modelo */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="modelo" className="form-label fw-semibold">
                        Modelo del equipo
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaLaptop className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.modelo ? "is-invalid" : ""}`}
                          id="modelo"
                          placeholder="Ingrese el modelo del equipo"
                          value={modelo}
                          onChange={(a) => setModelo(a.target.value)}
                        />
                        {formErrors.modelo && <div className="invalid-feedback">{formErrors.modelo}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Tipo de equipo */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="tipoEquipo" className="form-label fw-semibold">
                        Tipo de equipo
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <BsPcDisplay className="text-secondary" />
                        </span>
                        <select
                          className={`form-select ${formErrors.tipoEquipo ? "is-invalid" : ""}`}
                          id="tipoEquipo"
                          value={tipoEquipo}
                          onChange={(a) => setTipoEquipo(a.target.value)}
                        >
                          <option value="">Seleccione...</option>
                          <option value="Escritorio">Escritorio</option>
                          <option value="Laptop">Laptop</option>
                        </select>
                        {formErrors.tipoEquipo && <div className="invalid-feedback">{formErrors.tipoEquipo}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Procesador */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-secondary">Información del Procesador</h5>
                  <hr className="mt-0" />
                </div>

                {/* Fila 2 */}
                <div className="row mb-4">
                  {/* Tipo de procesador */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="tipoProcesador" className="form-label fw-semibold">
                        Tipo del procesador
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaMicrochip className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.tipoProcesador ? "is-invalid" : ""}`}
                          id="tipoProcesador"
                          placeholder="Ingrese el tipo de procesador"
                          value={tipoProcesador}
                          onChange={(a) => setTipoProcesador(a.target.value)}
                        />
                        {formErrors.tipoProcesador && (
                          <div className="invalid-feedback">{formErrors.tipoProcesador}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Velocidad del procesador */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="velocidadProcesador" className="form-label fw-semibold">
                        Velocidad del procesador
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaMicrochip className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.velocidadProcesador ? "is-invalid" : ""}`}
                          id="velocidadProcesador"
                          placeholder="Ingrese la velocidad del procesador"
                          value={velocidadProcesador}
                          onChange={(a) => setVelocidadProcesador(a.target.value)}
                        />
                        {formErrors.velocidadProcesador && (
                          <div className="invalid-feedback">{formErrors.velocidadProcesador}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Memoria */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-secondary">Memoria RAM</h5>
                  <hr className="mt-0" />
                </div>

                {/* Fila 3 (RAM) */}
                <div className="row mb-4">
                  {/* Capacidad de RAM */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="memoriaRam" className="form-label fw-semibold">
                        Capacidad de memoria RAM
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaMemory className="text-secondary" />
                        </span>
                        <select
                          className={`form-select ${formErrors.memoriaRam ? "is-invalid" : ""}`}
                          id="memoriaRam"
                          value={memoriaRam}
                          onChange={(a) => setMemoriaRam(a.target.value)}
                        >
                          <option value="">Seleccione...</option>
                          <option value="4 GB">4 GB</option>
                          <option value="8 GB">8 GB</option>
                          <option value="16 GB">16 GB</option>
                          <option value="32 GB">32 GB</option>
                        </select>
                        {formErrors.memoriaRam && <div className="invalid-feedback">{formErrors.memoriaRam}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Tipo de RAM */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="tipoMemoriaRam" className="form-label fw-semibold">
                        Tipo de memoria RAM
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaMemory className="text-secondary" />
                        </span>
                        <select
                          className={`form-select ${formErrors.tipoMemoriaRam ? "is-invalid" : ""}`}
                          id="tipoMemoriaRam"
                          value={tipoMemoriaRam}
                          onChange={(a) => setTipoMemoriaRam(a.target.value)}
                        >
                          <option value="">Seleccione...</option>
                          <option value="DDR-4">DDR-4</option>
                          <option value="DDR-5">DDR-5</option>
                        </select>
                        {formErrors.tipoMemoriaRam && (
                          <div className="invalid-feedback">{formErrors.tipoMemoriaRam}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Disco Duro */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-secondary">Disco Duro</h5>
                  <hr className="mt-0" />
                </div>

                {/* Fila 4 (Disco) */}
                <div className="row mb-4">
                  {/* Marca del disco */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="marcaDisco" className="form-label fw-semibold">
                        Marca del disco
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaHdd className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.marcaDisco ? "is-invalid" : ""}`}
                          id="marcaDisco"
                          placeholder="Ingrese la marca del disco"
                          value={marcaDisco}
                          onChange={(a) => setMarcaDisco(a.target.value)}
                        />
                        {formErrors.marcaDisco && <div className="invalid-feedback">{formErrors.marcaDisco}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Modelo del disco */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="modeloDisco" className="form-label fw-semibold">
                        Modelo del disco
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaHdd className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${formErrors.modeloDisco ? "is-invalid" : ""}`}
                          id="modeloDisco"
                          placeholder="Ingrese el modelo del disco"
                          value={modeloDisco}
                          onChange={(a) => setModeloDisco(a.target.value)}
                        />
                        {formErrors.modeloDisco && <div className="invalid-feedback">{formErrors.modeloDisco}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Particiones */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-secondary">Particiones</h5>
                  <hr className="mt-0" />
                </div>

                {/* Fila 5 (particiones) */}
                <div className="row mb-4">
                  {/* Partición C */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="c" className="form-label fw-semibold">
                        Partición C (GB)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaClone className="text-secondary" />
                        </span>
                        <input
                          type="number"
                          className={`form-control ${formErrors.c ? "is-invalid" : ""}`}
                          id="c"
                          placeholder="Ingrese la capacidad en GB"
                          value={c}
                          onChange={(a) => setC(a.target.value)}
                        />
                        {formErrors.c && <div className="invalid-feedback">{formErrors.c}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Partición D */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="d" className="form-label fw-semibold">
                        Partición D (GB)
                        <span className="text-muted ms-1">(Opcional)</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaClone className="text-secondary" />
                        </span>
                        <input
                          type="number"
                          className="form-control"
                          id="d"
                          placeholder="Ingrese la capacidad en GB"
                          value={d}
                          onChange={(a) => setD(a.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Partición E */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="e" className="form-label fw-semibold">
                        Partición E (GB)
                        <span className="text-muted ms-1">(Opcional)</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaClone className="text-secondary" />
                        </span>
                        <input
                          type="number"
                          className="form-control"
                          id="e"
                          placeholder="Ingrese la capacidad en GB"
                          value={e}
                          onChange={(a) => setE(a.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info d-flex align-items-center mt-4" role="alert">
                  <FaInfoCircle className="me-2" />
                  <div>
                    <strong>Información:</strong> Los campos marcados son obligatorios para el registro del equipo.
                  </div>
                </div>

                {/* Botones de acción */}
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
                        <FaPaperPlane className="me-2" /> Registrar Equipo
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
                
                .form-control, .form-select {
                    border-radius: 8px;
                    padding: 0.6rem 1rem;
                    transition: all 0.2s ease;
                }
                
                .form-control:focus, .form-select:focus {
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
                
                .section-title h5 {
                    font-weight: 600;
                }
                
                .section-title hr {
                    opacity: 0.2;
                    margin-bottom: 1rem;
                }
            `}</style>
    </div>
  )
}

export default RegistrarEquipo

