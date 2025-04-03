import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaPlus, FaFileExcel } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../styles/Style.css';

// Importar ExcelJS y FileSaver
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const Equipos = () => {
  const [asignacionesEquipos, setAsignacionesEquipos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busquedaFilt, setBusquedaFilt] = useState("");
  const [paginacion, setPaginacion] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAsignacionesEquipos();
    
  }, []);

  const fetchAsignacionesEquipos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.get(
        "https://backendsistemainventario.onrender.com/api/Asignaciones/ConsultarAsignaciones",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { tipo: "equipos" },
        }
      );

      const asignacionesEquiposArray = Array.isArray(response.data)
        ? response.data
        : Object.values(response.data);
      setAsignacionesEquipos(asignacionesEquiposArray);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las asignaciones de equipos.",error,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgregarEquipo = useCallback(() => {
    navigate("/equipos/registro-equipo");
  }, [navigate]);

  // Función para exportar a Excel
  const handleExportExcel = async () => {
    // Mapeamos los datos de exportación, siguiendo la misma lógica que en tu tabla.
    const exportData = filtracionDatos.map((item) => {
      const detalle = item.detalleAsignaciones && item.detalleAsignaciones[0] || {};
      const equipo = detalle.equipo || {};
      const disco = equipo.discoDuro || {};
      // Formatear fecha
      let fecha = "Sin datos";
      if (item.fechaAsignacion) {
        const date = new Date(item.fechaAsignacion);
        fecha = `${String(date.getDate()).padStart(2, "0")}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${date.getFullYear()}`;
      }
      return {
        "ID": item.idAsignacion,
        "Fecha Asignación": fecha,
        "Nombre Usuario": item.usuario?.nombreUsuario || "Sin datos",
        "Área": item.usuario?.area || "Sin datos",
        "Departamento": item.usuario?.departamento || "Sin datos",
        "Tipo de Equipo": equipo.tipoEquipo || "Sin datos",
        "Marca": equipo.marca || "Sin datos",
        "Modelo": equipo.modelo || "Sin datos",
        "Número de Serie": detalle.numSerieEquipo || "Sin datos",
        "IP Address": detalle.ipAddress || "Sin datos",
        "IP CPU Red": detalle.ipCpuRed || "Sin datos",
        "CPU": equipo.tipoProcesador && equipo.velocidadProcesador
          ? `${equipo.tipoProcesador} (${equipo.velocidadProcesador})`
          : "Sin datos",
        "RAM": equipo.memoriaRam && equipo.tipoMemoriaRam
          ? `${equipo.memoriaRam} ${equipo.tipoMemoriaRam}`
          : "Sin datos",
        "Marca Disco": disco.marca || "Sin datos",
        "Modelo Disco": disco.modelo || "Sin datos",
        "Almacenamiento": disco.capacidad ? `${disco.capacidad} GB` : "Sin datos",
        "Partición C": disco.c ? `${disco.c} GB` : "Sin datos",
        "Partición D": disco.d ? `${disco.d} GB` : "Sin datos",
        "Partición E": disco.e ? `${disco.e} GB` : "Sin datos",
      };
    });

    // Crear un workbook y una worksheet con exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Equipos Asignados");

    // Definir columnas y estilo de cabecera
    const columnas = Object.keys(exportData[0] || {});
    worksheet.columns = columnas.map((col) => ({
      header: col,
      key: col,
      width: 20,
    }));

    // Aplicar estilos corporativos a la cabecera
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F497D" }, // Ejemplo: azul oscuro corporativo
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Añadir las filas de datos
    exportData.forEach((dataRow) => {
      worksheet.addRow(dataRow);
    });

    // Generar el archivo y descargarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "Equipos_Asignados.xlsx");
  };

  // Filtrar asignaciones según el término de búsqueda.
  const filtracionDatos = useMemo(() => {
    if (!busquedaFilt.trim()) return asignacionesEquipos;
    return asignacionesEquipos.filter((equipo) =>
      equipo.usuario?.nombreUsuario.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
      equipo.usuario?.area.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
      equipo.usuario?.departamento.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
      equipo.idAsignacion.toString().includes(busquedaFilt)
    );
  }, [asignacionesEquipos, busquedaFilt]);

  // Definir columnas, incluyendo la información del equipo y usuario.
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "idAsignacion", isHidden: true, },
      {
        header: "Fecha Asignación",
        cell: ({ row }) => {
          const fecha = row.original.fechaAsignacion;
          if (!fecha) return "Sin datos";
          const date = new Date(fecha);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      { header: "Nombre Usuario", accessorKey: "usuario.nombreUsuario" },
      { header: "Área", accessorKey: "usuario.area" },
      { header: "Departamento", accessorKey: "usuario.departamento", isHidden: true, },
      {
        header: "Tipo de Equipo",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.tipoEquipo || "Sin datos",
      },
      {
        header: "Marca",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.marca || "Sin datos",
      },
      {
        header: "Modelo",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.modelo || "Sin datos",
      },
      {
        header: "Número de Serie",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.numSerieEquipo || "Sin datos",
      },
      {
        header: "IP Address",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.ipAddress || "Sin datos",
      },
      {
        header: "IP CPU Red",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.ipCpuRed || "Sin datos", isHidden: true,
      },
      {
        header: "CPU",
        cell: ({ row }) => {
          const equipo =
            row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo;
          return equipo && equipo.tipoProcesador && equipo.velocidadProcesador
            ? `${equipo.tipoProcesador} (${equipo.velocidadProcesador})`
            : "Sin datos";
        },
      },
      {
        header: "RAM",
        cell: ({ row }) => {
          const equipo =
            row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo;
          return equipo && equipo.memoriaRam && equipo.tipoMemoriaRam
            ? `${equipo.memoriaRam} ${equipo.tipoMemoriaRam}`
            : "Sin datos";
        },
      },
      {
        header: "Marca Disco",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.marca || "Sin datos", isHidden: true,
      },
      {
        header: "Modelo Disco",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.modelo || "Sin datos", isHidden: true,
      },
      {
        header: "Almacenamiento",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.capacidad
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.capacidad} GB`
            : "Sin datos",
      },
      {
        header: "Partición C",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.c
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.c} GB`
            : "Sin datos", isHidden: true,
      },
      {
        header: "Partición D",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.d
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.d} GB`
            : "Sin datos", isHidden: true,
      },
      {
        header: "Partición E",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.e
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.e} GB`
            : "Sin datos", isHidden: true,
      },
    ].filter((col) => !col.isHidden),
    []
  );

  const table = useReactTable({
    data: filtracionDatos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      paginacion,
    },
    onPaginationChange: setPaginacion,
  });

  return (
    <div className="container-container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-light px-3 py-2 rounded">
          <li className="breadcrumb-item active" aria-current="page">
            <h5>Equipos</h5>
          </li>
        </ol>
      </nav>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Equipos Asignados</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm" onClick={handleExportExcel}>
              <FaFileExcel className="me-1" /> Exportar a Excel
            </button>
            <button className="btn btn-light btn-sm" onClick={handleAgregarEquipo}>
              <FaPlus className="me-1" /> Nuevo Equipo
            </button>
          </div>
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
                  placeholder="Buscar equipos asignados..."
                  value={busquedaFilt}
                  onChange={(e) => setBusquedaFilt(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-right d-flex justify-content-md-end align-items-center">
              <label className="me-2 mb-0">Registros por página:</label>
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

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando asignaciones...</p>
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
                    {[...Array(table.getPageCount())]
                      .slice(0, 5)
                      .map((_, i) => (
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

export default Equipos;






/*import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../styles/Style.css';

const Equipos = () => {
  const [asignacionesEquipos, setAsignacionesEquipos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busquedaFilt, setBusquedaFilt] = useState("");
  const [paginacion, setPaginacion] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAsignacionesEquipos();
  }, []);

  const fetchAsignacionesEquipos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.get(
        "https://backendsistemainventario.onrender.com/api/Asignaciones/ConsultarAsignaciones",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { tipo: "equipos" } // Se envía "equipos" como parámetro
        }
      );

      const asignacionesEquiposArray = Array.isArray(response.data)
        ? response.data
        : Object.values(response.data);
      setAsignacionesEquipos(asignacionesEquiposArray);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las asignaciones de equipos.", error,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgregarEquipo = useCallback(() => {
    navigate("/equipos/registro-equipo");
  }, [navigate]);

  // Filtrar asignaciones según el término de búsqueda.
  const filtracionDatos = useMemo(() => {
    if (!busquedaFilt.trim()) return asignacionesEquipos;
    return asignacionesEquipos.filter((equipo) =>
      equipo.usuario?.nombreUsuario.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
    equipo.usuario?.area.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
    equipo.usuario?.departamento.toLowerCase().includes(busquedaFilt.toLowerCase()) ||
    equipo.idAsignacion.toString().includes(busquedaFilt)
    );
  }, [asignacionesEquipos, busquedaFilt]);

  // Definir columnas, incluyendo la información del equipo y usuario.
  const columns = useMemo(
    () => [
      // Datos de la asignación
      { header: "ID", accessorKey: "idAsignacion" },
      {
        header: "Fecha Asignación",
        cell: ({ row }) => {
          const fecha = row.original.fechaAsignacion;
          if (!fecha) return "Sin datos";
          const date = new Date(fecha);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      { header: "Nombre Usuario", accessorKey: "usuario.nombreUsuario" },
      { header: "Área", accessorKey: "usuario.area" },
      { header: "Departamento", accessorKey: "usuario.departamento" },
      {
        header: "Tipo de Equipo",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.tipoEquipo || "Sin datos",
      },
      {
        header: "Marca",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.marca || "Sin datos",
      },
      {
        header: "Modelo",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.modelo || "Sin datos",
      },
      {
        header: "Número de Serie",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.numSerieEquipo || "Sin datos",
      },
      {
        header: "IP Address",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.ipAddress || "Sin datos",
      },
      {
        header: "IP CPU Red",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.ipCpuRed || "Sin datos",
      },
      {
        header: "CPU",
        cell: ({ row }) => {
          const equipo =
            row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo;
          return equipo && equipo.tipoProcesador
            ? `${equipo.tipoProcesador} (${equipo.velocidadProcesador})`
            : "Sin datos";
        },
      },
      {
        header: "RAM",
        cell: ({ row }) => {
          const equipo =
            row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo;
          return equipo && equipo.memoriaRam && equipo.tipoMemoriaRam
            ? `${equipo.memoriaRam} ${equipo.tipoMemoriaRam}`
            : "Sin datos";
        },
      },
      // Datos del disco duro (anidado en el equipo)
      {
        header: "Marca Disco",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.marca || "Sin datos",
      },
      {
        header: "Modelo Disco",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
          row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.modelo || "Sin datos",
      },
      {
        header: "Almacenamiento",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.capacidad
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.capacidad} GB`
            : "Sin datos",
      },
      {
        header: "Partición C",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.c
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.c} GB`
            : "Sin datos",
      },
      {
        header: "Partición D",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.d
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.d} GB`
            : "Sin datos",
      },
      {
        header: "Partición E",
        cell: ({ row }) =>
          row.original.detalleAsignaciones &&
            row.original.detalleAsignaciones[0]?.equipo?.discoDuro?.e
            ? `${row.original.detalleAsignaciones[0].equipo.discoDuro.e} GB`
            : "Sin datos",
      },
    ],
    []
  );



  const table = useReactTable({
    data: filtracionDatos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      paginacion,
    },
    onPaginationChange: setPaginacion,
  });

  return (
    <div className="container-container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-light px-3 py-2 rounded">
          <li className="breadcrumb-item active" aria-current="page">
            <h5>Equipos</h5>
          </li>
        </ol>
      </nav>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Equipos Asignados</h4>
          <button className="btn btn-light btn-sm" onClick={handleAgregarEquipo}>
            <FaPlus className="me-1" /> Nuevo Equipo
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
                  placeholder="Buscar equipos asignados..."
                  value={busquedaFilt}
                  onChange={(e) => setBusquedaFilt(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-right d-flex justify-content-md-end align-items-center">
              <label className="me-2 mb-0">Registros por página:</label>
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

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando asignaciones...</p>
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
                    {[...Array(table.getPageCount())]
                      .slice(0, 5)
                      .map((_, i) => (
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

export default Equipos;
*/