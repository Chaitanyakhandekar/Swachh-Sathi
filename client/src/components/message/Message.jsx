import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useContext } from 'react'
import { authContext } from '../../context/AuthProvider'
import { getTime } from '../../services/getTime'
import {
    CheckIcon,
    CheckCheck,
    Reply,
    Trash2,
    Copy,
    Forward,
    SmilePlus,
    MoreHorizontal,
    X,
    Info,
    ImageIcon,
} from 'lucide-react'
import { userAuthStore } from '../../store/userStore'
import { socket } from '../../socket/socket'
import { socketEvents } from '../../constants/socketEvents'
import { useChatStore } from '../../store/useChatStore'
import { href } from 'react-router-dom'
import { isThisLink } from '../../services/isThisLink'
import { messageApi } from '../../api/message.api'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

function useOutsideClick(ref, handler) {
    useEffect(() => {
        const listener = (e) => {
            if (!ref.current || ref.current.contains(e.target)) return
            handler(e)
        }
        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)
        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [ref, handler])
}

/* ─── Context menu ─── */
function MessageContextMenu({ open, isSent, onAction, onClose, anchorRef }) {
    const menuRef = useRef(null)
    useOutsideClick(menuRef, onClose)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (!open || !anchorRef.current || !menuRef.current) return
        const bubble = anchorRef.current.getBoundingClientRect()
        const menu = menuRef.current.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight
        let top = bubble.bottom + 6
        let left = isSent ? bubble.right - menu.width : bubble.left
        if (top + menu.height > vh - 16) top = bubble.top - menu.height - 6
        if (left + menu.width > vw - 8) left = vw - menu.width - 8
        if (left < 8) left = 8
        setPos({ top, left })
    }, [open])

    if (!open) return null

    const actions = [
        { id: 'reply',   icon: Reply,   label: 'Reply',   always: true },
        { id: 'copy',    icon: Copy,    label: 'Copy',    always: true },
        { id: 'forward', icon: Forward, label: 'Forward', always: true },
        { id: 'info',    icon: Info,    label: 'Info',    onlySent: true },
        { id: 'delete',  icon: Trash2,  label: 'Delete',  onlySent: true, danger: true },
    ].filter(a => a.always || (a.onlySent && isSent))

    return (
        <div
            ref={menuRef}
            className="fixed z-[999] min-w-[168px] rounded-[14px] overflow-hidden border border-white/[0.08] bg-[#1a1d2e] shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            style={{ top: pos.top, left: pos.left, animation: 'ctxIn 0.15s cubic-bezier(0.16,1,0.3,1)' }}
        >
            <style>{`
                @keyframes ctxIn {
                    from { opacity:0; transform:scale(0.93) translateY(-4px); }
                    to   { opacity:1; transform:scale(1) translateY(0); }
                }
            `}</style>
            {actions.map((a, i) => (
                <button
                    key={a.id}
                    onClick={() => { onAction(a.id); onClose() }}
                    className={[
                        'flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium transition-colors duration-100',
                        a.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[#c4c6e7] hover:bg-white/[0.06]',
                        i !== 0 ? 'border-t border-white/[0.04]' : ''
                    ].join(' ')}
                >
                    <a.icon size={14} strokeWidth={2} />
                    {a.label}
                </button>
            ))}
        </div>
    )
}

/* ─── Emoji bar ─── */
function EmojiBar({ show, isSent, onPick }) {
    if (!show) return null
    return (
        <div
            className={[
                'absolute -top-9 flex items-center gap-0.5 px-2 py-1 rounded-full border border-white/[0.08] bg-[#1a1d2e]/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
                isSent ? 'right-0' : 'left-0',
            ].join(' ')}
            style={{ animation: 'emojiBarIn 0.18s cubic-bezier(0.16,1,0.3,1)', zIndex: 10 }}
        >
            <style>{`
                @keyframes emojiBarIn {
                    from { opacity:0; transform:translateY(6px) scale(0.88); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
            `}</style>
            {QUICK_EMOJIS.map((em) => (
                <button key={em} onClick={() => onPick(em)}
                    className="w-7 h-7 flex items-center justify-center text-base rounded-full hover:bg-white/10 transition-all duration-100 hover:scale-125 active:scale-110">
                    {em}
                </button>
            ))}
        </div>
    )
}

/* ─── Reaction chips ─── */
function ReactionChips({ reactions=[], isSent , msg }) {
    if (!reactions || reactions.length === 0) return null
    const grouped = reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1
        return acc
    }, {})
    // console.log("Grouped Reactions: ", grouped)
    return (
        <div className={`flex flex-wrap gap-1 mt-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
            {reactions && reactions.length > 0 && Object.entries(grouped).map(([emoji, count], index) => (
                <span key={emoji} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border border-white/[0.1] bg-[#1a1d2e] text-[#c4c6e7] shadow-sm">
                    {emoji || msg.reactions[0]?.emoji} {count > 1 && <span className="text-[10px] text-[#818cf8]">{count}</span>}
                </span>
            ))}

        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   Reply Quote — production grade, inside bubble
───────────────────────────────────────────────────────────── */
function ReplyQuote({ reply, isSent }) {
    if (!reply) return null

    const hasThumb = reply?.attachments?.length > 0
    const thumbUrl = hasThumb
        ? (reply.attachments[0]?.secure_url || reply.attachments[0]?.preview)
        : null
    const hasText = reply?.message?.trim()

    return (
        <div
            className={[
                'mx-2.5 mt-2.5 mb-1.5 rounded-[10px] overflow-hidden flex items-stretch',
                'cursor-pointer select-none transition-opacity duration-150 active:opacity-70',
                isSent ? 'bg-white/[0.12]' : 'bg-black/[0.20]',
            ].join(' ')}
            style={{ borderLeft: isSent ? '3px solid rgba(255,255,255,0.45)' : '3px solid #6366f1' }}
        >
            {/* Content */}
            <div className="flex flex-col justify-center flex-1 min-w-0 px-2.5 py-[7px]">
                {/* Sender row */}
                <span className={[
                    'flex items-center gap-[5px] text-[10.5px] font-bold leading-none mb-[4px]',
                    isSent ? 'text-white/55' : 'text-[#818cf8]'
                ].join(' ')}>
                    <Reply
                        size={9}
                        strokeWidth={2.8}
                        style={{ transform: 'scaleX(-1)', flexShrink: 0 }}
                    />
                    {reply.senderName || 'Message'}
                </span>

                {/* Preview */}
                <span className={[
                    'text-[11.5px] leading-[1.4] truncate',
                    isSent ? 'text-white/45' : 'text-[#71788f]'
                ].join(' ')}>
                    {hasThumb ? (
                        <span className="inline-flex items-center gap-1">
                            <ImageIcon size={10} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.75 }} />
                            {hasText ? reply.message : 'Photo'}
                        </span>
                    ) : (
                        reply.message
                    )}
                </span>
            </div>

            {/* Thumbnail — full height, flush right */}
            {thumbUrl && (
                <div className="w-[44px] flex-shrink-0 self-stretch">
                    <img
                        src={thumbUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                </div>
            )}
        </div>
    )
}

/* ─── Delete modal ─── */
function DeleteModal({ show, onClose, onDeleteForMe, onDeleteForEveryone }) {
    if (!show) return null
    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0"
            style={{ animation: 'fadeIn 0.15s ease' }}>
            <style>{`
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
            `}</style>
            <div className="w-full max-w-sm rounded-[20px] bg-[#1a1d2e] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                style={{ animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
                <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[15px] font-bold text-[#f1f2f7] tracking-tight">Delete message?</h3>
                        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors">
                            <X size={14} color="#9ca3c4" />
                        </button>
                    </div>
                    <p className="text-[12.5px] text-[#4a4e6a] leading-relaxed">This action cannot be undone.</p>
                </div>
                <div className="px-3 pb-4 flex flex-col gap-2">
                    <button onClick={onDeleteForEveryone}
                        className="w-full py-3 rounded-[12px] text-[13.5px] font-semibold text-white bg-gradient-to-r from-red-500/90 to-rose-600/90 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_14px_rgba(239,68,68,0.3)]">
                        Delete for everyone
                    </button>
                    <button onClick={onDeleteForMe}
                        className="w-full py-3 rounded-[12px] text-[13.5px] font-medium text-[#c4c6e7] bg-white/[0.06] hover:bg-white/[0.09] active:scale-[0.98] transition-all duration-150">
                        Delete for me
                    </button>
                    <button onClick={onClose}
                        className="w-full py-2.5 rounded-[12px] text-[12.5px] font-medium text-[#4a4e6a] hover:text-[#c4c6e7] transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ─── Message Info modal ─── */
function MessageInfoModal({ show, onClose, msg }) {
    if (!show) return null
    return (
        <div className={`fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0`}
            style={{ animation: 'fadeIn 0.15s ease' }}>
            <div className="w-full max-w-sm rounded-[20px] bg-[#1a1d2e] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                style={{ animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
                    <h3 className="text-[15px] font-bold text-[#f1f2f7] tracking-tight">Message Info</h3>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors">
                        <X size={14} color="#9ca3c4" />
                    </button>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#4a4e6a] uppercase tracking-wide font-semibold">Sent</span>
                        <span className="text-[13px] text-[#c4c6e7]">{msg?.createdAt ? new Date(msg.createdAt).toLocaleString() : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#4a4e6a] uppercase tracking-wide font-semibold">Status</span>
                        <span className={`text-[13px] font-medium ${msg?.status === 'seen' ? 'text-[#a5f3fc]' : 'text-[#818cf8]'}`}>
                            {msg?.status === 'seen' ? '✓✓ Seen' : msg?.status === 'sent' ? '✓ Sent' : msg?.status === 'uploading' ? '⟳ Uploading' : '—'}
                        </span>
                    </div>
                    {msg?.attachments?.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#4a4e6a] uppercase tracking-wide font-semibold">Attachments</span>
                            <span className="text-[13px] text-[#c4c6e7]">{msg.attachments.length} file{msg.attachments.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   MAIN Message component
───────────────────────────────────────────────────────────── */
function Message({ msg, key, onReply }) {

    const context = useContext(authContext)
    const { user } = userAuthStore()
    const {
        resetNewMessagesCount,
        setCurrentPreviewFile,
        currentPreviewFile,
        removeMessage,
        isReplying,
        setIsReplying,
        messageBeingReplied,
        setMessageBeingReplied,
        reaction,
        setReaction,
        resetReaction
    } = useChatStore()

    const messageRef = useRef(null)
    const bubbleRef = useRef(null)

    const [showMenu, setShowMenu] = useState(false)
    const [showEmojiBar, setShowEmojiBar] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [reactions, setReactions] = useState(msg?.reactions || [])
    const [copied, setCopied] = useState(false)

    const longPressTimer = useRef(null)
    const longPressTriggered = useRef(false)

    const isSent = msg.sender === user._id
    const hasImage = msg?.attachments?.length > 0
    const hasText = msg?.message && msg.message.trim() !== ""
    const hasReply = !!msg?.reply
    const [isLink,setIsLink] = useState(false)

    /* ── Sync reactions from updated message ── */
    useEffect(() => {
        setReactions(msg?.reactions || [])
    }, [msg?.reactions])

    /* ── Intersection observer (seen) ── */
    useEffect(() => {
        if (msg.sender === user._id) return
        if (msg.status === "seen") return
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        socket.emit(socketEvents.MESSAGE_SEEN_SINGLE_CHAT, {
                            messageId: msg._id,
                            chatId: msg.chatId
                        })
                        resetNewMessagesCount(msg.chatId)
                        observer.disconnect()
                    }
                })
            },
            { threshold: 0.6 }
        )
        if (messageRef.current) observer.observe(messageRef.current)
        return () => observer.disconnect()
    }, [msg._id])

    useEffect(() => {
        if (showMenu) setShowEmojiBar(false)
    }, [showMenu])

    useEffect(() => {
        let is = isThisLink(msg.message)
        setIsLink(is)
    }, [])

    const handleTouchStart = useCallback(() => {
        longPressTriggered.current = false
        longPressTimer.current = setTimeout(() => {
            longPressTriggered.current = true
            setShowMenu(true)
        }, 500)
    }, [])

    const handleTouchEnd = useCallback(() => { clearTimeout(longPressTimer.current) }, [])
    const handleTouchMove = useCallback(() => { clearTimeout(longPressTimer.current) }, [])

    const handleAction = (actionId) => {
        switch (actionId) {
            case 'reply':
                if (onReply) onReply(msg)
                setIsReplying(true)
                setMessageBeingReplied(msg)
                break
            case 'copy':
                if (msg.message) {
                    navigator.clipboard.writeText(msg.message).then(() => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1800)
                    })
                }
                break
            case 'forward':
                socket.emit(socketEvents.FORWARD_MESSAGE || 'forward_message', { messageId: msg._id })
                break
            case 'info':
                setShowInfoModal(true)
                break
            case 'delete':
                setShowDeleteModal(true)
                break
            default:
                break
        }
    }

    const handleDeleteForMe = async() => {
        // removeMessage && removeMessage(msg.chatId, msg._id)
        const res = await messageApi.deleteForMe(msg._id)
        if(res.success){
            console.log("Delete aaaaaaaaaaaaaaaaaaaa :: ",msg.chatId,msg._id)
            removeMessage(msg.chatId,msg._id)
        }
        setShowDeleteModal(false)
    }

    const handleDeleteForEveryone = async() => {
        const res = await messageApi.deleteForEveryone(msg._id)
        if(res.success){
            console.log("Delete aaaaaaaaaaaaaaaaaaaa :: ",msg.chatId,msg._id)
            removeMessage(msg.chatId,msg._id)
        }
        setShowDeleteModal(false)
    }

    const handleEmojiPick = (emoji) => {
        setReaction(msg._id,emoji)
        setReactions(prev => {
            const existing = prev.find(r => r.userId === user._id && r.emoji === emoji)
            if (existing) return prev.filter(r => !(r.userId === user._id && r.emoji === emoji))
            return [...prev.filter(r => r.userId !== user._id), { userId: user._id, emoji }]
        })
        setShowEmojiBar(false)
        socket.emit(socketEvents.REACT_MESSAGE_SINGLE_CHAT, {
            messageId: msg._id,
            chatId: msg.chatId,
            emoji,
            to:msg.sender === user._id ? "receiver" : "sender"
        })

        resetReaction()
    }

    const hoverTimer = useRef(null)
    const handleMouseEnter = () => { hoverTimer.current = setTimeout(() => setShowEmojiBar(true), 400) }
    const handleMouseLeave = () => { clearTimeout(hoverTimer.current); setShowEmojiBar(false) }

    // Handle indicator messages
    if (msg?.isIndicator) {
        return (
            <div className="flex justify-center my-3">
                <div className="text-[12px] text-gray-400 bg-gray-700/40 px-3 py-1 rounded-full">
                    {msg.message}
                </div>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @keyframes msgIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes replyQuoteIn {
                    from { opacity: 0; transform: scaleY(0.8); transform-origin: top; }
                    to   { opacity: 1; transform: scaleY(1); }
                }
            `}</style>

            {/* Row */}
            <div
                ref={messageRef}
                key={key}
                className={[
                    'flex mb-1.5 px-1 group select-none',
                    isSent ? 'justify-end' : 'justify-start',
                    'animate-[msgIn_0.2s_ease]'
                ].join(' ')}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Action btn — left (received) */}
                {!isSent && (
                    <div className="flex items-center mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 self-end pb-1">
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors"
                        >
                            <MoreHorizontal size={13} color="#4a4e6a" />
                        </button>
                    </div>
                )}

                {/* Bubble column */}
                <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[65%]`}>
                    <div className="relative">
                        <EmojiBar show={showEmojiBar} isSent={isSent} onPick={handleEmojiPick} />

                        {/* Bubble */}
                        <div
                            ref={bubbleRef}
                            className={[
                                'relative min-w-[72px] rounded-[18px] overflow-hidden break-words whitespace-pre-wrap',
                                'shadow-[0_2px_12px_rgba(0,0,0,0.35)]',
                                isSent
                                    ? 'text-white rounded-br-[5px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]'
                                    : 'bg-[#1e2133] text-[#e2e4f0] rounded-bl-[5px] border border-white/[0.06]',
                                msg.status === 'uploading' ? 'opacity-75' : '',
                            ].join(' ')}
                        >
                            {/* ── Reply Quote ── */}
                            {hasReply && (
                                <div style={{ animation: 'replyQuoteIn 0.16s ease' }}>
                                    <ReplyQuote reply={msg.reply} isSent={isSent} />
                                </div>
                            )}

                            {/* Image */}
                            {hasImage && (
                                <div
                                    onClick={() => {
                                        if (!longPressTriggered.current) {
                                            setCurrentPreviewFile(msg.attachments[0]?.secure_url || msg.attachments[0]?.preview)
                                        }
                                    }}
                                    className="relative w-full min-w-[180px] max-w-[320px] cursor-pointer"
                                >
                                    <img
                                        className="block w-full object-cover rounded-[inherit]"
                                        src={msg.attachments[0]?.preview || msg.attachments[0]?.secure_url}
                                        alt=""
                                        draggable={false}
                                    />
                                    {msg.status === "uploading" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[4px] rounded-[inherit]">
                                            <div className="w-8 h-8 rounded-full border-[3px] border-white/15 border-t-[#818cf8] animate-spin" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Text */}
                            {hasText && (isLink ? 
                            <div className={`text-[13.5px] leading-[1.55] px-3.5 pt-2.5 font-[Sora,sans-serif] ${!hasImage ? 'pb-[26px]' : 'pb-6'} text-blue-300 hover:underline`}>
                                <a
                             href={msg.message}
                             target='_blank'
                             >{msg.message}</a>
                            </div> :
                            (
                                <div className={`text-[13.5px] leading-[1.55] px-3.5 pt-2.5 font-[Sora,sans-serif] ${!hasImage ? 'pb-[26px]' : 'pb-6'}`}>
                                    {msg.message}
                                </div>
                            ))
                            
                            }

                            {/* Meta */}
                            <div className={[
                                'absolute bottom-[5px] right-[10px] flex items-center gap-[3px]',
                                hasImage && !hasText ? 'bg-black/45 backdrop-blur-[6px] rounded-[20px] px-[7px] py-[2px]' : ''
                            ].join(' ')}>
                                {msg?.createdAt && (
                                    <span className="font-[JetBrains_Mono,monospace] text-[10.5px] opacity-65 tracking-[-0.3px]" style={{ color: 'inherit' }}>
                                        {getTime(msg.createdAt)}
                                    </span>
                                )}
                                {isSent && (
                                    <>
                                        {msg.status === "sent" && <CheckIcon size={13} className="text-white/50" />}
                                        {msg.status === "seen" && <CheckCheck size={13} className="text-[#a5f3fc]" />}
                                    </>
                                )}
                            </div>
                        </div>

                        <ReactionChips reactions={reactions} isSent={isSent} msg={msg} />
                    </div>
                </div>

                {/* Action btn — right (sent) */}
                {isSent && (
                    <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 self-end pb-1">
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors"
                        >
                            <MoreHorizontal size={13} color="#4a4e6a" />
                        </button>
                    </div>
                )}
            </div>

            {/* Copied toast */}
            {copied && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 rounded-full text-[12px] font-medium text-white bg-[#1a1d2e] border border-white/10 shadow-lg backdrop-blur-sm"
                    style={{ animation: 'ctxIn 0.15s ease' }}>
                    Copied to clipboard
                </div>
            )}

            <MessageContextMenu
                open={showMenu}
                isSent={isSent}
                onAction={handleAction}
                onClose={() => setShowMenu(false)}
                anchorRef={bubbleRef}
            />

            <DeleteModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
            />

            <MessageInfoModal
                show={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                msg={msg}
            />
        </>
    )
}

export default Message