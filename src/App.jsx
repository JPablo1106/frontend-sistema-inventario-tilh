import React, { useState } from 'react';
import { Button, Layout, theme, Dropdown, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { FaUserCircle } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import MenuList from './components/MenuList';
import Dashboard from './components/Dashboard';
import Usuarios from './components/usuarios/Usuarios';
import RegistrarUsuario from './components/usuarios/RegistrarUsuario';
import EditarUsuario from './components/usuarios/EditarUsuario';
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

const { Header, Sider, Content } = Layout;

export default function App() {
    const [collapsed, setCollapsed] = useState(true);
    const navigate = useNavigate();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Obtener el nombre de usuario desde localStorage
    const nombreAdmin = localStorage.getItem("nombreAdmin") || "Usuario";

    // Manejo de cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("nombreAdmin");
        localStorage.removeItem("usuario");
        navigate("/");
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
            <Sider collapsed={collapsed}
                collapsible
                trigger={null}
                theme='dark' className='sidebar'>
                <Logo />
                <MenuList darkTheme='dark' />
            </Sider>
            <Layout>
                <Header style={{ padding: "0 16px", background: colorBgContainer, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button type='text'
                        className='toggle'
                        onClick={() => setCollapsed(!collapsed)}
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} />

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
                        <Route path="/usuarios/editar-usuario" element={<EditarUsuario />} />
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
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
}
