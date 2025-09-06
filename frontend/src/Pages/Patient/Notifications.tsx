import React from 'react'
import Sidebar from "../../Components/Sidebar"

const Notifications: React.FC = () => {
  return (
    <>
      <div className='h-screen bg-cover bg-center bg-[#D8EFED] text-white relative poppins'>
        <Sidebar />
        <div className='relative z-10 lg:ml-80 p-4 lg:p-6 min-h-screen'>
        </div>
      </div>
    </>
  )
}

export default Notifications
