import React from 'react'
import Header from '../common/Header'
import { Outlet } from 'react-router-dom'
import Footer from '../common/Footer'

const Userlayout = () => {
  return (
    <>
      {/*Header*/}
      <Header />
      {/*Main Content*/}
      <main>
        <Outlet/>
      </main>
      {/*Footer*/} 
      <Footer/>      
    </>
  )
}
export default Userlayout