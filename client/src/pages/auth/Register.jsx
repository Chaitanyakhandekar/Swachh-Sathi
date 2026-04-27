import React from 'react'
import { userApi } from '../../api/user.api'
import { Zap, User, AtSign, Mail, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Register() {

const navigate = useNavigate()

    const [user, setUser] = React.useState({
        name: "",
        username: "",
        email: "",
        password: ""
    })

    const handleUserChange = (e) => {
        setUser((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const register = async (e) => {
        e.preventDefault();
        console.log("Registering user:", user);
        const response = await userApi.registerUser(user);
        console.log("Registration response:", response);
        if(response.success){
            navigate("/login")
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Sora', sans-serif; box-sizing: border-box; }

                .reg-input:focus {
                    border-color: rgba(99,102,241,0.5) !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
                }

                .reg-input::placeholder { color: #4a4e6a; }

                .reg-btn:hover {
                    box-shadow: 0 6px 24px rgba(99,102,241,0.5) !important;
                    transform: translateY(-1px);
                }

                .reg-btn:active { transform: scale(0.98); }

                .float-icon { animation: float 3s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }

                .fade-up {
                    animation: fadeUp 0.5s ease both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .sidebar-accent::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #6366f1, transparent);
                    opacity: 0.7;
                }
            `}</style>

            {/* Full page background */}
            <div className="min-h-screen w-full bg-[#0a0b0f] flex items-center justify-center px-4 relative overflow-hidden">

                {/* Ambient orbs */}
                <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%)', filter: 'blur(80px)' }} />
                <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)', filter: 'blur(80px)' }} />

                {/* Card */}
                <div className="sidebar-accent fade-up relative w-full max-w-md bg-[#0e1018] border border-white/[0.06] rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-col items-center pt-10 pb-6 px-8">
                        <div
                            className="float-icon flex items-center justify-center w-12 h-12 rounded-[14px] mb-4"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}
                        >
                            <Zap size={22} color="#fff" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#f1f2f7] tracking-tight">Create an account</h1>
                        <p className="text-sm text-[#4a4e6a] mt-1.5">Join and start messaging instantly</p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.06] mx-8" />

                    {/* Form */}
                    <form className="flex flex-col gap-3.5 px-8 pt-6 pb-8" onSubmit={register}>

                        {/* Name */}
                        <div className="relative">
                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4e6a] pointer-events-none" />
                            <input
                                className="reg-input w-full bg-[#1a1d28] border border-white/[0.06] rounded-[12px] py-3 pl-10 pr-4 text-[#f1f2f7] text-sm outline-none transition-all duration-200"
                                type="text"
                                placeholder="Enter your name"
                                name="name"
                                value={user.name}
                                onChange={handleUserChange}
                            />
                        </div>

                        {/* Username */}
                        <div className="relative">
                            <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4e6a] pointer-events-none" />
                            <input
                                className="reg-input w-full bg-[#1a1d28] border border-white/[0.06] rounded-[12px] py-3 pl-10 pr-4 text-[#f1f2f7] text-sm outline-none transition-all duration-200"
                                type="text"
                                placeholder="Enter your username"
                                name="username"
                                value={user.username}
                                onChange={handleUserChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4e6a] pointer-events-none" />
                            <input
                                className="reg-input w-full bg-[#1a1d28] border border-white/[0.06] rounded-[12px] py-3 pl-10 pr-4 text-[#f1f2f7] text-sm outline-none transition-all duration-200"
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
                                className="reg-input w-full bg-[#1a1d28] border border-white/[0.06] rounded-[12px] py-3 pl-10 pr-4 text-[#f1f2f7] text-sm outline-none transition-all duration-200"
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
                            className="reg-btn w-full py-3 mt-2 rounded-[12px] text-white text-sm font-semibold tracking-wide border-none cursor-pointer transition-all duration-200"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px_14px rgba(99,102,241,0.4)' }}
                            onClick={register}
                        >
                            Create Account
                        </button>

                        {/* Footer link */}
                        <p className="text-center text-xs text-[#4a4e6a] mt-1">
                            Already have an account?{' '}
                            <a href="/login" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors duration-150 font-medium">
                                Sign in
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Register