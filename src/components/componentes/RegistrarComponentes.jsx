import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaTrademark, FaBars } from 'react-icons/fa';
import { BsKeyboard, BsPhone, BsDisplay } from "react-icons/bs";
import { LuComponent } from "react-icons/lu";
import 'bootstrap/dist/css/bootstrap.min.css';

const RegistrarComponentes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tipoComponente, setTipoComponente] = useState('');
    const [marcaComponente, setMarcaComponente] = useState('');
    const [modeloMonitor, setModeloMonitor] = useState('');
    const [modeloTelefono, setModeloTelefono] = useState('');
    const [idiomaTeclado, setIdiomaTeclado] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(location.state?.prevPath){
            navigate('/dashboard', {replace:true});
        }
    }, [navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem("jwt");
            await axios.post(
                'https://backendsistemainventario.onrender.com/api/Componentes/RegistrarComponente',
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
                title: 'Componente registrado exitosamente.',
                showConfirmButton: false,
                timer: 1500
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
                title: 'Error',
                text: 'No se pudo registrar el componente. Inténtalo de nuevo.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/componentes');
    };

    return (
        <div className='container mt-4'>
            <div className='card shadow-sm border-0'>
                <div className='card-header bg-danger text-white'>
                    <h4 className='mb-0'>
                        <LuComponent className='mr-2' />
                        Registro de Componente</h4>
                </div>
                <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label htmlFor='tipoComponente' className='control-label'>
                                Tipo de Componente
                            </label>
                            <div className='input-group'>
                                <div className='input-group-prepend'>
                                    <span className='input-group-text'>
                                        <FaBars />
                                    </span>
                                </div>
                                <select
                                    className='form-control'
                                    id='tipoComponente'
                                    value={tipoComponente}
                                    onChange={(a) => setTipoComponente(a.target.value)}
                                    required
                                >
                                    <option value="">Seleccione una opción</option>
                                    <option value='Monitor'>Monitor</option>
                                    <option value='Mouse'>Mouse</option>
                                    <option value='Teclado'>Teclado</option>
                                    <option value='Teléfono IP'>Teléfono IP</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label>Marca</label>
                            <div className='input-group'>
                                <div className='input-group-prepend'>
                                    <span className='input-group-text'><FaTrademark /></span>
                                </div>
                                <input type='text' className='form-control' value={marcaComponente} onChange={(e) => setMarcaComponente(e.target.value)} required />
                            </div>
                        </div>
                        {tipoComponente === 'Monitor' && (
                            <div className='form-group'>
                                <label>Modelo del Monitor</label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'><BsDisplay /></span>
                                    </div>
                                    <input type='text' className='form-control' value={modeloMonitor} onChange={(e) => setModeloMonitor(e.target.value)} required />
                                </div>
                            </div>
                        )}
                        {tipoComponente === 'Teléfono IP' && (
                            <div className='form-group'>
                                <label>Modelo del Teléfono</label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'><BsPhone /></span>
                                    </div>
                                    <input type='text' className='form-control' value={modeloTelefono} onChange={(e) => setModeloTelefono(e.target.value)} required />
                                </div>
                            </div>
                        )}
                        {tipoComponente === 'Teclado' && (
                            <div className='form-group'>
                                <label>Idioma del Teclado</label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'><BsKeyboard /></span>
                                    </div>

                                    {/* <input type='text' className='form-control' value={idiomaTeclado} onChange={(e) => setIdiomaTeclado(e.target.value)} required /> */}
                                    <select className='form-control'
                                        id='idiomaTeclado'
                                        value={idiomaTeclado}
                                        onChange={(a) => setIdiomaTeclado(a.target.value)}
                                        required
                                    >
                                        <option value=''>Seleccione una opcion</option>
                                        <option value='Español'>Español</option>
                                        <option value='Inglés'>Inglés</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className='d-flex justify-content-between mt-4'>
                            <button type='button' className='btn btn-outline-dark' onClick={handleCancel}>Cancelar</button>
                            <button type='submit' className='btn btn-success' disabled={isLoading}>
                                {isLoading ? (
                                    <span>
                                        <span
                                            className='spinner-border spinner-border-sm mr-2'
                                            role='status'
                                            aria-hidden='true'
                                        ></span>
                                        Procesando...
                                    </span>
                                ) : (
                                    <span>
                                        <FaPaperPlane className='mr-2' />
                                        Registrar Componente
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrarComponentes;
