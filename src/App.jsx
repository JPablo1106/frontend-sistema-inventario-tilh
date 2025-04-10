import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Layout, theme, Dropdown, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { FaUserCircle } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import MenuList from './components/MenuList';
import Dashboard from './components/Dashboard';
import Usuarios from './components/usuarios/Usuarios';
import RegistrarUsuario from './components/usuarios/RegistrarUsuario';
import ActualizarUsuario from './components/usuarios/ActualizarUsuario';
import Equipos from './components/equipos/Equipos';
import RegistrarEquipo from './components/equipos/RegistrarEquipo';
import EquiposSeguridad from './components/equipos-seguridad/EquiposSeguridad';
import RegistrarEquipoSeg from './components/equipos-seguridad/RegistrarEquipoSeg';
import RegistrarComponentes from './components/componentes/RegistrarComponentes';
import RegistrarAsignacion from './components/asignaciones/RegistrarAsignacion';
import ComponentesTelefono from './components/componentes/ComponentesTelefono';
import ComponentesTeclados from './components/componentes/ComponentesTeclados';
import ComponentesMonitores from './components/componentes/ComponentesMonitores';
import ComponentesMouse from './components/componentes/ComponentesMouse';
import Asignaciones from './components/asignaciones/Asignaciones';
import ActualizarAsignacion from './components/asignaciones/ActualizarAsignacion';

const { Header, Sider, Content } = Layout;

export default function App() {
    const [collapsed, setCollapsed] = useState(true);
    const navigate = useNavigate();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Validar si el usuario está logueado. Si no, redirigir a login
    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            // Redirigir y reemplazar el historial de navegación
            navigate("/", { replace: true });
        }
    }, [navigate]);

    // Obtener el nombre de usuario desde localStorage
    const nombreAdmin = localStorage.getItem("nombreAdmin") || "usuario";

    // Manejo de cierre de sesión
    const handleLogout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        const jwt = localStorage.getItem("jwt");

        if (!refreshToken || !jwt) {
            console.error("No hay token disponible");
            localStorage.clear();
            navigate("/", { replace: true });
            return;
        }

        try {
            await axios.post(
                "https://backendsistemainventario.onrender.com/api/Administrador/Logout", // Reemplaza con la URL real de tu API
                { refreshToken },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            // Limpiar el localStorage y redirigir
            localStorage.clear();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // Limpiar localStorage incluso si la petición falla
            localStorage.clear();
            navigate("/", { replace: true });
        }
    };

    // Menú desplegable del usuario
    const userMenu = (
        <Menu>
            <Menu.Item key="1" disabled>
                ¡Hola, {nombreAdmin}!
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="2" onClick={handleLogout}>
                Cerrar Sesión
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout>
            <Sider
                collapsed={collapsed}
                collapsible
                trigger={null}
                theme='dark'
                className='sidebar'
            >
                <Logo />
                <MenuList darkTheme='dark' />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: "0 16px",
                        background: colorBgContainer,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <Button
                        type='text'
                        className='toggle'
                        onClick={() => setCollapsed(!collapsed)}
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    />
                    {/* Icono de usuario con menú desplegable */}
                    <Dropdown overlay={userMenu} trigger={['click']}>
                        <FaUserCircle size={24} style={{ cursor: "pointer" }} />
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                        <Route path="/usuarios/registro-usuario" element={<RegistrarUsuario />} />
                        <Route path="/usuarios/actualizar-usuario/:idUsuario" element={<ActualizarUsuario />} />
                        <Route path="/equipos" element={<Equipos />} />
                        <Route path='/equipos/registro-equipo' element={<RegistrarEquipo />} />
                        <Route path='/equipos-seguridad' element={<EquiposSeguridad />} />
                        <Route path='/equipos-seguridad/registro-equipo-seguridad' element={<RegistrarEquipoSeg />} />
                        <Route path='/componentes/registro-componente' element={<RegistrarComponentes />} />
                        <Route path='/componentes/telefonos' element={<ComponentesTelefono />} />
                        <Route path='/componentes/teclados' element={<ComponentesTeclados />} />
                        <Route path='/componentes/monitores' element={<ComponentesMonitores />} />
                        <Route path='/componentes/mouse' element={<ComponentesMouse />} />
                        <Route path='/asignaciones/registro-asignacion' element={<RegistrarAsignacion />} />
                        <Route path='/asignaciones' element={<Asignaciones />} />
                        <Route path='/asignaciones/actualizar-asignacion/:id' element={<ActualizarAsignacion />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
}
