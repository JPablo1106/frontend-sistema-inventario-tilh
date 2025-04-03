import React, { useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// Íconos que usaré de ejemplo
import { FaLaptop, FaPaperPlane, FaTimes, FaTrademark, FaMicrochip, FaMemory, FaHdd, FaClone } from "react-icons/fa";
import { BsPcDisplay } from "react-icons/bs";
import '../../styles/RegistrarEquipo.css'; // Archivo CSS personalizado

const RegistrarEquipo = () => {
    const navigate = useNavigate();
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [tipoEquipo, setTipoEquipo] = useState('');
    const [velocidadProcesador, setVelocidadProcesador] = useState('');
    const [tipoProcesador, setTipoProcesador] = useState('');
    const [memoriaRam, setMemoriaRam] = useState('');
    const [tipoMemoriaRam, setTipoMemoriaRam] = useState('');
    const [marcaDisco, setMarcaDisco] = useState('');
    const [modeloDisco, setModeloDisco] = useState('');
    const [c, setC] = useState('');
    const [d, setD] = useState('');
    const [e, setE] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (a) => {
        a.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem("jwt");
            const equipoResponse = await axios.post(
                'https://backendsistemainventario.onrender.com/api/equipos/RegistrarEquipo',
                {
                    marca,
                    modelo,
                    tipoEquipo,
                    velocidadProcesador,
                    tipoProcesador,
                    memoriaRam,
                    tipoMemoriaRam,
                    marcaDisco,
                    modeloDisco,
                    c: parseInt(c, 10) || 0,
                    d: parseInt(d, 10) || 0,
                    e: parseInt(e, 10) || 0,
                },
                {
                    headers: {
                        Accept: "*/*",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Respuesta de la API Equipos', equipoResponse.data);

            //Limpiamos los campos del formulario
            setMarca('');
            setModelo('');
            setTipoEquipo('');
            setVelocidadProcesador('');
            setTipoProcesador('');
            setMemoriaRam('');
            setTipoMemoriaRam('');
            setMarcaDisco('');
            setModeloDisco('');
            setC('');
            setD('');
            setE('');

            Swal.fire({
                icon: 'success',
                title: 'Equipo registrado exitosamente.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Error al enviar los datos: ', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo registrar el equipo. Por favor, intenta de nuevo.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/equipos');
    };

    return (
        <div className='equipos-container'>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-light px-3 py-2 rounded">
                    <li className="breadcrumb-item active" aria-current="page">
                        <h5>
                            Equipos
                        </h5>
                    </li>
                </ol>
            </nav>

            <div className='card shadow-sm border-0'>
                <div className='card-header bg-dark text-white'>
                    <h4 className='mb-0'>
                        <BsPcDisplay className='mr-2' />
                        Registro de Equipo
                    </h4>
                </div>

                <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                        {/* Fila 1 */}
                        <div className='row'>
                            {/* Marca */}
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label htmlFor='marca' className='control-label'>
                                        Marca del equipo
                                    </label>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'>
                                                <FaTrademark />
                                            </span>
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='marca'
                                            placeholder='Ingrese la marca del equipo'
                                            value={marca}
                                            onChange={(a) => setMarca(a.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modelo */}
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label htmlFor='modelo' className='control-label'>
                                        Modelo del equipo
                                    </label>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'>
                                                <FaLaptop />
                                            </span>
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='modelo'
                                            placeholder='Ingrese el modelo del equipo'
                                            value={modelo}
                                            onChange={(a) => setModelo(a.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fila 2 */}
                        <div className='row'>
                            {/* Tipo de equipo */}
                            <div className='form-group col-md-4'>
                                <label htmlFor='tipoEquipo' className='control-label'>
                                    Tipo de equipo
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <BsPcDisplay />
                                        </span>
                                    </div>
                                    <select
                                        className='form-control'
                                        id='tipoEquipo'
                                        value={tipoEquipo}
                                        onChange={(a) => setTipoEquipo(a.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Escritorio">Escritorio</option>
                                        <option value="Laptop">Laptop</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tipo de procesador */}
                            <div className='form-group col-md-4'>
                                <label htmlFor='tipoProcesador' className='control-label'>
                                    Tipo del procesador
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaMicrochip />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='tipoProcesador'
                                        placeholder='Ingrese el tipo de procesador'
                                        value={tipoProcesador}
                                        onChange={(a) => setTipoProcesador(a.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Velocidad del procesador */}
                            <div className='form-group col-md-4'>
                                <label htmlFor='velocidadProcesador' className='control-label'>
                                    Velocidad del procesador
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaMicrochip />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='velocidadProcesador'
                                        placeholder='Ingrese la velocidad del procesador'
                                        value={velocidadProcesador}
                                        onChange={(a) => setVelocidadProcesador(a.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subtítulo Almacenamiento */}
                        <div className='form-actions mt-4'>
                            <h6 className='mb-0'>- Almacenamiento -</h6>
                        </div>
                        <br />

                        {/* Fila 3 (RAM y disco) */}
                        <div className='row'>
                            {/* Capacidad de RAM */}
                            <div className='form-group col-md-3'>
                                <label htmlFor='memoriaRam' className='control-label'>
                                    Capacidad de memoria RAM
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaMemory />
                                        </span>
                                    </div>
                                    <select
                                        className='form-control'
                                        id='memoriaRam'
                                        value={memoriaRam}
                                        onChange={(a) => setMemoriaRam(a.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="4 GB">4 GB</option>
                                        <option value="8 GB">8 GB</option>
                                        <option value="16 GB">16 GB</option>
                                        <option value="32 GB">32 GB</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tipo de RAM */}
                            <div className='form-group col-md-3'>
                                <label htmlFor='tipoMemoriaRam' className='control-label'>
                                    Tipo de memoria RAM
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaMemory />
                                        </span>
                                    </div>
                                    <select
                                        className='form-control'
                                        id='tipoMemoriaRam'
                                        value={tipoMemoriaRam}
                                        onChange={(a) => setTipoMemoriaRam(a.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="DDR-4">DDR-4</option>
                                        <option value="DDR-5">DDR-5</option>
                                    </select>
                                </div>
                            </div>

                            {/* Marca del disco */}
                            <div className='form-group col-md-3'>
                                <label htmlFor='marcaDisco' className='control-label'>
                                    Marca del disco
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaHdd />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='marcaDisco'
                                        placeholder='Ingrese la marca del disco'
                                        value={marcaDisco}
                                        onChange={(a) => setMarcaDisco(a.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Modelo del disco */}
                            <div className='form-group col-md-3'>
                                <label htmlFor='modeloDisco' className='control-label'>
                                    Modelo del disco
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaHdd />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='modeloDisco'
                                        placeholder='Ingrese el modelo del disco'
                                        value={modeloDisco}
                                        onChange={(a) => setModeloDisco(a.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fila 4 (particiones) */}
                        <div className='row'>
                            {/* Partición C */}
                            <div className='form-group col-md-4'>
                                <label htmlFor='c' className='control-label'>
                                    Partición C
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaClone />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='c'
                                        placeholder='Ingrese la cantidad en C'
                                        value={c}
                                        onChange={(a) => setC(a.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Partición D */}
                            <div className='form-group col-md-4'>
                                <label htmlFor='d' className='control-label'>
                                    Partición D
                                    <span className='text-primary'> (Si aplica)</span>
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaClone />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='d'
                                        placeholder='Ingrese la cantidad en D'
                                        value={d}
                                        onChange={(a) => setD(a.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Partición E */}
                            <div className='form-group col-md-4'>
                                <label htmlFor='e' className='control-label'>
                                    Partición E
                                    <span className='text-primary'> (Si aplica)</span>
                                </label>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FaClone />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='e'
                                        placeholder='Ingrese la cantidad en E'
                                        value={e}
                                        onChange={(a) => setE(a.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className='form-actions mt-4'>
                            <div className='d-flex justify-content-between'>
                                <button
                                    type='button'
                                    className='btn btn-outline-danger btn-lg'
                                    onClick={handleCancel}
                                >
                                    <FaTimes className='mr-2' />
                                    Cancelar
                                </button>
                                <button
                                    type='submit'
                                    className='btn btn-primary btn-lg'
                                    disabled={isLoading}
                                >
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
                                            Registrar Equipo
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrarEquipo;
