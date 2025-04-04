import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import Select from "react-select"
import {
  FaUserTie,
  FaLaptop,
  FaNetworkWired,
  FaCalendarAlt,
  FaPlusCircle,
  FaTrashAlt,
  FaPaperPlane,
  FaTimes,
  FaInfoCircle,
  FaArrowLeft,
  FaClipboardList,
} from "react-icons/fa"
import { BsPcDisplay } from "react-icons/bs"
import "bootstrap/dist/css/bootstrap.min.css"
import '../../styles/Formulario.css';

const RegistrarAsignacion = () => {
  const navigate = useNavigate()

  // Estados para dropdowns
  const [usuarios, setUsuarios] = useState([])
  const [equipos, setEquipos] = useState([])
  const [componentes, setComponentes] = useState([])
  const [equiposSeguridad, setEquiposSeguridad] = useState([])

  // Estado del formulario
  const [formData, setFormData] = useState({
    idUsuario: null,
    idEquipo: null,
    numSerieEquipo: "",
    ipAddress: "",
    ipCpuRed: "",
    fechaAsignacion: new Date().toISOString().slice(0, 10),
    componentes: [{ tempId: Date.now(), idComponente: "", numSerieComponente: "" }],
    dispositivosExt: [{ tempId: Date.now() + 1, marca: "", descripcion: "", numSerieDispExt: "" }],
    idEquipoSeguridad: "",
    numSerieEquipoSeg: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(false)

  // Configuración de headers con token
  const getAuthConfig = () => {
    const token = localStorage.getItem("jwt")
    return { headers: { Accept: "*/*", "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
  }

  // Cargar datos en dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true)
      setError(false)

      try {
        const [usuariosRes, equiposRes, componentesRes, equiposSeguridadRes] = await Promise.all([
          axios.get("https://backendsistemainventario.onrender.com/api/usuarios/ConsultarUsuarios", getAuthConfig()),
          axios.get("https://backendsistemainventario.onrender.com/api/equipos/ConsultarEquipos", getAuthConfig()),
          axios.get("https://backendsistemainventario.onrender.com/api/Componentes/ConsultarComponentes", getAuthConfig()),
          axios.get("https://backendsistemainventario.onrender.com/api/equiposSeguridad/ConsultarEquiposSeguridad", getAuthConfig()),
        ])

        setUsuarios(usuariosRes.data)
        setEquipos(equiposRes.data)
        setComponentes(componentesRes.data)
        setEquiposSeguridad(equiposSeguridadRes.data)
      } catch (error) {
        console.error("Error cargando datos:", error)
        setError(true)
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudieron cargar los datos necesarios. Por favor, intente nuevamente.",
          confirmButtonColor: "#3085d6",
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  // Opciones para react-select
  const usuariosOptions = usuarios
    .filter((usuario) => usuario.idUsuario != null)
    .map((usuario) => ({
      value: usuario.idUsuario,
      label: `${usuario.nombreUsuario} - ${usuario.area} - ${usuario.departamento}`,
    }))

  const equiposOptions = equipos
    .filter((equipo) => equipo.idEquipo != null)
    .map((equipo) => ({
      value: equipo.idEquipo,
      label: `${equipo.tipoEquipo} - ${equipo.marca} - ${equipo.modelo} - ${equipo.tipoProcesador}`,
    }))

  // Manejar el cambio en react-select para Usuarios
  const handleUsuarioChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, idUsuario: selectedOption ? selectedOption.value : null }))
  }

  // Manejar el cambio en react-select para Equipos
  const handleEquipoChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, idEquipo: selectedOption ? selectedOption.value : null }))
  }

  // Actualiza campos del formulario para inputs normales
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleComponentChange = (index, e) => {
    const { name, value } = e.target
    const newComponents = [...formData.componentes]
    newComponents[index][name] = value
    setFormData((prev) => ({ ...prev, componentes: newComponents }))
  }

  const handleDeviceChange = (index, e) => {
    const { name, value } = e.target
    const newDevices = [...formData.dispositivosExt]
    newDevices[index][name] = value
    setFormData((prev) => ({ ...prev, dispositivosExt: newDevices }))
  }

  // Genera un id único para componentes y dispositivos
  const generateUniqueId = () => Date.now() + Math.random()

  // Agrega fila de componente
  const addComponentRow = () => {
    const newRow = { tempId: generateUniqueId(), idComponente: "", numSerieComponente: "" }
    setFormData((prev) => ({ ...prev, componentes: [...prev.componentes, newRow] }))
  }

  // Agrega fila de dispositivo externo
  const addDeviceRow = () => {
    const newRow = { tempId: generateUniqueId(), marca: "", descripcion: "", numSerieDispExt: "" }
    setFormData((prev) => ({ ...prev, dispositivosExt: [...prev.dispositivosExt, newRow] }))
  }

  // Elimina fila de componente
  const removeComponentRow = (tempId) => {
    if (formData.componentes.length > 1) {
      setFormData((prev) => ({ ...prev, componentes: prev.componentes.filter((comp) => comp.tempId !== tempId) }))
    } else {
      Swal.fire({
        icon: "info",
        title: "Información",
        text: "Debe mantener al menos un componente en la lista.",
        confirmButtonColor: "#3085d6",
      })
    }
  }

  // Elimina fila de dispositivo
  const removeDeviceRow = (tempId) => {
    if (formData.dispositivosExt.length > 1) {
      setFormData((prev) => ({ ...prev, dispositivosExt: prev.dispositivosExt.filter((dev) => dev.tempId !== tempId) }))
    } else {
      Swal.fire({
        icon: "info",
        title: "Información",
        text: "Debe mantener al menos un dispositivo externo en la lista.",
        confirmButtonColor: "#3085d6",
      })
    }
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación básica
    if (!formData.idUsuario) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "Debe seleccionar un usuario para la asignación.",
        confirmButtonColor: "#3085d6",
      })
      return
    }

    setIsLoading(true)

    const componentesFiltrados = formData.componentes.filter(
      (comp) => comp.idComponente !== "" && comp.numSerieComponente.trim() !== "",
    )
    const dispositivosFiltrados = formData.dispositivosExt.filter(
      (dev) => dev.marca.trim() !== "" && dev.descripcion.trim() !== "" && dev.numSerieDispExt.trim() !== "",
    )

    const payload = {
      idUsuario: Number(formData.idUsuario),
      idEquipo: formData.idEquipo ? Number(formData.idEquipo) : null,
      numSerieEquipo: formData.numSerieEquipo,
      fechaAsignacion: new Date(formData.fechaAsignacion).toISOString(),
      ipAddress: formData.ipAddress,
      ipCpuRed: formData.ipCpuRed,
      componentes: componentesFiltrados.map((comp) => ({
        ...comp,
        idComponente: comp.idComponente ? Number(comp.idComponente) : null,
      })),
      dispositivosExt: dispositivosFiltrados,
      idEquipoSeguridad: formData.idEquipoSeguridad ? Number(formData.idEquipoSeguridad) : null,
      numSerieEquipoSeg: formData.numSerieEquipoSeg,
    }

    try {
      const response = await axios.post(
        "https://backendsistemainventario.onrender.com/api/Asignaciones/RegistrarAsignacion",
        payload,
        getAuthConfig(),
      )
      console.log("Asignación registrada", response.data)

      Swal.fire({
        icon: "success",
        title: "¡Asignación registrada!",
        text: "La asignación ha sido registrada exitosamente en el sistema.",
        showConfirmButton: true,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          navigate("/asignaciones")
        }
      })
    } catch (error) {
      console.error("Error al registrar la asignación", error)
      Swal.fire({
        icon: "error",
        title: "Error al registrar asignación",
        text: "No se pudo registrar la asignación. Por favor, intente nuevamente.",
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
        navigate("/asignaciones")
      }
    })
  }

  if (loadingData) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <h4 className="mb-3">Cargando datos</h4>
                <p className="text-muted">Por favor espere mientras obtenemos la información necesaria...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card shadow-lg border-0 bg-light">
              <div className="card-body p-5">
                <FaInfoCircle className="text-danger mb-3" style={{ fontSize: "3rem" }} />
                <h4 className="mb-3 text-danger">Error de conexión</h4>
                <p className="text-muted mb-4">No se pudieron cargar los datos necesarios para el formulario.</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  <FaArrowLeft className="me-2" /> Volver a intentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-primary">
            <FaClipboardList className="me-2" />
            Registro de Asignación
          </h2>
          <p className="text-muted">Complete el formulario para registrar una nueva asignación en el sistema</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/asignaciones")}>
            <FaArrowLeft className="me-2" /> Volver a Asignaciones
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <div className="d-flex align-items-center">
                <div className="icon-container rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: `rgba(40, 167, 69, 0.1)`,
                    padding: "1rem",
                    width: "50px",
                    height: "50px",
                    boxShadow: `0 0 15px rgba(40, 167, 69, 0.2)`,
                  }}>
                  <BsPcDisplay style={{
                    fontSize: "1.5rem",
                    color: "#28a745",
                    filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                  }} />
                </div>
                <h4 className="mb-0">Información de la Asignación</h4>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Datos Generales */}
                <div className="section-title mb-3">
                  <h5 className="text-success">
                    <FaUserTie className="me-2" />
                    Datos Generales
                  </h5>
                  <hr className="mt-0" />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="idUsuario" className="form-label fw-semibold">Usuario</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaUserTie /></span>
                        <Select
                          id="idUsuario"
                          name="idUsuario"
                          options={usuariosOptions}
                          onChange={handleUsuarioChange}
                          placeholder="Seleccione un usuario"
                          value={usuariosOptions.find((option) => option.value === formData.idUsuario) || null}
                          isClearable
                          className="react-select-container flex-grow-1"
                          classNamePrefix="react-select"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="fechaAsignacion" className="form-label fw-semibold">Fecha de Asignación</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaCalendarAlt /></span>
                        <input
                          type="date"
                          id="fechaAsignacion"
                          name="fechaAsignacion"
                          className="form-control"
                          value={formData.fechaAsignacion}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Equipo */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-success">
                    <FaLaptop className="me-2" />
                    Equipo
                  </h5>
                  <hr className="mt-0" />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="idEquipo" className="form-label fw-semibold">Equipo</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaLaptop /></span>
                        <Select
                          id="idEquipo"
                          name="idEquipo"
                          options={equiposOptions}
                          onChange={handleEquipoChange}
                          placeholder="Seleccione un equipo"
                          value={equiposOptions.find((option) => option.value === formData.idEquipo) || null}
                          isClearable
                          className="react-select-container flex-grow-1"
                          classNamePrefix="react-select"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="numSerieEquipo" className="form-label fw-semibold">Número de Serie del Equipo</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaClipboardList /></span>
                        <input
                          type="text"
                          id="numSerieEquipo"
                          name="numSerieEquipo"
                          className="form-control"
                          placeholder="Ingrese el número de serie"
                          value={formData.numSerieEquipo}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="ipAddress" className="form-label fw-semibold">IP Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaNetworkWired /></span>
                        <input
                          type="text"
                          id="ipAddress"
                          name="ipAddress"
                          className="form-control"
                          placeholder="Ingrese la IP"
                          value={formData.ipAddress}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="ipCpuRed" className="form-label fw-semibold">IP CPU Red</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaNetworkWired /></span>
                        <input
                          type="text"
                          id="ipCpuRed"
                          name="ipCpuRed"
                          className="form-control"
                          placeholder="Ingrese la IP CPU Red"
                          value={formData.ipCpuRed}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Componentes */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-success">
                    <FaPlusCircle className="me-2" />
                    Componentes
                  </h5>
                  <hr className="mt-0" />
                </div>

                {formData.componentes.map((comp, index) => (
                  <div className="row mb-3 align-items-center" key={comp.tempId}>
                    <div className="col-md-5">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-text bg-light"><FaPlusCircle /></span>
                          <select
                            name="idComponente"
                            className="form-select"
                            value={comp.idComponente}
                            onChange={(e) => handleComponentChange(index, e)}
                            required
                          >
                            <option value="">Seleccione un componente</option>
                            {componentes.length === 0 && <option>Sin componentes disponibles</option>}
                            {componentes
                              .filter((compItem) => compItem.idComponente != null)
                              .map((compItem) => (
                                <option key={compItem.idComponente} value={compItem.idComponente.toString()}>
                                  {compItem.tipoComponente} - {compItem.marcaComponente}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-text bg-light"><FaClipboardList /></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ingrese el número de serie"
                            name="numSerieComponente"
                            value={comp.numSerieComponente}
                            onChange={(e) => handleComponentChange(index, e)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 text-center">
                      <button type="button" className="btn btn-outline-danger" onClick={() => removeComponentRow(comp.tempId)}>
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mb-4">
                  <button type="button" className="btn btn-outline-success" onClick={addComponentRow}>
                    <FaPlusCircle className="me-2" /> Agregar Componente
                  </button>
                </div>

                {/* Dispositivos Externos */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-success">
                    <FaPlusCircle className="me-2" />
                    Dispositivos Externos
                  </h5>
                  <hr className="mt-0" />
                </div>

                {formData.dispositivosExt.map((dev, index) => (
                  <div className="row mb-3 align-items-center" key={dev.tempId}>
                    <div className="col-md-3">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-text bg-light"><FaInfoCircle /></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Marca"
                            name="marca"
                            value={dev.marca}
                            onChange={(e) => handleDeviceChange(index, e)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-text bg-light"><FaInfoCircle /></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Descripción"
                            name="descripcion"
                            value={dev.descripcion}
                            onChange={(e) => handleDeviceChange(index, e)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-text bg-light"><FaClipboardList /></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Número de serie"
                            name="numSerieDispExt"
                            value={dev.numSerieDispExt}
                            onChange={(e) => handleDeviceChange(index, e)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 text-center">
                      <button type="button" className="btn btn-outline-danger" onClick={() => removeDeviceRow(dev.tempId)}>
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mb-4">
                  <button type="button" className="btn btn-outline-success" onClick={addDeviceRow}>
                    <FaPlusCircle className="me-2" /> Agregar Dispositivo Externo
                  </button>
                </div>

                {/* Equipo de Seguridad */}
                <div className="section-title mb-3 mt-4">
                  <h5 className="text-success">
                    <FaLaptop className="me-2" />
                    Equipo de Seguridad
                  </h5>
                  <hr className="mt-0" />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="idEquipoSeguridad" className="form-label fw-semibold">Equipo de Seguridad</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaLaptop /></span>
                        <select
                          id="idEquipoSeguridad"
                          name="idEquipoSeguridad"
                          className="form-select"
                          value={formData.idEquipoSeguridad}
                          onChange={handleChange}
                        >
                          <option value="">Seleccione un equipo de seguridad</option>
                          {equiposSeguridad.length === 0 && <option>Sin equipos de seguridad</option>}
                          {equiposSeguridad
                            .filter((equipoSeg) => equipoSeg.idEquipoSeguridad != null)
                            .map((equipoSeg) => (
                              <option key={equipoSeg.idEquipoSeguridad} value={equipoSeg.idEquipoSeguridad.toString()}>
                                {equipoSeg.tipo} - {equipoSeg.marca} - {equipoSeg.modelo}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="numSerieEquipoSeg" className="form-label fw-semibold">Número de Serie del Equipo de Seguridad</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaClipboardList /></span>
                        <input
                          type="text"
                          id="numSerieEquipoSeg"
                          name="numSerieEquipoSeg"
                          className="form-control"
                          placeholder="Ingrese el número de serie"
                          value={formData.numSerieEquipoSeg}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info d-flex align-items-center mt-4" role="alert">
                  <FaInfoCircle className="me-2" />
                  <div>
                    <strong>Información:</strong> Complete todos los campos obligatorios para registrar la asignación.
                    Asegúrese de seleccionar al menos un usuario y completar los detalles de los componentes y dispositivos.
                  </div>
                </div>

                {/* Botones de acción */}
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
                        <FaPaperPlane className="me-2" /> Registrar Asignación
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
        
        /* Estilos para react-select */
        .react-select-container .react-select__control {
          border-radius: 8px;
          border-color: #ced4da;
          box-shadow: none;
          transition: all 0.2s ease;
        }
        
        .react-select-container .react-select__control:hover {
          border-color: #adb5bd;
        }
        
        .react-select-container .react-select__control--is-focused {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
        }
        
        .react-select-container .react-select__menu {
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .react-select-container .react-select__option--is-selected {
          background-color: #0d6efd;
        }
        
        .react-select-container .react-select__option:hover {
          background-color: rgba(13, 110, 253, 0.1);
        }
      `}</style>
    </div>
  )
}

export default RegistrarAsignacion
