import { useState, useEffect, useRef } from "react"
import api from "./extras/axiosIntance"
import Swal from "sweetalert2"
import {
  FaDesktop,
  FaTv,
  FaKeyboard,
  FaMouse,
  FaShieldAlt,
  FaPhone,
  FaSync,
  FaChartBar,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa"
import "bootstrap/dist/css/bootstrap.min.css"

export default function Dashboard() {
  const [counts, setCounts] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState("")
  // Ref para evitar la doble ejecución de la alerta
  const alertaMostrada = useRef(false)

  const colorMap = {
    secondary: "#495057",
    success: "#198754",
    dark: "#212529",
    danger: "#dc3545",
    info: "#0dcaf0",
    warning: "#ffc107",
  }

  const getAuthConfig = () => {
    const token = localStorage.getItem("jwt")
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const cargarDatos = async () => {
    setCargando(true)
    setError(false)

    try {
      const response = await api.get(
        "Asignaciones/ConteoAsignaciones",
        getAuthConfig(),
      )

      setCounts(response.data)
      const ahora = new Date()
      setUltimaActualizacion(`${ahora.toLocaleDateString("es-ES")} ${ahora.toLocaleTimeString("es-ES")}`)

      // Mostrar alerta solo si aún no se ha mostrado
      if (!alertaMostrada.current) {
        Swal.fire({
          title: "¡Datos actualizados!",
          text: "La información del inventario ha sido cargada correctamente.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        })
        alertaMostrada.current = true
      }
    } catch (error) {
      console.error("Error al obtener los conteos:", error)
      setError(true)
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudieron cargar los datos del inventario. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          cargarDatos()
        }
      })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const mostrarDetalles = (titulo, valor, color) => {
    Swal.fire({
      title: `Información de ${titulo}`,
      html: `
        <div class="text-center">
          <h4 class="mb-3" style="color: ${colorMap[color]};">Total: ${valor}</h4>
          <p>Este módulo muestra el total de ${titulo.toLowerCase()} registrados en el sistema de inventario.</p>
          <p>Para ver más detalles, visite la sección de ${titulo.toLowerCase()} en el menú principal.</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#3085d6",
    })
  }

  const calcularTotalEquipos = () => {
    if (!counts) return 0
    return (
      counts.equipos + counts.monitores + counts.teclados + counts.mouse + counts.equiposSeguridad + counts.telefonos
    )
  }

  if (cargando) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <h4 className="mb-3">Cargando datos del inventario</h4>
                <p className="text-muted">Por favor espere mientras obtenemos la información actualizada...</p>
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
                <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: "3rem" }} />
                <h4 className="mb-3 text-danger">Error de conexión</h4>
                <p className="text-muted mb-4">No se pudieron cargar los datos del inventario.</p>
                <button className="btn btn-primary" onClick={cargarDatos}>
                  <FaSync className="me-2" /> Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const iconComponents = {
    equipos: FaDesktop,
    monitores: FaTv,
    teclados: FaKeyboard,
    mouses: FaMouse,
    seguridad: FaShieldAlt,
    telefonos: FaPhone,
  }

  const data = [
    { title: "Equipos", value: counts.equipos, iconKey: "equipos", color: "secondary" },
    { title: "Monitores", value: counts.monitores, iconKey: "monitores", color: "success" },
    { title: "Teclados", value: counts.teclados, iconKey: "teclados", color: "dark" },
    { title: "Mouses", value: counts.mouse, iconKey: "mouses", color: "danger" },
    { title: "Equipos de Seguridad", value: counts.equiposSeguridad, iconKey: "seguridad", color: "info" },
    { title: "Teléfonos", value: counts.telefonos, iconKey: "telefonos", color: "warning" },
  ]

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-primary">
            <FaChartBar className="me-2" />
             Panel de Control de Inventario
          </h2>
          <p className="text-muted">Visualización general del estado actual del inventario empresarial</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-primary me-2" onClick={cargarDatos}>
            <FaSync className="me-2" /> Actualizar datos
          </button>
          <small className="text-muted d-block mt-2">Última actualización: {ultimaActualizacion}</small>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-3 text-center text-md-start">
                  <h5 className="text-primary mb-0">Resumen General</h5>
                  <p className="text-muted small mb-0">Inventario completo</p>
                </div>
                <div className="col-md-7">
                  <div className="progress" style={{ height: "25px" }}>
                    <div
                      className="progress-bar bg-secondary"
                      style={{ width: `${(counts.equipos / calcularTotalEquipos()) * 100}%` }}
                      title="Equipos"
                    ></div>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${(counts.monitores / calcularTotalEquipos()) * 100}%` }}
                      title="Monitores"
                    ></div>
                    <div
                      className="progress-bar bg-dark"
                      style={{ width: `${(counts.teclados / calcularTotalEquipos()) * 100}%` }}
                      title="Teclados"
                    ></div>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${(counts.mouse / calcularTotalEquipos()) * 100}%` }}
                      title="Mouses"
                    ></div>
                    <div
                      className="progress-bar bg-info"
                      style={{ width: `${(counts.equiposSeguridad / calcularTotalEquipos()) * 100}%` }}
                      title="Seguridad"
                    ></div>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${(counts.telefonos / calcularTotalEquipos()) * 100}%` }}
                      title="Teléfonos"
                    ></div>
                  </div>
                </div>
                <div className="col-md-2 text-center text-md-end mt-3 mt-md-0">
                  <h4 className="mb-0">{calcularTotalEquipos()}</h4>
                  <small className="text-muted">Total de equipos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {data.map((item, index) => {
          const IconComponent = iconComponents[item.iconKey]
          return (
            <div key={index} className="col-sm-6 col-md-4 col-lg-4 col-xl-2 mb-4">
              <div
                className="card shadow-sm border-0 h-100"
                style={{
                  transition: "all 0.3s ease",
                  borderLeft: `4px solid ${colorMap[item.color]}`,
                  backgroundColor: `rgba(${
                    item.color === "secondary"
                      ? "73, 80, 87"
                      : item.color === "success"
                        ? "25, 135, 84"
                        : item.color === "dark"
                          ? "33, 37, 41"
                          : item.color === "danger"
                            ? "220, 53, 69"
                            : item.color === "info"
                              ? "13, 202, 240"
                              : "255, 193, 7"
                  }, 0.1)`,
                }}
                onClick={() => mostrarDetalles(item.title, item.value, item.color)}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center p-4">
                  <div
                    className="icon-container rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{
                      backgroundColor: `${colorMap[item.color]}20`,
                      padding: "1rem",
                      width: "80px",
                      height: "80px",
                      boxShadow: `0 0 15px ${colorMap[item.color]}40`,
                    }}
                  >
                    {IconComponent && (
                      <IconComponent
                        style={{
                          fontSize: "2.5rem",
                          color: colorMap[item.color],
                          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                        }}
                      />
                    )}
                  </div>
                  <h5 style={{ color: colorMap[item.color], fontWeight: "600" }} className="mb-1">
                    {item.title}
                  </h5>
                  <h3 style={{ color: colorMap[item.color], fontWeight: "700" }} className="mb-0">
                    {item.value}
                  </h3>
                  <div className="mt-3 text-center">
                    <small
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        color: colorMap[item.color],
                        fontWeight: "500",
                      }}
                    >
                      <FaInfoCircle className="me-1" /> Ver detalles
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="row mt-2">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <FaInfoCircle className="me-2" />
            <div>
              <strong>Información:</strong> Haga clic en cualquier tarjeta para ver más detalles sobre ese tipo de equipo.
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .icon-container {
          transition: all 0.3s ease;
        }
        .card:hover .icon-container {
          transform: scale(1.1);
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  )
}
