import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import api from "../extras/axiosIntance"
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaSearch,
  FaUserPlus,
  FaFileExcel,
  FaSync,
  FaInfoCircle,
  FaUsers,
} from "react-icons/fa"
import Swal from "sweetalert2"
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table"
import "bootstrap/dist/css/bootstrap.min.css"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import '../../styles/Usuarios.css'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [ultimaActualizacion, setUltimaActualizacion] = useState("")
  const [error, setError] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    setIsLoading(true)
    setError(false)

    try {
      const token = localStorage.getItem("jwt")
      const response = await api.get("usuarios/ConsultarUsuarios", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const usuariosArray = Array.isArray(response.data) ? response.data : Object.values(response.data)
      setUsuarios(usuariosArray)

      const ahora = new Date()
      setUltimaActualizacion(`${ahora.toLocaleDateString("es-ES")} ${ahora.toLocaleTimeString("es-ES")}`)
    } catch (error) {
      console.error("Error al obtener usuarios:", error)
      setError(true)
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudieron cargar los usuarios. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          fetchUsuarios()
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = useCallback(async (id) => {
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
          await api.delete(`usuarios/EliminarUsuario/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          Swal.fire({
            title: "¡Eliminado!",
            text: "Usuario eliminado correctamente",
            icon: "success",
            confirmButtonColor: "#3085d6",
            timer: 2000,
            timerProgressBar: true,
          })
          fetchUsuarios()
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el usuario",
            icon: "error",
            confirmButtonColor: "#3085d6",
          })
        }
      }
    })
  }, [])

  const handleEdit = useCallback(
    (id) => {
      navigate(`/usuarios/actualizar-usuario/${id}`)
    },
    [navigate],
  )

  const handleAddUser = useCallback(() => {
    navigate("/usuarios/registro-usuario")
  }, [navigate])

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

      // Mapeamos los datos de exportación usando los datos filtrados.
      const exportData = filteredData.map((user) => ({
        ID: user.idUsuario,
        "Nombre completo": user.nombreUsuario,
        Área: user.area,
        Departamento: user.departamento,
      }))

      // Crear un workbook y una worksheet con ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Usuarios")

      // Definir columnas y estilo de cabecera
      const columnas = Object.keys(exportData[0] || {})
      worksheet.columns = columnas.map((col) => ({
        header: col,
        key: col,
        width: 20,
      }))

      // Aplicar estilos a la cabecera
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1F497D" },
        }
        cell.alignment = { vertical: "middle", horizontal: "center" }
      })

      // Añadir las filas de datos
      exportData.forEach((dataRow) => {
        worksheet.addRow(dataRow)
      })

      // Generar el archivo y descargarlo
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, "Usuarios.xlsx")

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

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return usuarios
    return usuarios.filter(
      (user) =>
        user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.departamento.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [usuarios, searchTerm])

  const columns = useMemo(
    () => [
      { header: "Nombre completo", accessorKey: "nombreUsuario" },
      { header: "Área", accessorKey: "area" },
      { header: "Departamento", accessorKey: "departamento" },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="btn-group">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleEdit(row.original.idUsuario)}
              title="Editar usuario"
            >
              <FaEdit />
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDelete(row.original.idUsuario)}
              title="Eliminar usuario"
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete],
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
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
                <h4 className="mb-3">Cargando datos de usuarios</h4>
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
                <p className="text-muted mb-4">No se pudieron cargar los datos de usuarios.</p>
                <button className="btn btn-primary" onClick={fetchUsuarios}>
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
            <FaUsers className="me-2" />
            Gestión de Usuarios
          </h2>
          <p className="text-muted">Administración de usuarios del sistema de inventario</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button className="btn btn-outline-primary me-2" onClick={fetchUsuarios}>
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
                <FaUser className="text-primary me-2" style={{ fontSize: "1.2rem" }} />
                <h5 className="mb-0">Listado de Usuarios</h5>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-success btn-sm" onClick={handleExportExcel} title="Exportar a Excel">
                  <FaFileExcel className="me-1" /> Exportar a Excel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleAddUser} title="Agregar nuevo usuario">
                  <FaUserPlus className="me-1" /> Nuevo Usuario
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 text-md-end d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                  <label className="me-2 mb-0 text-muted">Registros por página:</label>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={pagination.pageSize}
                    onChange={(e) =>
                      setPagination((prev) => ({
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
                            No hay usuarios para mostrar
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Mostrando página {pagination.pageIndex + 1} de {table.getPageCount() || 1}
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
                      <li key={i} className={`page-item ${pagination.pageIndex === i ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination((prev) => ({ ...prev, pageIndex: i }))}
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
              <strong>Información:</strong> Utilice los botones de acción para editar o eliminar usuarios. Para agregar
              un nuevo usuario, haga clic en "Nuevo Usuario".
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

export default Usuarios

