import React from 'react'
//import { useState } from 'react'
import { Layout } from 'antd'
import Logo from './Logo';
import MenuList from './MenuList';


const {Header, Sider} = Layout;
export default function Sidebar() {
  return (
    <>
    <Layout>
        <Sider className='sidebar'>
            <Logo/>
            <MenuList/>
        </Sider>
    </Layout>
    </>
  )
}
