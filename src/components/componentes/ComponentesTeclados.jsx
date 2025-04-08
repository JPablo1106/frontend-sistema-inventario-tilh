import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaSearch, FaPlus, FaFileExcel, FaSync, FaInfoCircle, FaKeyboard } from "react-icons/fa"
import Swal from "sweetalert2"
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table"
import "bootstrap/dist/css/bootstrap.min.css"
import '../../styles/Componentes.css';

// Importar ExcelJS y FileSaver
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

const ComponentesTeclados = () => {
  const [asignacionesTeclados, setAsignacionesTeclados] = useState([])
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
    fetchAsignacionesTeclados()
  }, [])

  const fetchAsignacionesTeclados = async () => {
    setIsLoading(true)
    setError(false)

    try {
      const token = localStorage.getItem("jwt")
      const response = await axios.get(
        "https://backendsistemainventario.onrender.com/api/Asignaciones/ConsultarAsignaciones",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { tipo: "teclados" },
        },
      )

      const asignacionesTecladosArray = Array.isArray(response.data) ? response.data : Object.values(response.data)
      setAsignacionesTeclados(asignacionesTecladosArray)

      const ahora = new Date()
      setUltimaActualizacion(`${ahora.toLocaleDateString("es-ES")} ${ahora.toLocaleTimeString("es-ES")}`)
    } catch (error) {
      console.error("Error al obtener asignaciones de teclados:", error)
      setError(true)
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudieron cargar las asignaciones de teclados. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          fetchAsignacionesTeclados()
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgregarTeclado = useCallback(() => {
    navigate("/componentes/registro-componente")
  }, [navigate])

  // Filtrar datos según término de búsqueda
  const filtracionDatos = useMemo(() => {
    if (!busquedaFilt.trim()) return asignacionesTeclados
    return asignacionesTeclados.filter(
      (teclado) =>
        teclado.usuario?.nombreUsuario.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
        teclado.usuario?.area?.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
        teclado.usuario?.departamento?.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
        teclado.idAsignacion.toString().includes(busquedaFilt),
    )
  }, [asignacionesTeclados, busquedaFilt])

  // Función para exportar a Excel
  const handleExportExcel = async () => {
    if (filtracionDatos.length === 0) {
      Swal.fire({
        title: "Sin registros",
        text: "No se puede generar el Excel si no hay registros.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      })
      return
    }

    try {
      Swal.fire({
        title: "Generando Excel",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Mapeo de datos para el Excel
      const exportData = filtracionDatos.map((item) => {
        // Formateo de fecha
        let fecha = "Sin datos"
        if (item.fechaAsignacion) {
          const date = new Date(item.fechaAsignacion)
          fecha = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(
            2,
            "0",
          )}-${date.getFullYear()}`
        }
        const detalle = (item.detalleAsignaciones && item.detalleAsignaciones[0]) || {}
        return {
          ID: item.idAsignacion,
          "Fecha Asignación": fecha,
          "Nombre Usuario": item.usuario?.nombreUsuario || "Sin datos",
          Área: item.usuario?.area || "Sin datos",
          Departamento: item.usuario?.departamento || "Sin datos",
          "Tipo de Componente": detalle.componente?.tipoComponente || "Sin datos",
          Marca: detalle.componente?.marcaComponente || "Sin datos",
          Idioma: detalle.componente?.idiomaTeclado || "Sin datos",
          "Número de Serie": detalle.numSerieComponente || "Sin datos",
        }
      })

      // Crear workbook y worksheet con ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Teclados Asignados")

      // Definir columnas y estilos
      const columnas = Object.keys(exportData[0] || {})
      worksheet.columns = columnas.map((col) => ({
        header: col,
        key: col,
        width: 20,
      }))

      // Estilos de cabecera
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1F497D" },
        }
        cell.alignment = { vertical: "middle", horizontal: "center" }
      })

      // Agregar filas de datos
      exportData.forEach((dataRow) => {
        worksheet.addRow(dataRow)
      })

      // Generar archivo y descargarlo
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, "Teclados_Asignados.xlsx")

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
        {
          header: "Nombre Usuario",
          cell: ({ row }) => row.original.usuario?.nombreUsuario || "Sin datos",
        },
        {
          header: "Área",
          cell: ({ row }) => row.original.usuario?.area || "Sin datos",
        },
        {
          header: "Departamento",
          cell: ({ row }) => row.original.usuario?.departamento || "Sin datos",
          isHidden: true,
        },
        {
          header: "Tipo de Componente",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.componente?.tipoComponente) ||
            "Sin datos",
        },
        {
          header: "Marca",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.componente?.marcaComponente) ||
            "Sin datos",
        },
        {
          header: "Idioma",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.componente?.idiomaTeclado) ||
            "Sin datos",
        },
        {
          header: "Número de Serie",
          cell: ({ row }) =>
            (row.original.detalleAsignaciones && row.original.detalleAsignaciones[0]?.numSerieComponente) ||
            "Sin datos",
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
                <h4 className="mb-3">Cargando datos de teclados</h4>
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
                <p className="text-muted mb-4">No se pudieron cargar los datos de teclados asignados.</p>
                <button className="btn btn-primary" onClick={fetchAsignacionesTeclados}>
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
            <FaKeyboard className="me-2" />
            Gestión de Teclados
          </h2>
          <p className="text-muted">Administración de teclados asignados en el sistema de inventario</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-primary me-2" onClick={fetchAsignacionesTeclados}>
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
                <FaKeyboard className="text-danger me-2" style={{ fontSize: "1.2rem" }} />
                <h5 className="mb-0">Listado de Teclados Asignados</h5>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-success btn-sm" onClick={handleExportExcel} title="Exportar a Excel">
                  <FaFileExcel className="me-1" /> Exportar a Excel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleAgregarTeclado} title="Agregar nuevo teclado">
                  <FaPlus className="me-1" /> Nuevo Teclado
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
                      placeholder="Buscar por usuario, área o departamento..."
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
                            No hay teclados asignados para mostrar
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
              <strong>Información:</strong> Esta tabla muestra los teclados asignados a usuarios en el sistema. Para
              agregar un nuevo teclado, haga clic en "Nuevo Teclado".
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
          overflow: hidden;
        }
        
        .pagination .page-link {
          border-radius: 4px;
          margin: 0 2px;
          transition: all 0.2s ease;
        }
        
        .pagination .page-item.active .page-link {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

export default ComponentesTeclados

