import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUser, FaPaperPlane, FaTimes, FaBuilding, FaUserTie } from 'react-icons/fa';
import { FaBuildingUser } from "react-icons/fa6";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/RegistrarUsuario.css'; 

const RegistrarUsuario = () => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [area, setArea] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("jwt"); // Recupera el token almacenado
      const usuarioResponse = await axios.post(
        'https://backendsistemainventario.onrender.com/api/usuarios/RegistrarUsuario',
        {
          NombreUsuario: nombreUsuario,
          Area: area,
          Departamento: departamento
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` // Envía el token en la cabecera
          }
        }
      );

      console.log('Respuesta de la API de Usuarios:', usuarioResponse.data);

      // Limpiar los campos del formulario
      setNombreUsuario('');
      setArea('');
      setDepartamento('');

      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado exitosamente.',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al enviar los datos:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar el usuario. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    navigate("/usuarios");
  };

  return (
    <div className="registro-container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-light px-3 py-2 rounded">
          <li className="breadcrumb-item">
            <span
              style={{ cursor: "pointer", color: "#007bff" }}
              onClick={() => navigate("/usuarios")}
            >
              Usuarios
            </span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Registro
          </li>
        </ol>
      </nav>

      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <FaUserTie className="mr-2" /> Registro de Usuario
          </h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label htmlFor="nombre" className="control-label">
                    Nombre del Usuario
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      placeholder="Ingrese el nombre completo"
                      value={nombreUsuario}
                      onChange={(e) => setNombreUsuario(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="area" className="control-label">
                     Área
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <FaBuilding />
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="area"
                      placeholder="Ingrese el área"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="departamento" className="control-label">
                    Departamento
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <FaBuildingUser />
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="departamento"
                      placeholder="Ingrese el departamento"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions mt-4">
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={handleCancel}
                >
                  <FaTimes className="mr-2" /> Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </span>
                  ) : (
                    <span>
                      <FaPaperPlane className="mr-2" /> Registrar Usuario
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

export default RegistrarUsuario;