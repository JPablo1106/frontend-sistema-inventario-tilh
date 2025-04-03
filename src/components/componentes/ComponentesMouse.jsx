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

const ComponentesMouse = () => {
    const [asignacionesMouse, setAsignacionesMouse] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [busquedaFilt, setBusquedaFilt] = useState("");
    const [paginacion, setPaginacion] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchAsignacionesMouse();
    }, []);

    const fetchAsignacionesMouse = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('jwt');
            const response = await axios.get(
                "https://backendsistemainventario.onrender.com/api/Asignaciones/ConsultarAsignaciones",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { tipo: "mouse" }
                }
            );

            const asignacionesMouseArray = Array.isArray(response.data)
                ? response.data
                : Object.values(response.data);
            setAsignacionesMouse(asignacionesMouseArray);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las asignaciones de mouse.',error,
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAgregarMouse = useCallback(() => {
        navigate('/componentes/registro-componente');
    }, [navigate]);

    // Filtrar datos según término de búsqueda
    const filtracionDatos = useMemo(() => {
        if (!busquedaFilt.trim()) return asignacionesMouse;
        return asignacionesMouse.filter((mouse) =>
            mouse.usuario?.nombreUsuario.toLowerCase().includes(busquedaFilt.toLocaleLowerCase()) ||
            mouse.idAsignacion.toString().includes(busquedaFilt)
        );
    }, [asignacionesMouse, busquedaFilt]);

    // Función para exportar a Excel
    const handleExportExcel = async () => {
        if (filtracionDatos.length === 0) {
            Swal.fire({
                title: 'Sin registros',
                text: 'No se puede generar el Excel si no hay registros.',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        // Mapeo de datos para el Excel
        const exportData = filtracionDatos.map((item) => {
            // Formateo de fecha
            let fecha = "Sin datos";
            if (item.fechaAsignacion) {
                const date = new Date(item.fechaAsignacion);
                fecha = `${String(date.getDate()).padStart(2, "0")}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}-${date.getFullYear()}`;
            }
            const detalle = item.detalleAsignaciones && item.detalleAsignaciones[0] || {};
            return {
                "ID": item.idAsignacion,
                "Fecha": fecha,
                "Nombre Usuario": item.usuario?.nombreUsuario || "Sin datos",
                "Área": item.usuario?.area || "Sin datos",
                "Departamento": item.usuario?.departamento || "Sin datos",
                "Tipo de Componente": detalle.componente?.tipoComponente || "sin datos",
                "Marca": detalle.componente?.marcaComponente || "sin datos",
                "Número de Serie": detalle.numSerieComponente || "Sin datos",
            };
        });

        // Crear workbook y worksheet con ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Mouse Asignados");

        // Definir columnas y estilos
        const columnas = Object.keys(exportData[0]);
        worksheet.columns = columnas.map((col) => ({
            header: col,
            key: col,
            width: 20,
        }));

        // Estilos de cabecera: fondo rojo corporativo y fuente blanca, con alineación centrada
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD32F2F" },
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Agregar filas de datos
        exportData.forEach((dataRow) => {
            worksheet.addRow(dataRow);
        });

        // Generar archivo y descargarlo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "Mouse_Asignados.xlsx");
    };

    const columns = useMemo(
        () => [
            { header: 'ID', accesorKey: 'idAsignacion', isHidden:true },
            {
                header: 'Fecha',
                cell: ({ row }) => {
                    const fecha = row.original.fechaAsignacion;
                    if (!fecha) return 'Sin datos';
                    const date = new Date(fecha);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                },
            },
            { header: 'Nombre Usuario', accesorKey: 'usuario.nombreUsuario' },
            { header: 'Área', accesorKey: 'usuario.area' },
            { header: 'Departamento', accesorKey: 'usuario.departamento', isHidden:true},
            {
                header: 'Tipo de Componente',
                cell: ({ row }) =>
                    row.original.detalleAsignaciones &&
                    row.original.detalleAsignaciones[0]?.componente?.tipoComponente || 'sin datos',
            },
            {
                header: 'Marca',
                cell: ({ row }) =>
                    row.original.detalleAsignaciones &&
                    row.original.detalleAsignaciones[0]?.componente?.marcaComponente || 'sin datos',
            },
            {
                header: "Número de Serie",
                cell: ({ row }) =>
                    row.original.detalleAsignaciones &&
                    row.original.detalleAsignaciones[0]?.numSerieComponente || "Sin datos",
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
                <ol className="breadcrumb bg-ligth px-3 py-2 rounded">
                    <li className="breadcrumb-item active" aria-current='page'>
                        Teléfonos
                    </li>
                </ol>
            </nav>
            <div className="card shadow-sm border-0">
                <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Mouse Asignados</h4>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light btn-sm" onClick={handleExportExcel}>
                            <FaFileExcel className="me-1" /> Exportar a Excel
                        </button>
                        <button className="btn btn-light btn-sm" onClick={handleAgregarMouse}>
                            <FaPlus className="me-1" /> Nuevo Mouse
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
                                    placeholder="Buscar mouse asignados..."
                                    value={busquedaFilt}
                                    onChange={(e) => setBusquedaFilt(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-md-right d-flex justify-content-md-end align-items-center">
                            <label className="me-2 mb-0">Registros por pagina:</label>
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

export default ComponentesMouse;
