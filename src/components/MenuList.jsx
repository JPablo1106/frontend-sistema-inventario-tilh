import { Menu } from 'antd';
import React from 'react';
import {
  UserOutlined,
  BarsOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { FaKeyboard, FaPlus } from "react-icons/fa";
import { RxComponent2 } from "react-icons/rx";
import { BsPcDisplay, BsTelephone, BsFilePlusFill } from 'react-icons/bs';
import { GiElectric } from "react-icons/gi";
import { MdOutlineMonitor, MdOutlineMouse } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';

const MenuList = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene la ruta actual

  const items = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Inicio',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/usuarios',
      icon: <UserOutlined />,
      label: 'Usuarios',
      onClick: () => navigate('/usuarios'),
    },
    {
      key: '/equipos',
      icon: <BsPcDisplay />,
      label: 'Equipos',
      onClick: () => navigate('/equipos'),
    },
    {
      key: '/componentes/monitores',
      icon: <MdOutlineMonitor />,
      label: 'Monitores',
      onClick: () => navigate('/componentes/monitores'),
    },
    {
      key: 'componentes',
      icon: <RxComponent2 />,
      label: 'Componentes',
      children: [
        {
          key: '/componentes/teclados',
          icon: <FaKeyboard />,
          label: 'Teclados',
          onClick: () => navigate('/componentes/teclados')
        },
        {
          key: '/componentes/mouse',
          icon: <MdOutlineMouse />,
          label: 'Mouse',
          onClick: () => navigate('/componentes/mouse'),
        },
      ],
    },
    {
      key: '/componentes/telefonos',
      icon: <BsTelephone />,
      label: 'Teléfonos',
      onClick: () => navigate('/componentes/telefonos'),
    },
    {
      key: '/equipos-seguridad',
      icon: <GiElectric />,
      label: 'UPS',
      onClick: () => navigate('/equipos-seguridad'),
    },
    {
      key: 'asignaciones',
      icon: <BsFilePlusFill />,
      label: 'Asignaciones',
      children: [
        {
          key: '/asignaciones',
          icon: <BarsOutlined />,
          label: 'Ver Asignaciones',
          onClick: () => navigate('/asignaciones')
        },
        {
          key: '/asignaciones/registro-asignacion',
          icon: <FaPlus />,
          label: 'Agregar',
          onClick: () => navigate('/asignaciones/registro-asignacion'),
        },
      ],
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      className="menu-bar"
      selectedKeys={[location.pathname]}
      items={items}
    />
  );
};

export default MenuList;
