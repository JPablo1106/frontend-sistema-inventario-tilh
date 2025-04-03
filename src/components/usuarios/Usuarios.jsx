import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaUser, FaSearch, FaUserPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Usuarios.css"; // We'll create this custom CSS file

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.get(
        "https://backendsistemainventario.onrender.com/api/usuarios/ConsultarUsuarios",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const usuariosArray = Array.isArray(response.data)
        ? response.data
        : Object.values(response.data);
      setUsuarios(usuariosArray);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los usuarios.", error,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        confirmButton: 'btn btn-danger',
        
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("jwt");
          await axios.delete(
            `https://backendsistemainventario.onrender.com/api/usuarios/EliminarUsuario/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          Swal.fire({
            title: "Eliminado",
            text: "Usuario eliminado correctamente",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
          fetchUsuarios();
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el usuario", error,
            icon: "error",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    });
  }, []);

  const handleEdit = useCallback(
    (id) => {
      navigate(`/usuarios/editar-usuario/${id}`);
    },
    [navigate]
  );

  const handleAddUser = useCallback(() => {
    navigate("/usuarios/registro-usuario");
  }, [navigate]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return usuarios;
    
    return usuarios.filter(user => 
      user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usuarios, searchTerm]);

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
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="usuarios-container">
      <nav aria-label="breadcrumb">
  <ol className="breadcrumb bg-light px-3 py-2 rounded">
    <li className="breadcrumb-item active" aria-current="page">
      <h5>Usuarios</h5>
    </li>
  </ol>
</nav>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FaUser className="me-2" /> Gestión de Usuarios
          </h4>
          <button 
            className="btn btn-light btn-sm" 
            onClick={handleAddUser}
          >
            <FaUserPlus className="me-1" /> Nuevo Usuario
          </button>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text bg-white">
                    <FaSearch />
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-right d-flex justify-content-md-end align-items-center">
              <label className="me-2 mb-0">Registros por página:</label>
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

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-bordered">
                  <thead className="thead-light">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="align-middle">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-4">
                          <div className="alert alert-info mb-0">
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
                    <li className={`page-item ${!table.getCanPreviousPage() ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Anterior
                      </button>
                    </li>
                    {[...Array(table.getPageCount())].slice(0, 5).map((_, i) => (
                      <li key={i} className={`page-item ${pagination.pageIndex === i ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, pageIndex: i }))}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${!table.getCanNextPage() ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Usuarios;