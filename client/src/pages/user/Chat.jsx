import React, { useRef, useState } from 'react'
import ChatCard from '../../components/user/ChatCard.jsx'
import { useEffect } from 'react'
import { userApi } from '../../api/user.api.js'
import { useContext } from 'react'
import { authContext } from '../../context/AuthProvider.jsx'
import { socket } from '../../socket/socket.js'
import {
    MessageCircle,
    Send,
    MoveDown,
    ArrowDownCircleIcon,
    Search,
    Zap,
    Bell,
    User,
    Settings,
    Users,
    Plus,
    LogOut,
    X,
    ChevronRight,
    Reply,
    ImageIcon,
} from 'lucide-react'
import Swal from 'sweetalert2';
import Message from '../../components/message/Message.jsx'
import { messageApi } from '../../api/message.api.js'
import { useChatStore } from '../../store/useChatStore.js'
import { chatApi } from '../../api/chat.api.js'
import { userAuthStore } from '../../store/userStore.js'
import { socketEvents } from '../../constants/socketEvents.js'
import { useAssetsStore } from '../../store/useAssetsStore.js'
import FileUpload from '../../components/message/FileUpload.jsx'
import MediaPreview from '../../components/message/MediaPreview.jsx'
import SingleFilePreview from '../../components/message/SingleFilePreview.jsx'
import Profile from '../../components/user/Profile.jsx'
import CreateGroup from '../../components/user/CreateGroup.jsx'
import SettingsPanel from '../../components/user/Settings.jsx'
import ChatList from '../../components/user/ChatList.jsx'
import GroupInfo from '../../components/user/GroupInfo.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { useGroupChatStore } from '../../store/useGroupChatStore.js'

function Home() {

    const context = useContext(authContext);
    const [message, setMessage] = React.useState("")
    const [query, setQuery] = React.useState("")

    const [activePanel, setActivePanel] = useState(null)

    const { user } = userAuthStore()

    const users = useChatStore(state => state.userChats)
    const setUsers = useChatStore(state => state.setUserChats)

    const messages = useChatStore(state => state.userMessages)
    const addMessage = useChatStore(state => state.addMessage)
    const currentChatId = useChatStore(state => state.currentChatId)
    const userMessages = useChatStore().userMessages

    const {
        userSearch,
        setUserSearch,
        setChatUsersInfo,
        chatUsersInfo,
        emitedTyping,
        toogleEmitedTyping,
        onlineStatus,
        incrementNewMessagesCount,
        incrementNewMessagesCountByN,
        resetNewMessagesCount,
        mediaFiles,
        removeMessage,
        resetMediaFiles,
        setCurrentPreviewFile,
        currentPreviewFile,
        isGroupChat,
        isReplying,
        setIsReplying,
        messageBeingReplied,
        setMessageBeingReplied
    } = useChatStore()

     const {setGroupChat,groupChat,currentGroupParticipants,setCurrentGroupParticipants} = useGroupChatStore();

    const {
        scrollToBottomInChat,
        setScrollToBottomInChat
    } = useAssetsStore()

    const typingTimeoutRef = useRef(null);
    const paramChatId = useParams().id
    const isTypingRef = useRef(false);
    const messageEndRef = useRef(null);
    const chatContainerRef = useRef(null)
    const inputRef = useRef(null)
    const [isAtBottom, setIsAtBottom] = React.useState(true);
    const isMedia = mediaFiles[currentChatId || paramChatId]?.length > 0
    const [showSidebar, setShowSidebar] = useState(true)
    const [groupsOnly, setGroupsOnly] = useState(false)
    const navigate = useNavigate()

    const totalUnread = Object.values(chatUsersInfo).reduce((sum, c) => sum + (c?.newMessages || 0), 0)

    const togglePanel = (panel) => setActivePanel(prev => prev === panel ? null : panel)

    const loadUnreadMessages = (chats) => {
        chats.forEach((chat) => {
            incrementNewMessagesCountByN(chat._id, chat.unreadMessagesCount)
        })
    }

    const getAllUsers = async () => {
        const response = await chatApi.getUserChats();
        if (response.success) {
            setUsers(response.data);
            loadUnreadMessages(response.data)
            setChatUsersInfo(response.data)
            console.log("All users fetched:", response.data);
        }
    }

    const getConversationMessages = async (otherUserId) => {
        const messages = await messageApi.getConversation(otherUserId)
    }

    const handleCancelReply = () => {
        setIsReplying(false)
        setMessageBeingReplied(null)
    }

    const handleSend = async (e) => {
        e.preventDefault()
        console.log("Send button clicked");

        if (message.trim() === "" && !mediaFiles[currentChatId].length) {
            console.log("Returning Function HandleSend")
            return;
        }

        const tempId = `temp-${Date.now()}`

        addMessage(currentChatId, {
            _id: tempId,
            chatId: currentChatId,
            message: message.trim() !== "" ? message : "",
            sender: user._id,
            attachments: mediaFiles[currentChatId] || [],
            status: "uploading",
            createdAt: "2026-02-21T08:49:25.317Z",
            ...(isReplying && messageBeingReplied ? { replyTo: messageBeingReplied } : {})
        })

        setScrollToBottomInChat(true);

        // Clear reply state
        if (isReplying) handleCancelReply()

        const formData = new FormData()
        let uploadInfo;

        if (mediaFiles[currentChatId]?.length > 0) {
            mediaFiles[currentChatId].length > 0 && mediaFiles[currentChatId].forEach(image => {
                formData.append("images", image.file)
            })

            resetMediaFiles(currentChatId)

            uploadInfo = await messageApi.uploadImages(formData)

            console.log("Upload Info :: ", uploadInfo)

            if (!uploadInfo.success) {
                removeMessage(currentChatId, tempId)
                alert("Message Failed Please Try Again.")
            }
        }

        if (!socket) return

        if(isReplying && messageBeingReplied){
            socket.emit(socketEvents.MESSAGE_REPLY_SINGLE_CHAT, {
            message: message || "",
            attachments: uploadInfo?.data || [],
            receiver: context.currentChatUser._id,
            chatId: currentChatId || null,
            tempId: tempId,
            replyTo: messageBeingReplied || null
        }, (ack) => {
            console.log("Ack from server:", ack);
        })
        }
        else{
            socket.emit(socketEvents.NEW_MESSAGE, {
            message: message || "",
            attachments: uploadInfo?.data || [],
            receiver: context.currentChatUser._id,
            chatId: currentChatId || null,
            tempId: tempId,
           
        }, (ack) => {
            console.log("Ack from server:", ack);
        })
        }

        setMessage("")
    }

    const scrollToBottom = () => {
        const container = chatContainerRef.current;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    };

    // Auto-focus input when reply starts
    useEffect(() => {
        if (isReplying && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isReplying])

    useEffect(() => {
        getAllUsers();
        console.log("Media Files: ", mediaFiles[currentChatId]);

        const container = chatContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const atBottom =
                container.scrollTop + container.clientHeight >=
                container.scrollHeight - 5;
            setIsAtBottom(atBottom);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [])

    useEffect(() => {
        if (!isAtBottom) {
            scrollToBottom()
        }
    }, [setIsAtBottom])

    useEffect(() => {
       if(activePanel !== "newGroup"){
            setGroupsOnly(true)
       }else{
        setGroupsOnly(false)
       }

       switch(activePanel){
        case "newGroup":
            setGroupsOnly(false)
            break;
        default:
            setGroupsOnly(true)
            break;
        case "groupInfo":
            navigate(`/chat/group-info/${currentChatId}`)
        }
    }, [activePanel])

    useEffect(() => {
        console.log("Scroll to bottom in chat:", scrollToBottomInChat);
        if (scrollToBottomInChat) {
            scrollToBottom();
            setScrollToBottomInChat(false);
        }
    }, [scrollToBottomInChat])

    const searchUsers = async (query) => {
        setQuery(query);
        try {
            const response = await userApi.searchUsers(query);
            if (response.success) {
                setUserSearch(response.data);
                console.log("Search Users Response :", response.data);
            }
        } catch (error) {
            console.log("Error while searching users :", error);
        }
    }

    const handleTyping = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (!socket || !context.currentChatUser || !currentChatId) return;

        if (!isTypingRef.current) {
            socket.emit(socketEvents.TYPING, {
                chatId: currentChatId,
                isTyping: true,
            });
            isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit(socketEvents.TYPING, {
                chatId: currentChatId,
                isTyping: false,
            });
            isTypingRef.current = false;
        }, 2000);
    };

    const handleChatInfoClick = () =>{
        if(isGroupChat){
            setActivePanel("groupInfo")
        }
    }

    const NavIconBtn = ({ icon: Icon, panel, badge, tooltip }) => {
        const active = activePanel === panel
        return (
            <button
                onClick={() => togglePanel(panel)}
                className="relative flex items-center justify-center w-10 h-10 rounded-[13px] transition-all duration-200 group"
                style={{
                    background: active
                        ? 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.18))'
                        : 'transparent',
                    border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                    boxShadow: active ? '0 0 16px rgba(99,102,241,0.18)' : 'none'
                }}
            >
                <Icon size={18} color={active ? '#818cf8' : '#4a4e6a'} strokeWidth={2} />
                {badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-[18px] h-[18px] rounded-full text-[9px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        {badge > 9 ? '9+' : badge}
                    </span>
                )}
                <span className="absolute left-full ml-2.5 px-2 py-1 text-[11px] font-medium text-[#c4c6e7] bg-[#1a1d28] border border-white/[0.08] rounded-[8px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    {tooltip}
                </span>
            </button>
        )
    }

    // ── Reply preview strip ──────────────────────────────────────────
    const ReplyPreviewStrip = () => {
        if (!isReplying || !messageBeingReplied) return null

        const isOwn = messageBeingReplied.sender === user._id
        const hasAttachment = messageBeingReplied?.attachments?.length > 0
        const hasText = messageBeingReplied?.message?.trim()
        const senderLabel = isOwn ? 'You' : (context.currentChatUser?.username || 'Them')
        const thumbUrl = hasAttachment
            ? (messageBeingReplied.attachments[0]?.secure_url || messageBeingReplied.attachments[0]?.preview)
            : null
        const previewText = hasText
            ? messageBeingReplied.message
            : hasAttachment ? 'Photo' : ''

        return (
            <div
                className="flex items-center gap-2.5 px-4 py-2 border-t border-white/[0.05]"
                style={{ background: 'rgba(10,11,20,0.6)', animation: 'replyStripIn 0.18s cubic-bezier(0.16,1,0.3,1)' }}
            >
                {/* Left: indigo bar + icon + content */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0 rounded-[11px] px-3 py-2"
                    style={{
                        background: 'rgba(99,102,241,0.07)',
                        borderLeft: '3px solid #6366f1',
                    }}>

                    {/* Reply icon */}
                    <Reply size={12} color="#818cf8" style={{ transform: 'scaleX(-1)', flexShrink: 0 }} />

                    {/* Text */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[11px] font-semibold leading-none mb-[3px]" style={{ color: '#818cf8' }}>
                            {senderLabel}
                        </span>
                        <span className="text-[12px] truncate leading-snug" style={{ color: '#6b7280' }}>
                            {hasAttachment && (
                                <span className="inline-flex items-center gap-1 mr-1">
                                    <ImageIcon size={10} style={{ display: 'inline', color: '#818cf8' }} />
                                    {!hasText && 'Photo'}
                                </span>
                            )}
                            {hasText && previewText}
                        </span>
                    </div>

                    {/* Image thumbnail */}
                    {thumbUrl && (
                        <img
                            src={thumbUrl}
                            alt=""
                            className="w-9 h-9 rounded-[7px] object-cover flex-shrink-0"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                    )}
                </div>

                {/* Cancel */}
                <button
                    onClick={handleCancelReply}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-150"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <X size={12} color="#4a4e6a" />
                </button>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
                * { font-family: 'Sora', sans-serif; box-sizing: border-box; }

                .typing-dot { animation: blink 1.2s infinite; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink {
                    0%, 80%, 100% { opacity: 0.2; }
                    40% { opacity: 1; }
                }
                .online-pulse { animation: pulse-dot 2s infinite; }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.15); }
                }
                .float-icon { animation: float 3s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .fade-in-up { animation: fadeInUp 0.3s ease; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .slide-in-panel { animation: slideInPanel 0.22s cubic-bezier(0.16,1,0.3,1); }
                @keyframes slideInPanel {
                    from { opacity: 0; transform: translateX(-12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes replyStripIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .custom-scroll { scrollbar-width: thin; scrollbar-color: #1a1d28 transparent; }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #1a1d28; border-radius: 4px; }
                .sidebar-accent::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #6366f1, transparent);
                    opacity: 0.6;
                }
                .noise-bg::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 0;
                    opacity: 0.4;
                }
                .msg-input-wrap:focus-within {
                    border-color: rgba(99,102,241,0.35) !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
                }
                .msg-input-wrap-replying {
                    border-color: rgba(99,102,241,0.28) !important;
                    box-shadow: 0 0 0 2px rgba(99,102,241,0.1) !important;
                }
                .msg-input-wrap-replying:focus-within {
                    border-color: rgba(99,102,241,0.5) !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.18) !important;
                }
                .panel-divider {
                    height: 1px;
                    background: linear-gradient(90deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08), transparent);
                    margin: 0 16px 12px 16px;
                }
                .notif-item {
                    display: flex; gap: 10px; align-items: flex-start;
                    padding: 10px 12px; border-radius: 12px;
                    cursor: pointer; transition: background 0.15s;
                    border: 1px solid transparent;
                }
                .notif-item:hover { background: rgba(99,102,241,0.07); }
                .notif-item.unread { border-color: rgba(99,102,241,0.14); background: rgba(99,102,241,0.06); }
            `}</style>

            {/* Root */}
            <div className="flex h-[100dvh] bg-[#0a0b0f] text-[#f1f2f7] overflow-hidden">

                {/* ── SIDEBAR ── */}
                <Sidebar
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    query={query}
                    setQuery={setQuery}
                    users={users}
                    setShowSidebar={setShowSidebar}
                    chatUsersInfo={chatUsersInfo}
                    totalUnread={totalUnread}
                    user={user}
                    hideOnMobile={true}
                    searchUsers={searchUsers}
                />

                {/* ── MAIN CHAT WINDOW ── */}
                <div className="noise-bg relative flex flex-col flex-1 h-full bg-[#0c0e16] overflow-hidden md:flex ">

                    {/* Ambient orbs */}
                    <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
                        style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)', filter: 'blur(80px)' }} />
                    <div className="absolute -bottom-20 left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none z-0"
                        style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.07),transparent 70%)', filter: 'blur(80px)' }} />

                    {context.currentChatUser ? (
                        <>
                            {/* Nav */}
                            <nav
                                title={isGroupChat ? 'Group Info' : "User Profile"}
                                onClick={handleChatInfoClick}
                                className="sticky top-0 z-10 flex items-center gap-3.5 h-16 px-6 border-b border-white/[0.06] bg-[rgba(14,16,24,0.85)] backdrop-blur-xl">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <img
                                        src={
                                            isGroupChat ? (groupChat?.groupPicture || context.currentChatUser.avtar):
                                            !isGroupChat && context.currentChatUser?.avtar ? context.currentChatUser.avtar : `https://api.dicebear.com/7.x/shapes/svg?seed=${context.currentChatUser._id}&scale=90`
                                        }
                                      
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/[0.07]"
                                    />
                                    { !isGroupChat && onlineStatus[context.currentChatUser._id] && (
                                        <div className="online-pulse absolute bottom-[1px] right-[1px] w-2.5 h-2.5 rounded-full bg-[#22d3a0] border-2 border-[#0c0e16]"
                                            style={{ boxShadow: '0 0 8px #22d3a0' }} />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-semibold tracking-tight text-[#f1f2f7]">
                                        {(!isGroupChat && context.currentChatUser?.username) || (isGroupChat ? groupChat?.groupName : "Unknown User")}
                                    </span>
                                    {chatUsersInfo[currentChatId]?.typing ? (
                                        <span className="flex items-center gap-1 text-xs text-[#22d3a0] font-medium">
                                            <span className="flex gap-0.5 items-center">
                                                <span className="typing-dot w-[3px] h-[3px] rounded-full bg-[#22d3a0] inline-block" />
                                                <span className="typing-dot w-[3px] h-[3px] rounded-full bg-[#22d3a0] inline-block" />
                                                <span className="typing-dot w-[3px] h-[3px] rounded-full bg-[#22d3a0] inline-block" />
                                            </span>
                                            typing
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[#4a4e6a]">
                                            {onlineStatus[context.currentChatUser._id] ? 'Online' : 'Offline'}
                                        </span>
                                    )}
                                </div>

                                
                            </nav>

                            {isMedia ? (
                                <MediaPreview
                                    isMedia={isMedia}
                                    handleSend={handleSend}
                                    message={message}
                                    setMessage={setMessage}
                                />
                            ) : currentPreviewFile ? (
                                <SingleFilePreview />
                            ) : (
                                <>
                                    {/* Messages */}
                                    <div
                                        ref={chatContainerRef}
                                        className="flex-1 overflow-y-auto md:px-6 pt-6 pb-2 z-[1] custom-scroll"
                                    >
                                        {messages[currentChatId]?.map((msg) => (
                                            <Message
                                                key={msg._id}
                                                msg={msg}
                                                // onReply={(msg) => {
                                                //     setMessageBeingReplied(msg)
                                                //     setIsReplying(true)
                                                // }}
                                            />
                                        ))}

                                        {!isAtBottom && (
                                            <button
                                                onClick={scrollToBottom}
                                                className="fixed z-20 bottom-24 right-8 w-9 h-9 flex items-center justify-center rounded-full bg-[#6366f1] border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                                                style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
                                            >
                                                <ArrowDownCircleIcon size={18} color="#fff" />
                                            </button>
                                        )}

                                        <div ref={messageEndRef} />
                                    </div>

                                    {/* Unread badge */}
                                    {chatUsersInfo[currentChatId]?.newMessages > 0 && (
                                        <div className="fade-in-up absolute bottom-[88px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-[20px] text-xs font-medium text-[#818cf8] border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.12)] backdrop-blur-md">
                                            <MoveDown size={13} />
                                            {chatUsersInfo[currentChatId].newMessages} unread messages
                                        </div>
                                    )}

                                    {/* ── FOOTER ── */}
                                    <footer
                                        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
                                        className="z-10 flex flex-col border-t border-white/[0.06] bg-[rgba(14,16,24,0.9)] backdrop-blur-xl"
                                    >
                                        {/* Reply preview strip — slides in when isReplying */}
                                        <ReplyPreviewStrip />

                                        {/* Input row */}
                                        <div className="flex items-center gap-3 h-20 px-5">
                                            <div className={`msg-input-wrap flex flex-1 items-center gap-2 bg-[#1a1d28] border border-white/[0.06] rounded-[20px] px-1 pr-1.5 transition-all duration-200 ${isReplying ? 'msg-input-wrap-replying' : ''}`}>
                                                <div className="flex items-center px-1 text-[#4a4e6a] flex-shrink-0">
                                                    <FileUpload />
                                                </div>
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={message}
                                                    onChange={(e) => handleTyping(e)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape' && isReplying) {
                                                            handleCancelReply()
                                                            return
                                                        }
                                                        e.key === 'Enter' && !e.shiftKey && handleSend(e)
                                                    }}
                                                    placeholder={
                                                        isReplying
                                                            ? `Reply to ${messageBeingReplied?.sender === user._id ? 'yourself' : context.currentChatUser?.username}…`
                                                            : "Type a message…"
                                                    }
                                                    className="flex-1 bg-transparent border-none outline-none text-[#f1f2f7] text-sm py-3.5 px-2 placeholder-[#4a4e6a]"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSend}
                                                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-[14px] border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95"
                                                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
                                            >
                                                <Send size={18} color="#fff" />
                                            </button>
                                        </div>
                                    </footer>
                                </>
                            )}
                        </>
                    ) : (
                        /* Empty state */
                        <div className="relative z-[1] flex flex-col items-center justify-center w-full h-full gap-4">
                            <div
                                className="float-icon flex items-center justify-center w-[72px] h-[72px] rounded-[24px] border border-[rgba(99,102,241,0.35)]"
                                style={{
                                    background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',
                                    boxShadow: '0 0 30px rgba(99,102,241,0.2)'
                                }}
                            >
                                <MessageCircle size={32} color="#818cf8" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-[#f1f2f7]">No conversation selected</h1>
                            <p className="text-sm text-[#4a4e6a] max-w-[280px] text-center leading-relaxed">
                                Pick someone from your conversations to start messaging instantly.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Home