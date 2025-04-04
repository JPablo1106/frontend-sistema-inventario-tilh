import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { 
  FaUserTie, FaLaptop, FaNetworkWired, FaCalendarAlt, FaPlusCircle, 
  FaTrashAlt, FaPaperPlane, FaTimes 
} from "react-icons/fa";
import { BsPcDisplay } from "react-icons/bs";
import '../../styles/RegistrarAsignacion.css';

const ActualizarAsignacion = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id de la asignación a editar

  // Estados para dropdowns
  const [usuarios, setUsuarios] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [equiposSeguridad, setEquiposSeguridad] = useState([]);

  // Estado del formulario; se inicializa con valores vacíos y se sobreescribe al obtener los datos
  const [formData, setFormData] = useState({
    idUsuario: null,
    idEquipo: null,
    numSerieEquipo: '',
    ipAddress: '',
    ipCpuRed: '',
    fechaAsignacion: new Date().toISOString().slice(0, 10),
    componentes: [{ tempId: Date.now(), idComponente: '', numSerieComponente: '' }],
    dispositivosExt: [{ tempId: Date.now() + 1, marca: '', descripcion: '', numSerieDispExt: '' }],
    idEquipoSeguridad: '',
    numSerieEquipoSeg: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Configuración de headers con token
  const getAuthConfig = () => {
    const token = localStorage.getItem("jwt");
    return { headers: { Accept: "*/*", "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
  };

  // Cargar dropdowns
  useEffect(() => {
    axios.get('https://backendsistemainventario.onrender.com/api/usuarios/ConsultarUsuarios', getAuthConfig())
      .then(response => setUsuarios(response.data))
      .catch(err => console.error('Error cargando usuarios', err));

    axios.get('https://backendsistemainventario.onrender.com/api/equipos/ConsultarEquipos', getAuthConfig())
      .then(response => setEquipos(response.data))
      .catch(err => console.error('Error cargando equipos', err));

    axios.get('https://backendsistemainventario.onrender.com/api/Componentes/ConsultarComponentes', getAuthConfig())
      .then(response => setComponentes(response.data))
      .catch(err => console.error('Error cargando componentes', err));

    axios.get('https://backendsistemainventario.onrender.com/api/equiposSeguridad/ConsultarEquiposSeguridad', getAuthConfig())
      .then(response => setEquiposSeguridad(response.data))
      .catch(err => console.error('Error cargando equipos de seguridad', err));
  }, []);

  // Cargar datos de la asignación a editar
  useEffect(() => {
    setIsLoading(true);
    axios.get(`https://backendsistemainventario.onrender.com/api/Asignaciones/ConsultarAsignacionId/${id}`, getAuthConfig())
      .then(response => {
        // Se espera que la API retorne un objeto con la misma estructura del payload
        const data = response.data;
        setFormData({
          idUsuario: data.idUsuario,
          idEquipo: data.idEquipo,
          numSerieEquipo: data.numSerieEquipo || '',
          ipAddress: data.ipAddress || '',
          ipCpuRed: data.ipCpuRed || '',
          fechaAsignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          componentes: data.componentes && data.componentes.length > 0 
                        ? data.componentes.map(comp => ({ ...comp, tempId: Date.now() + Math.random() }))
                        : [{ tempId: Date.now(), idComponente: '', numSerieComponente: '' }],
          dispositivosExt: data.dispositivosExt && data.dispositivosExt.length > 0 
                        ? data.dispositivosExt.map(dev => ({ ...dev, tempId: Date.now() + Math.random() }))
                        : [{ tempId: Date.now() + 1, marca: '', descripcion: '', numSerieDispExt: '' }],
          idEquipoSeguridad: data.idEquipoSeguridad || '',
          numSerieEquipoSeg: data.numSerieEquipoSeg || ''
        });
      })
      .catch(err => {
        console.error('Error al cargar la asignación', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la asignación. Inténtalo nuevamente.'
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // Opciones para react-select
  const usuariosOptions = usuarios
    .filter(usuario => usuario.idUsuario != null)
    .map(usuario => ({
      value: usuario.idUsuario,
      label: `${usuario.nombreUsuario} - ${usuario.area} - ${usuario.departamento}`
    }));

  const equiposOptions = equipos
    .filter(equipo => equipo.idEquipo != null)
    .map(equipo => ({
      value: equipo.idEquipo,
      label: `${equipo.tipoEquipo} - ${equipo.marca} - ${equipo.modelo} - ${equipo.tipoProcesador}`
    }));

  // Manejo de cambios en react-select
  const handleUsuarioChange = selectedOption => {
    setFormData(prev => ({ ...prev, idUsuario: selectedOption ? selectedOption.value : null }));
  };

  const handleEquipoChange = selectedOption => {
    setFormData(prev => ({ ...prev, idEquipo: selectedOption ? selectedOption.value : null }));
  };

  // Manejo de inputs normales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index, e) => {
    const { name, value } = e.target;
    const newComponents = [...formData.componentes];
    newComponents[index][name] = value;
    setFormData(prev => ({ ...prev, componentes: newComponents }));
  };

  const handleDeviceChange = (index, e) => {
    const { name, value } = e.target;
    const newDevices = [...formData.dispositivosExt];
    newDevices[index][name] = value;
    setFormData(prev => ({ ...prev, dispositivosExt: newDevices }));
  };

  // Genera un id único para componentes y dispositivos
  const generateUniqueId = () => Date.now() + Math.random();

  // Agregar fila de componente
  const addComponentRow = () => {
    const newRow = { tempId: generateUniqueId(), idComponente: '', numSerieComponente: '' };
    setFormData(prev => ({ ...prev, componentes: [...prev.componentes, newRow] }));
  };

  // Agregar fila de dispositivo externo
  const addDeviceRow = () => {
    const newRow = { tempId: generateUniqueId(), marca: '', descripcion: '', numSerieDispExt: '' };
    setFormData(prev => ({ ...prev, dispositivosExt: [...prev.dispositivosExt, newRow] }));
  };

  // Eliminar fila de componente
  const removeComponentRow = (tempId) => {
    setFormData(prev => ({ ...prev, componentes: prev.componentes.filter(comp => comp.tempId !== tempId) }));
  };

  // Eliminar fila de dispositivo
  const removeDeviceRow = (tempId) => {
    setFormData(prev => ({ ...prev, dispositivosExt: prev.dispositivosExt.filter(dev => dev.tempId !== tempId) }));
  };

  // Envío del formulario para actualizar la asignación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Filtrar filas completas
    const componentesFiltrados = formData.componentes.filter(comp =>
      comp.idComponente !== '' && comp.numSerieComponente.trim() !== ''
    );
    const dispositivosFiltrados = formData.dispositivosExt.filter(dev =>
      dev.marca.trim() !== '' && dev.descripcion.trim() !== '' && dev.numSerieDispExt.trim() !== ''
    );

    const payload = {
      idAsignacion: Number(id),
      idUsuario: Number(formData.idUsuario),
      idEquipo: formData.idEquipo ? Number(formData.idEquipo) : null,
      numSerieEquipo: formData.numSerieEquipo,
      fechaAsignacion: new Date(formData.fechaAsignacion).toISOString(),
      ipAddress: formData.ipAddress,
      ipCpuRed: formData.ipCpuRed,
      componentes: componentesFiltrados.map(comp => ({
        ...comp,
        idComponente: comp.idComponente ? Number(comp.idComponente) : null
      })),
      dispositivosExt: dispositivosFiltrados,
      idEquipoSeguridad: formData.idEquipoSeguridad ? Number(formData.idEquipoSeguridad) : null,
      numSerieEquipoSeg: formData.numSerieEquipoSeg,
    };

    try {
      await axios.post(
        'https://backendsistemainventario.onrender.com/api/Asignaciones/ActualizarAsignacion',
        payload,
        getAuthConfig()
      );
      Swal.fire({
        icon: 'success',
        title: 'Asignación actualizada exitosamente',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/asignaciones');
    } catch (error) {
      console.error('Error al actualizar la asignación', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la asignación. Por favor, inténtalo de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/asignaciones');
  };

  if(isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p className="mt-2">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className='asignaciones-container'>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-light px-3 py-2 rounded">
          <li className="breadcrumb-item active" aria-current="page">
            <h5>Asignaciones</h5>
          </li>
        </ol>
      </nav>

      <div className='card shadow-sm border-0 mt-3'>
        <div className='card-header bg-success text-white'>
          <h4 className='mb-0'>
            <BsPcDisplay className='mr-2' />
            Actualizar Asignación
          </h4>
        </div>
        <div className='card-body'>
          <form onSubmit={handleSubmit}>
            {/* Datos Generales */}
            <div className="mb-4">
              <h5 className="mb-3"><FaUserTie className="mr-2" />Datos Generales</h5>
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="idUsuario" className="control-label">Usuario</label>
                  <Select
                    id="idUsuario"
                    name="idUsuario"
                    options={usuariosOptions}
                    onChange={handleUsuarioChange}
                    placeholder="Seleccione un usuario"
                    value={usuariosOptions.find(option => option.value === formData.idUsuario) || null}
                    isClearable
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="fechaAsignacion" className="control-label">Fecha de Asignación</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text"><FaCalendarAlt /></span>
                    </div>
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
            <div className="mb-4">
              <h5 className="mb-3"><FaLaptop className="mr-2" />Equipo</h5>
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="idEquipo" className="control-label">Equipo</label>
                  <Select
                    id="idEquipo"
                    name="idEquipo"
                    options={equiposOptions}
                    onChange={handleEquipoChange}
                    placeholder="Seleccione un equipo"
                    value={equiposOptions.find(option => option.value === formData.idEquipo) || null}
                    isClearable
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="numSerieEquipo" className="control-label">Número de Serie del Equipo</label>
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
              <div className="row mt-3">
                <div className="form-group col-md-6">
                  <label htmlFor="ipAddress" className="control-label">IP Address</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text"><FaNetworkWired /></span>
                    </div>
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
                <div className="form-group col-md-6">
                  <label htmlFor="ipCpuRed" className="control-label">IP CPU Red</label>
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

            {/* Componentes */}
            <div className="mb-4">
              <h5 className="mb-3"><FaPlusCircle className="mr-2" />Componentes</h5>
              {formData.componentes.map((comp, index) => (
                <div className="row mb-2 align-items-center" key={comp.tempId}>
                  <div className="form-group col-md-5">
                    <select
                      name="idComponente"
                      className="form-control"
                      value={comp.idComponente}
                      onChange={(e) => handleComponentChange(index, e)}
                      required
                    >
                      <option value="">Seleccione un componente</option>
                      {componentes.length === 0 && <option>Sin componentes disponibles</option>}
                      {componentes.filter(compItem => compItem.idComponente != null)
                        .map(compItem => (
                          <option key={compItem.idComponente} value={compItem.idComponente.toString()}>
                            {compItem.tipoComponente} - {compItem.marcaComponente}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group col-md-5">
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
                  <div className="form-group col-md-2 text-center">
                    <button type="button" className="btn btn-danger" onClick={() => removeComponentRow(comp.tempId)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addComponentRow}>
                Agregar Componente
              </button>
            </div>

            {/* Dispositivos Externos */}
            <div className="mb-4">
              <h5 className="mb-3"><FaPlusCircle className="mr-2" />Dispositivos Externos</h5>
              {formData.dispositivosExt.map((dev, index) => (
                <div className="row mb-2 align-items-center" key={dev.tempId}>
                  <div className="form-group col-md-3">
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
                  <div className="form-group col-md-3">
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
                  <div className="form-group col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ingrese el número de serie"
                      name="numSerieDispExt"
                      value={dev.numSerieDispExt}
                      onChange={(e) => handleDeviceChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group col-md-3 text-center">
                    <button type="button" className="btn btn-danger" onClick={() => removeDeviceRow(dev.tempId)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addDeviceRow}>
                Agregar Dispositivo Externo
              </button>
            </div>

            {/* Equipo de Seguridad */}
            <div className="mb-4">
              <h5 className="mb-3"><FaLaptop className="mr-2" />Equipo de Seguridad</h5>
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="idEquipoSeguridad" className="control-label">Equipo de Seguridad</label>
                  <select
                    id="idEquipoSeguridad"
                    name="idEquipoSeguridad"
                    className="form-control"
                    value={formData.idEquipoSeguridad}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione un equipo de seguridad</option>
                    {equiposSeguridad.length === 0 && <option>Sin equipos de seguridad</option>}
                    {equiposSeguridad.filter(equipoSeg => equipoSeg.idEquipoSeguridad != null)
                      .map(equipoSeg => (
                        <option key={equipoSeg.idEquipoSeguridad} value={equipoSeg.idEquipoSeguridad.toString()}>
                          {equipoSeg.tipo} - {equipoSeg.marca} - {equipoSeg.modelo}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="numSerieEquipoSeg" className="control-label">Número de Serie del Equipo de Seguridad</label>
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

            {/* Botones de acción */}
            <div className="form-actions mt-4 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-danger btn-lg" onClick={handleCancel}>
                <FaTimes className="mr-2" />
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Actualizar Asignación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActualizarAsignacion;
