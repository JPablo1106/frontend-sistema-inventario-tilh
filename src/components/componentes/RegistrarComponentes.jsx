import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import api from '../extras/axiosIntance';
import Swal from 'sweetalert2';
import { 
  FaPaperPlane, 
  FaTrademark, 
  FaBars, 
  FaTimes, 
  FaArrowLeft, 
  FaInfoCircle 
} from 'react-icons/fa';
import { BsKeyboard, BsPhone, BsDisplay } from "react-icons/bs";
import { LuComponent } from "react-icons/lu";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/RegistrarComponente.css';

const RegistrarComponentes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tipoComponente, setTipoComponente] = useState('');
    const [marcaComponente, setMarcaComponente] = useState('');
    const [modeloMonitor, setModeloMonitor] = useState('');
    const [modeloTelefono, setModeloTelefono] = useState('');
    const [idiomaTeclado, setIdiomaTeclado] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({
      tipoComponente: '',
      marcaComponente: '',
      modeloMonitor: '',
      modeloTelefono: '',
      idiomaTeclado: ''
    });

    useEffect(() => {
        if(location.state?.prevPath){
            navigate(-1);
        }
    }, [navigate, location]);

    const validarFormulario = () => {
      let esValido = true;
      const errores = {
        tipoComponente: '',
        marcaComponente: '',
        modeloMonitor: '',
        modeloTelefono: '',
        idiomaTeclado: ''
      };

      if (!tipoComponente) {
        errores.tipoComponente = 'El tipo de componente es requerido';
        esValido = false;
      }

      if (!marcaComponente.trim()) {
        errores.marcaComponente = 'La marca del componente es requerida';
        esValido = false;
      }

      if (tipoComponente === 'Monitor' && !modeloMonitor.trim()) {
        errores.modeloMonitor = 'El modelo del monitor es requerido';
        esValido = false;
      }

      if (tipoComponente === 'Teléfono IP' && !modeloTelefono.trim()) {
        errores.modeloTelefono = 'El modelo del teléfono es requerido';
        esValido = false;
      }

      if (tipoComponente === 'Teclado' && !idiomaTeclado) {
        errores.idiomaTeclado = 'El idioma del teclado es requerido';
        esValido = false;
      }

      setFormErrors(errores);
      return esValido;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
          return;
        }
        
        setIsLoading(true);

        try {
            Swal.fire({
              title: 'Registrando componente',
              text: 'Por favor espere...',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });
            
            const token = localStorage.getItem("jwt");
            await api.post(
                'Componentes/RegistrarComponente',
                {
                    tipoComponente,
                    marcaComponente,
                    modeloMonitor: tipoComponente === "Monitor" ? modeloMonitor : null,
                    modeloTelefono: tipoComponente === "Teléfono IP" ? modeloTelefono : null,
                    idiomaTeclado: tipoComponente === "Teclado" ? idiomaTeclado : null
                },
                {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                icon: 'success',
                title: '¡Componente registrado!',
                text: 'El componente ha sido registrado exitosamente en el sistema.',
                showConfirmButton: true,
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#3085d6',
                timer: 3000,
                timerProgressBar: true
            }).then((result) => {
              if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
                navigate(-1);
              }
            });

            setTipoComponente('');
            setMarcaComponente('');
            setModeloMonitor('');
            setModeloTelefono('');
            setIdiomaTeclado('');
        } catch (error) {
            console.log('Error al registrar el componente: ', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error al registrar componente',
                text: 'No se pudo registrar el componente. Inténtalo de nuevo.',
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Perderás los datos ingresados',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Sí, cancelar',
          cancelButtonText: 'No, continuar',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.isConfirmed) {
            window.history.back();
          }
        });
    };

    // Función para obtener el icono según el tipo de componente
    const getComponentIcon = () => {
      switch (tipoComponente) {
        case 'Monitor':
          return <BsDisplay />;
        case 'Teclado':
          return <BsKeyboard />;
        case 'Teléfono IP':
          return <BsPhone />;
        default:
          return <LuComponent />;
      }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                    <h2 className="fw-bold text-primary">
                        <LuComponent className="me-2" />
                        Registro de Componente
                    </h2>
                    <p className="text-muted">Complete el formulario para registrar un nuevo componente en el sistema</p>
                </div>
                <div className="col-md-6 text-md-end">
                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        <FaArrowLeft className="me-2" /> Volver
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <div className="d-flex align-items-center">
                                <div
                                    className="icon-container rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        backgroundColor: `rgba(220, 53, 69, 0.1)`,
                                        padding: "1rem",
                                        width: "50px",
                                        height: "50px",
                                        boxShadow: `0 0 15px rgba(220, 53, 69, 0.2)`,
                                    }}
                                >
                                    {getComponentIcon()}
                                </div>
                                <h4 className="mb-0">Información del Componente</h4>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="tipoComponente" className="form-label fw-semibold">
                                                Tipo de Componente
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <FaBars className="text-primary" />
                                                </span>
                                                <select
                                                    className={`form-select ${formErrors.tipoComponente ? 'is-invalid' : ''}`}
                                                    id="tipoComponente"
                                                    value={tipoComponente}
                                                    onChange={(a) => setTipoComponente(a.target.value)}
                                                >
                                                    <option value="">Seleccione una opción</option>
                                                    <option value="Monitor">Monitor</option>
                                                    <option value="Mouse">Mouse</option>
                                                    <option value="Teclado">Teclado</option>
                                                    <option value="Teléfono IP">Teléfono IP</option>
                                                </select>
                                                {formErrors.tipoComponente && <div className="invalid-feedback">{formErrors.tipoComponente}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="marcaComponente" className="form-label fw-semibold">
                                                Marca
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <FaTrademark className="text-primary" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formErrors.marcaComponente ? 'is-invalid' : ''}`}
                                                    id="marcaComponente"
                                                    placeholder="Ingrese la marca del componente"
                                                    value={marcaComponente}
                                                    onChange={(e) => setMarcaComponente(e.target.value)}
                                                />
                                                {formErrors.marcaComponente && <div className="invalid-feedback">{formErrors.marcaComponente}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {tipoComponente === 'Monitor' && (
                                    <div className="row mb-4">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="modeloMonitor" className="form-label fw-semibold">
                                                    Modelo del Monitor
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <BsDisplay className="text-primary" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${formErrors.modeloMonitor ? 'is-invalid' : ''}`}
                                                        id="modeloMonitor"
                                                        placeholder="Ingrese el modelo del monitor"
                                                        value={modeloMonitor}
                                                        onChange={(e) => setModeloMonitor(e.target.value)}
                                                    />
                                                    {formErrors.modeloMonitor && <div className="invalid-feedback">{formErrors.modeloMonitor}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {tipoComponente === 'Teléfono IP' && (
                                    <div className="row mb-4">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="modeloTelefono" className="form-label fw-semibold">
                                                    Modelo del Teléfono
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <BsPhone className="text-primary" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${formErrors.modeloTelefono ? 'is-invalid' : ''}`}
                                                        id="modeloTelefono"
                                                        placeholder="Ingrese el modelo del teléfono"
                                                        value={modeloTelefono}
                                                        onChange={(e) => setModeloTelefono(e.target.value)}
                                                    />
                                                    {formErrors.modeloTelefono && <div className="invalid-feedback">{formErrors.modeloTelefono}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {tipoComponente === 'Teclado' && (
                                    <div className="row mb-4">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="idiomaTeclado" className="form-label fw-semibold">
                                                    Idioma del Teclado
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <BsKeyboard className="text-primary" />
                                                    </span>
                                                    <select
                                                        className={`form-select ${formErrors.idiomaTeclado ? 'is-invalid' : ''}`}
                                                        id="idiomaTeclado"
                                                        value={idiomaTeclado}
                                                        onChange={(a) => setIdiomaTeclado(a.target.value)}
                                                    >
                                                        <option value="">Seleccione una opción</option>
                                                        <option value="Español">Español</option>
                                                        <option value="Inglés">Inglés</option>
                                                    </select>
                                                    {formErrors.idiomaTeclado && <div className="invalid-feedback">{formErrors.idiomaTeclado}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info d-flex align-items-center mt-4" role="alert">
                                    <FaInfoCircle className="me-2" />
                                    <div>
                                        <strong>Información:</strong> Todos los campos son obligatorios para el registro del componente.
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                                        <FaTimes className="me-2" /> Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? (
                                            <span>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Procesando...
                                            </span>
                                        ) : (
                                            <span>
                                                <FaPaperPlane className="me-2" /> Registrar Componente
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
            `}</style>
        </div>
    );
};

export default RegistrarComponentes;
