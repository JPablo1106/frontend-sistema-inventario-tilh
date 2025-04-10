import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaSearch, FaFileExcel, FaEdit, FaTrash, FaSync, FaInfoCircle, FaClipboardList, FaPlus } from "react-icons/fa"
import Swal from "sweetalert2"
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table"
import "bootstrap/dist/css/bootstrap.min.css"
import "../../styles/Asignaciones.css"

// Importar ExcelJS y FileSaver
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

const Asignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busquedaFilt, setBusquedaFilt] = useState("")
  const [paginacion, setPaginacion] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [ultimaActualizacion, setUltimaActualizacion] = useState("")
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAsignaciones()
  }, [])

  const fetchAsignaciones = async () => {
    setIsLoading(true)
    setError(false)

    try {
      const token = localStorage.getItem("jwt")
      const response = await axios.get(
        "https://backendsistemainventario.onrender.com/api/Asignaciones/ConsultarAsignacionesCompletas",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const asignacionesArray = Array.isArray(response.data) ? response.data : Object.values(response.data)
      setAsignaciones(asignacionesArray)

      const ahora = new Date()
      setUltimaActualizacion(`${ahora.toLocaleDateString("es-ES")} ${ahora.toLocaleTimeString("es-ES")}`)
    } catch (error) {
      console.error("Error al obtener asignaciones:", error)
      setError(true)
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudieron cargar las asignaciones. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          fetchAsignaciones()
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para exportar a Excel
  const handleExportExcel = async () => {
    try {
      Swal.fire({
        title: "Generando Excel",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const exportData = filtracionDatos.map((item) => {
        // Se mapea el primer detalle si existe
        const detalle = (item.detalleAsignaciones && item.detalleAsignaciones[0]) || {}
        const equipo = detalle.equipo || {}
        const disco = equipo.discoDuro || {}
        // Formatear fecha
        let fecha = "Sin datos"
        if (item.fechaAsignacion) {
          const date = new Date(item.fechaAsignacion)
          fecha = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(
            2,
            "0",
          )}-${date.getFullYear()}`
        }
        return {
          "ID Asignación": item.idAsignacion,
          "Fecha Asignación": fecha,
          "Nombre Usuario": item.usuario?.nombreUsuario || "Sin datos",
          Área: item.usuario?.area || "Sin datos",
          Departamento: item.usuario?.departamento || "Sin datos",
          "Tipo de Equipo": equipo.tipoEquipo || "Sin datos",
          "Marca Equipo": equipo.marca || "Sin datos",
          "Modelo Equipo": equipo.modelo || "Sin datos",
          "Número de Serie Equipo": detalle.numSerieEquipo || "Sin datos",
          "IP Address": detalle.ipAddress || "Sin datos",
          "IP CPU Red": detalle.ipCpuRed || "Sin datos",
          CPU:
            equipo.tipoProcesador && equipo.velocidadProcesador
              ? `${equipo.tipoProcesador} (${equipo.velocidadProcesador})`
              : "Sin datos",
          RAM:
            equipo.memoriaRam && equipo.tipoMemoriaRam ? `${equipo.memoriaRam} ${equipo.tipoMemoriaRam}` : "Sin datos",
          "Marca Disco": disco.marca || "Sin datos",
          "Modelo Disco": disco.modelo || "Sin datos",
          "Almacenamiento Disco": disco.capacidad ? `${disco.capacidad} GB` : "Sin datos",
          "Partición C": disco.c ? `${disco.c} GB` : "Sin datos",
          "Partición D": disco.d ? `${disco.d} GB` : "Sin datos",
          "Partición E": disco.e ? `${disco.e} GB` : "Sin datos",
          "Marca Equipo Seguridad": detalle.equipoSeguridad?.marca || "Sin datos",
          "Modelo Equipo Seguridad": detalle.equipoSeguridad?.modelo || "Sin datos",
          "Capacidad Equipo Seguridad": detalle.equipoSeguridad?.capacidad || "Sin datos",
          "Tipo Equipo Seguridad": detalle.equipoSeguridad?.tipo || "Sin datos",
          "Número de Serie Equipo Seguridad": detalle.numSerieEquipoSeg || "Sin datos",
        }
      })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Asignaciones Completas")

      const columnas = Object.keys(exportData[0] || {})
      worksheet.columns = columnas.map((col) => ({
        header: col,
        key: col,
        width: 20,
      }))

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1F497D" },
        }
        cell.alignment = { vertical: "middle", horizontal: "center" }
      })

      exportData.forEach((dataRow) => {
        worksheet.addRow(dataRow)
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, "Asignaciones_Completas.xlsx")

      Swal.fire({
        title: "¡Éxito!",
        text: "Archivo Excel generado correctamente",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo generar el archivo Excel",
        icon: "error",
        confirmButtonColor: "#3085d6",
      })
    }
  }

  // Filtrado de asignaciones según el término de búsqueda
  const filtracionDatos = useMemo(() => {
    if (!busquedaFilt.trim()) return asignaciones
    return asignaciones.filter(
      (asig) =>
        asig.usuario?.nombreUsuario.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
        asig.usuario?.area.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
        asig.usuario?.departamento.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
        asig.idAsignacion.toString().includes(busquedaFilt),
    )
  }, [asignaciones, busquedaFilt])

  // Definición de columnas (se utiliza el primer elemento de detalleAsignaciones)
  const columns = useMemo(
    () =>
      [
        { header: "ID", accessorKey: "idAsignacion", isHidden: true },
        {
          header: "Fecha Asignación",
          cell: ({ row }) => {
            const fecha = row.original.fechaAsignacion
            if (!fecha) return "Sin datos"
            const date = new Date(fecha)
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year = date.getFullYear()
            return `${day}-${month}-${year}`
          },
        },
        { header: "Nombre Usuario", accessorKey: "usuario.nombreUsuario" },
        { header: "Área", accessorKey: "usuario.area", isHidden: true },
        { header: "Departamento", accessorKey: "usuario.departamento", isHidden: true },
        {
          header: "Tipo de Equipo",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.tipoEquipo) ||
            "Sin datos",
        },
        {
          header: "Marca Equipo",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.marca) || "Sin datos",
        },
        {
          header: "Modelo Equipo",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.modelo) || "Sin datos",
        },
        {
          header: "Número de Serie Equipo",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.numSerieEquipo) || "Sin datos",
        },
        {
          header: "IP Address",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.ipAddress) || "Sin datos",
        },
        {
          header: "IP CPU Red",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.ipCpuRed) || "Sin datos",
        },
        {
          header: "CPU",
          cell: ({ row }) => {
            const equipo = row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo
            return equipo && equipo.tipoProcesador && equipo.velocidadProcesador
              ? `${equipo.tipoProcesador} (${equipo.velocidadProcesador})`
              : "Sin datos"
          },
        },
        {
          header: "RAM",
          cell: ({ row }) => {
            const equipo = row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo
            return equipo && equipo.memoriaRam && equipo.tipoMemoriaRam
              ? `${equipo.memoriaRam} ${equipo.tipoMemoriaRam}`
              : "Sin datos"
          },
        },
        {
          header: "Marca Disco",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.marca) ||
            "Sin datos",
          isHidden: true,
        },
        {
          header: "Modelo Disco",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.modelo) ||
            "Sin datos",
          isHidden: true,
        },
        {
          header: "Almacenamiento Disco",
          cell: ({ row }) => {
            const disco = row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.discoDuro
            return disco && disco.capacidad ? `${disco.capacidad} GB` : "Sin datos"
          },
        },
        {
          header: "Partición C",
          cell: ({ row }) => {
            const disco = row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.discoDuro
            return disco && disco.c ? `${disco.c} GB` : "Sin datos"
          },
          isHidden: true,
        },
        {
          header: "Partición D",
          cell: ({ row }) => {
            const disco = row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.discoDuro
            return disco && disco.d ? `${disco.d} GB` : "Sin datos"
          },
          isHidden: true,
        },
        {
          header: "Partición E",
          cell: ({ row }) => {
            const disco = row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipo?.discoDuro
            return disco && disco.e ? `${disco.e} GB` : "Sin datos"
          },
          isHidden: true,
        },
        {
          header: "Monitor",
          cell: ({ row }) => {
            const monitor = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Monitor",
            )
            // Puedes mostrar el modelo del monitor u otra propiedad que necesites
            return monitor && monitor.componente?.marcaComponente ? monitor.componente.marcaComponente : "sin datos"
          },
        },
        {
          header: "Modelo Monitor",
          cell: ({ row }) => {
            const monitor = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Monitor",
            )
            // Puedes mostrar el modelo del monitor u otra propiedad que necesites
            return monitor && monitor.componente?.modeloMonitor ? monitor.componente.modeloMonitor : "sin datos"
          },
        },
        {
          header: "Número de Serie Monitor",
          cell: ({ row }) => {
            const monitor = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Monitor",
            )

            return monitor?.numSerieComponente || "Sin datos"
          },
        },
        {
          header: "Teclado",
          cell: ({ row }) => {
            const teclado = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Teclado",
            )
            // Puedes mostrar el modelo del monitor u otra propiedad que necesites
            return teclado && teclado.componente?.marcaComponente ? teclado.componente.marcaComponente : "sin datos"
          },
        },
        {
          header: "Idioma Teclado",
          cell: ({ row }) => {
            const teclado = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Teclado",
            )
            // Puedes mostrar el modelo del monitor u otra propiedad que necesites
            return teclado && teclado.componente?.idiomaTeclado ? teclado.componente.idiomaTeclado : "sin datos"
          },
        },
        {
          header: "Número de Serie Teclado",
          cell: ({ row }) => {
            const teclado = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Teclado",
            )

            return teclado?.numSerieComponente || "Sin datos"
          },
        },
        {
          header: "Teléfono IP",
          cell: ({ row }) => {
            const telefono = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Teléfono IP",
            )
            // Puedes mostrar el modelo del monitor u otra propiedad que necesites
            return telefono && telefono.componente?.marcaComponente ? telefono.componente.marcaComponente : "sin datos"
          },
        },
        {
          header: "Modelo Teléfono IP",
          cell: ({ row }) => {
            const telefono = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Teléfono IP",
            )
            // Puedes mostrar el modelo del monitor u otra propiedad que necesites
            return telefono && telefono.componente?.modeloTelefono ? telefono.componente.modeloTelefono : "sin datos"
          },
        },
        {
          header: "Número de Serie Teléfono IP",
          cell: ({ row }) => {
            const telefono = row.original.detalleAsignaciones?.find(
              (detalle) => detalle.componente?.tipoComponente === "Teléfono IP",
            )

            return telefono?.numSerieComponente || "Sin datos"
          },
        },
        {
          header: "Marca Equipo Seguridad",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipoSeguridad?.marca) ||
            "Sin datos",
        },
        {
          header: "Modelo Equipo Seguridad",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipoSeguridad?.modelo) ||
            "Sin datos",
        },
        {
          header: "Capacidad Equipo Seguridad",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipoSeguridad?.capacidad) ||
            "Sin datos",
        },
        {
          header: "Tipo Equipo Seguridad",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.equipoSeguridad?.tipo) ||
            "Sin datos",
        },
        {
          header: "Número de Serie Equipo Seguridad",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.numSerieEquipoSeg) || "Sin datos",
        },
        {
          header: "Acciones",
          cell: ({ row }) => (
            <div className="btn-group">
              <button
                className="btn btn-outline-primary btn-sm"
                title="Editar asignación"
                onClick={() => navigate(`/asignaciones/actualizar-asignacion/${row.original.idAsignacion}`)}
              >
                <FaEdit />
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                title="Eliminar asignación"
                onClick={() => {
                  Swal.fire({
                    title: "¿Estás seguro?",
                    text: "Esta acción no se puede deshacer",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar",
                    customClass: {
                      confirmButton: "btn btn-danger",
                      cancelButton: "btn btn-secondary",
                    },
                    buttonsStyling: false,
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      try {
                        const token = localStorage.getItem("jwt")
                        await axios.delete(
                          `https://backendsistemainventario.onrender.com/api/Asignaciones/EliminarAsignacion/${row.original.idAsignacion}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          },
                        )
                        Swal.fire({
                          title: "¡Eliminado!",
                          text: "Asignación eliminada correctamente",
                          icon: "success",
                          confirmButtonColor: "#3085d6",
                          timer: 2000,
                          timerProgressBar: true,
                        })
                        fetchAsignaciones()
                      } catch (error) {
                        Swal.fire({
                          title: "Error",
                          text: "No se pudo eliminar la asignación",
                          icon: "error",
                          confirmButtonColor: "#3085d6",
                        })
                      }
                    }
                  })
                }}
              >
                <FaTrash />
              </button>
            </div>
          ),
        },
      ].filter((col) => !col.isHidden),
    [],
  )

  const table = useReactTable({
    data: filtracionDatos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: paginacion,
    },
    onPaginationChange: setPaginacion,
  })

  if (isLoading) {
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
                <h4 className="mb-3">Cargando datos de asignaciones</h4>
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
                <FaInfoCircle className="text-danger mb-3" style={{ fontSize: "3rem" }} />
                <h4 className="mb-3 text-danger">Error de conexión</h4>
                <p className="text-muted mb-4">No se pudieron cargar los datos de asignaciones.</p>
                <button className="btn btn-primary" onClick={fetchAsignaciones}>
                  <FaSync className="me-2" /> Reintentar
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
            Gestión de Asignaciones
          </h2>
          <p className="text-muted">Administración de asignaciones de equipos a usuarios</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-primary me-2" onClick={fetchAsignaciones}>
            <FaSync className="me-2" /> Actualizar datos
          </button>
          <small className="text-muted d-block mt-2">Última actualización: {ultimaActualizacion}</small>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center">
                <FaClipboardList className="text-primary me-2" style={{ fontSize: "1.2rem" }} />
                <h5 className="mb-0">Listado de Asignaciones</h5>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-success btn-sm" onClick={handleExportExcel} title="Exportar a Excel">
                  <FaFileExcel className="me-1" /> Exportar a Excel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/asignaciones/nueva-asignacion")}
                  title="Agregar nueva asignación"
                >
                  <FaPlus className="me-1" /> Nueva Asignación
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FaSearch className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Buscar por nombre, área o departamento..."
                      value={busquedaFilt}
                      onChange={(e) => setBusquedaFilt(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 text-md-end d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                  <label className="me-2 mb-0 text-muted">Registros por página:</label>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={paginacion.pageSize}
                    onChange={(e) =>
                      setPaginacion((prev) => ({
                        ...prev,
                        pageSize: Number(e.target.value),
                        pageIndex: 0,
                      }))
                    }
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-bordered">
                  <thead className="table-light">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="align-middle">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="align-middle">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-4">
                          <div className="alert alert-info mb-0">
                            <FaInfoCircle className="me-2" />
                            No hay asignaciones para mostrar
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Mostrando página {paginacion.pageIndex + 1} de {table.getPageCount() || 1}
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${!table.getCanPreviousPage() ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Anterior
                      </button>
                    </li>
                    {[...Array(Math.min(table.getPageCount(), 5))].map((_, i) => (
                      <li key={i} className={`page-item ${paginacion.pageIndex === i ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setPaginacion((prev) => ({ ...prev, pageIndex: i }))}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${!table.getCanNextPage() ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <FaInfoCircle className="me-2" />
            <div>
              <strong>Información:</strong> Utilice los botones de acción para editar o eliminar asignaciones. Para
              agregar una nueva asignación, haga clic en "Nueva Asignación".
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
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
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
        
        .progress {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .progress-bar {
          transition: width 1s ease;
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
        
        .table-responsive {
  border-radius: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

        }
        
        .pagination .page-link {
          border-radius: 4px;
          margin: 0 2px;
          transition: all 0.2s ease;
        }
        
        .pagination .page-item.active .page-link {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .spinner-border {
          animation-duration: 1.5s;
        }
        
        .input-group .form-control:focus {
          box-shadow: none;
          border-color: #ced4da;
        }
        
        .input-group-text {
          background-color: transparent;
        }
      `}</style>
    </div>
  )
}

export default Asignaciones
