import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaTrademark, } from 'react-icons/fa';
import { MdElectricMeter, MdElectricalServices } from "react-icons/md";
import { BsMusicPlayerFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';

const RegistrarEquipoSeg = () => {
    const navigate = useNavigate();
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [capacidad, setCapacidad] = useState('');
    const [tipo, setTipo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem("jwt");
            const equipoSegResponse = await axios.post(
                'https://backendsistemainventario.onrender.com/api/EquiposSeguridad/RegistrarEquipoSeguridad',
                {
                    marca,
                    modelo,
                    capacidad,
                    tipo
                },
                {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Respuesta de la API Equipoe de Seguridad', equipoSegResponse.data);

            //
            setMarca('');
            setModelo('');
            setCapacidad('');
            setTipo('');

            Swal.fire({
                icon: 'success',
                title: 'Equipo de Seguridad registrado exitosamente.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.log('Error al enviar los datos: ', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Nose pudo registrar el equipo de seguridad. Por favor intenta de nuevo.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/equipos-seguridad');
    };

    return (
        <div className='equipos-container'>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-light px-3 py-2 rounded">
                    <li className="breadcrumb-item active" aria-current="page">
                        <h5>
                            UPS
                        </h5>
                    </li>
                </ol>
            </nav>
            <div className='card shadow-sm bordeo-0'>
                <div className='card-header bg-warning text-white'>
                    <h4 className='mb-0'>
                        Registro de Equipo de Seguridad (UPS)
                    </h4>
                </div>
                <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='row'>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label htmlFor='marca' className='control-label'>
                                        Marca del equipo de seguridad
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
                                            placeholder='Ingrese la marca del equipo de seguridad'
                                            value={marca}
                                            onChange={(e) => setMarca(e.target.value)}
                                            required />
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label htmlFor='modelo' className='control-label'>
                                        Modelo del equipo de seguridad
                                    </label>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'>
                                                <BsMusicPlayerFill />
                                            </span>
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='modelo'
                                            placeholder='Ingrese el modelo del equipo de seguridad'
                                            value={modelo}
                                            onChange={(e) => setModelo(e.target.value)}
                                            required />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label htmlFor='capacidad' className='control-label'>
                                        Capacidad de voltaje
                                    </label>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'>
                                                <MdElectricMeter />
                                            </span>
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='capacidad'
                                            placeholder='Ingrese la capacidad del equipo de seguridad'
                                            value={capacidad}
                                            onChange={(e) => setCapacidad(e.target.value)}
                                            required />
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label htmlFor='tipo' className='control-label'>
                                        Tipo del equipo de seguridad
                                    </label>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'>
                                                <MdElectricalServices />
                                            </span>
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='tipo'
                                            placeholder='Ingrese el tipo del equipo de seguridad'
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value)}
                                            required />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='form-actions mt-4'>
                            <div className='d-flex justify-content-between'>
                                <button
                                    type='button'
                                    className='btn btn-outline-danger btn-lg'
                                    onClick={handleCancel}>
                                    Cancelar
                                </button>
                                <button
                                    type='submit'
                                    className='btn btn-primary btn-lg'
                                    disabled={isLoading}>
                                    {isLoading ? (
                                        <span>
                                            <span className='spinner-border spinner-border-sm mr2'
                                                role='status'
                                                aria-hidden='true'></span>
                                            Procesando...
                                        </span>
                                    ) : (
                                        <span>
                                            <FaPaperPlane className='mr-2' />
                                            Registrar UPS
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

export default RegistrarEquipoSeg;