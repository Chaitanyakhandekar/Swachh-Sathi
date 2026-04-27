import React from 'react'
import { userAuthStore } from '../../store/userStore'
import Login from '../../pages/auth/Login'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({children}) {

    const {user} = userAuthStore()
 
    
    if(!user){
        return <Navigate to="/login" replace />
    }

    return children;
  
}

export default ProtectedRoute