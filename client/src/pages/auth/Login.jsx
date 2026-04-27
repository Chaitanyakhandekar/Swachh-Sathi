import React from 'react'
import { userApi } from '../../api/user.api'
import { useContext } from 'react'
import { authContext } from '../../context/AuthProvider.jsx'
import { useNavigate } from 'react-router-dom'
import { userAuthStore } from '../../store/userStore.js'
import { socket } from '../../socket/socket.js'
import { socketEvents } from '../../constants/socketEvents.js'
import { Zap, Mail, Lock } from 'lucide-react'

function Login() {

    const [user, setUser] = React.useState({
        email: "",
        password: ""
    })
    const user1 = userAuthStore().user
    const setUser1 = userAuthStore().setUser
    const authData = useContext(authContext);
    const navigate = useNavigate()

    const handleUserChange = (e) => {
        setUser((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const login = async (e) => {
        e.preventDefault();
        console.log("Logging in user:", user);
        const response = await userApi.loginUser(user);
        if (response.success) {
            authData.login(response.data);
            setUser1(response.data)
            console.log("User set in context:", response.data);
            socket.emit(socketEvents.USER_LOGGED_IN)
            navigate('/home')
        }
        console.log("Login response:", response);
    }

    return (
        <div className="min-h-screen w-full bg-[#0a0b0f] flex items-center justify-center px-4 relative overflow-hidden">

            {/* Ambient orbs */}
            <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none bg-indigo-500/10 blur-[80px]" />
            <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none bg-violet-500/[0.08] blur-[80px]" />

            {/* Card */}
            <div className="relative w-full max-w-md bg-[#0e1018] border border-white/[0.06] rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-[fadeUp_0.5s_ease_both]">

                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

                {/* Header */}
                <div className="flex flex-col items-center pt-10 pb-6 px-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-[14px] mb-4 bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_4px_20px_rgba(99,102,241,0.45)] animate-[float_3s_ease-in-out_infinite]">
                        <Zap size={22} color="#fff" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#f1f2f7] tracking-tight">Welcome back</h1>
                    <p className="text-sm text-[#4a4e6a] mt-1.5">Sign in to continue messaging</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mx-8" />

                {/* Form */}
                <form className="flex flex-col gap-3.5 px-8 pt-6 pb-8" onSubmit={login}>

                    {/* Email */}
                    <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4e6a] pointer-events-none" />
                        <input
                            className="w-full bg-[#1a1d28] border border-white/[0.06] rounded-[12px] py-3 pl-10 pr-4 text-[#f1f2f7] text-sm outline-none transition-all duration-200 placeholder:text-[#4a4e6a] focus:border-indigo-500/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={user.email}
                            onChange={handleUserChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4e6a] pointer-events-none" />
                        <input
                            className="w-full bg-[#1a1d28] border border-white/[0.06] rounded-[12px] py-3 pl-10 pr-4 text-[#f1f2f7] text-sm outline-none transition-all duration-200 placeholder:text-[#4a4e6a] focus:border-indigo-500/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                            type="password"
                            placeholder="Enter your password"
                            name="password"
                            value={user.password}
                            onChange={handleUserChange}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 rounded-[12px] text-white text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px active:scale-[0.98]"
                        onClick={login}
                    >
                        Sign In
                    </button>

                    {/* Footer link */}
                    <p className="text-center text-xs text-[#4a4e6a] mt-1">
                        Don't have an account?{' '}
                        <a href="/register" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors duration-150 font-medium">
                            Create one
                        </a>
                    </p>
                </form>
            </div>

            {/* Tailwind keyframe definitions via arbitrary values aren't possible — add these to your tailwind.config.js:
                float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } }
                fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } }
            */}
        </div>
    )
}

export default Login