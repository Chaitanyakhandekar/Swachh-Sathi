import React,{useEffect} from 'react'
import {io} from "socket.io-client"
import {Routes,Route} from "react-router-dom"
import Register from './pages/auth/Register.jsx'
import Login from './pages/auth/Login.jsx'
import { useContext } from 'react'
import { authContext } from './context/AuthProvider.jsx'
import { userApi } from './api/user.api.js'
import { userAuthStore } from './store/userStore.js'
import ProtectedRoute from './components/guards/ProtectedRoute.jsx'
import ProtectedRouteAuth from './components/guards/ProtectedRouteAuth.jsx'
import { socket } from './socket/socket.js'
import { socketEvents } from './constants/socketEvents.js'
import AIChatbot from './components/swachh/AIChatbot.jsx'

// Swachh Sathi Pages
import Home from './pages/swachh/Home.jsx'
import NearbyEvents from './pages/swachh/NearbyEvents.jsx'
import EventDetails from './pages/swachh/EventDetails.jsx'
import EventCheckIn from './pages/swachh/EventCheckIn.jsx'
import Profile from './pages/swachh/Profile.jsx'
import Leaderboard from './pages/swachh/Leaderboard.jsx'
import CreateEvent from './pages/swachh/CreateEvent.jsx'
import MyEvents from './pages/swachh/MyEvents.jsx'
import AdminDashboard from './pages/swachh/AdminDashboard.jsx'
import NotificationsPage from './pages/swachh/NotificationsPage.jsx'
import WasteReportPage from './pages/swachh/WasteReportPage.jsx'

function App() {

  const context = useContext(authContext);
  const setUser = userAuthStore().setUser
  let user;

  const authMe = async ()=>{
     user = await userApi.authMe();
    if(user.success){
      context.setUser(user.data)
      setUser(user.data)
    }
  }

  useEffect(()=>{
    authMe();
  },[])

  return (
   <>
     <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
       * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
     `}</style>
     <Routes>

      {/* Auth Routes */}
      <Route path='/register' element={<ProtectedRouteAuth><Register /></ProtectedRouteAuth>}/>
      <Route path='/login' element={<ProtectedRouteAuth><Login /></ProtectedRouteAuth>}/>

      {/* Swachh Sathi Routes */}
      <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
      <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
      <Route path='/nearby' element={<ProtectedRoute><NearbyEvents /></ProtectedRoute>}/>
      <Route path='/event/:eventId' element={<ProtectedRoute><EventDetails /></ProtectedRoute>}/>
      <Route path='/event/:eventId/checkin' element={<ProtectedRoute><EventCheckIn /></ProtectedRoute>}/>
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
      <Route path='/leaderboard' element={<ProtectedRoute><Leaderboard /></ProtectedRoute>}/>
      <Route path='/create-event' element={<ProtectedRoute><CreateEvent /></ProtectedRoute>}/>
      <Route path='/my-events' element={<ProtectedRoute><MyEvents /></ProtectedRoute>}/>
      <Route path='/admin' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
      <Route path='/notifications' element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}/>
      <Route path='/waste-reports' element={<ProtectedRoute><WasteReportPage /></ProtectedRoute>}/>

     </Routes>
     <AIChatbot />
   </>
  )
}

export default App