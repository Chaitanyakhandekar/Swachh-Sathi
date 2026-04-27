// import { X } from 'lucide-react'
// import React from 'react'

// function Notification({activePanel,setActivePanel,chatUsersInfo,newGroupNotication}) {

//              return <div className="slide-in-panel flex flex-col h-full">
    
//                 <div className="flex items-center justify-between px-5 pt-6 pb-4">
//                   <span className="text-[15px] font-bold">
//                     Notifications
//                   </span>
    
//                   <button
//                     onClick={() => setActivePanel(null)}
//                   >
//                     <X size={16}/>
//                   </button>
//                 </div>
    
//                 <div className="panel-divider"/>
    
//                 <div className="flex-1 overflow-y-auto px-3 custom-scroll">
    
//                   {Object.entries(chatUsersInfo)
//                     .filter(([,c]) => c?.newMessages > 0)
//                     .map(([chatId, info]) => {
    
//                       const chat =
//                         users?.find(
//                           c => c._id === chatId
//                         )
    
//                       if(!chat) return null
    
//                       const otherUser =
//                         chat.participants[0]._id === user._id
//                           ? chat.participants[1]
//                           : chat.participants[0]
    
//                       return (
//                         <div
//                           key={chatId}
//                           className="notif-item unread"
//                           onClick={() =>
//                             setActivePanel(null)
//                           }
//                         >
    
//                           <img
//                             src={otherUser.avtar}
//                             className="w-9 h-9 rounded-full"
//                           />
    
//                           <div>
//                             {otherUser.username}
//                           </div>
    
//                         </div>
//                       )
    
//                     })}
    
//                   {
//                     newGroupNotication &&
//                     <div className="notif-item unread">
//                       <img
//                         src={""}
//                         className="w-9 h-9 rounded-full"
//                       />
//                       <div
//                         className="text-sm font-medium text-[#c4c6e7]"
//                       >
//                         {"User1 Added you to "}
//                       </div>
//                     </div>
//                   }
    
//                 </div>
    
//               </div>
  
// }

// export default Notification








import { X } from "lucide-react"
import React, { useState } from "react"
import NotificationCard from "./NotificationCard"

// ─── Dummy data ────────────────────────────────────────────────────────────────
// Replace with real data fetched from your API (GET /notifications?receiver=userId)

const DUMMY_NOTIFICATIONS = [
  {
    _id: "notif_1",
    type: "message",
    isRead: false,
    content: "Hey, did you push the latest build? I can't find it on the branch.",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    entity: "chat_abc",
    renderUrl: "/chat/chat_abc",
    sender: { _id: "user_1" },
    receiver: { _id: "me" },
  },
  {
    _id: "notif_2",
    type: "group_add",
    isRead: false,
    content: "Priya added you to Design Sync — 6 members.",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    entity: "group_xyz",
    renderUrl: "/chat/group_xyz",
    sender: { _id: "user_2" },
    receiver: { _id: "me" },
    isGroupNotification: true,
  },
  {
    _id: "notif_3",
    type: "mention",
    isRead: false,
    content: "@you — can you review the PR before EOD? It's blocking the sprint.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    entity: "group_dev",
    renderUrl: "/chat/group_dev",
    sender: { _id: "user_3" },
    receiver: { _id: "me" },
    isGroupNotification: true,
  },
  {
    _id: "notif_4",
    type: "admin_promote",
    isRead: false,
    content: "You've been promoted to Admin in Project Hydra.",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    entity: "group_hydra",
    renderUrl: "/chat/group_hydra",
    sender: { _id: "user_4" },
    receiver: { _id: "me" },
    isGroupNotification: true,
  },
  {
    _id: "notif_5",
    type: "message",
    isRead: true,
    content: "Thanks for the help earlier, really saved the demo!",
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    entity: "chat_def",
    renderUrl: "/chat/chat_def",
    sender: { _id: "user_5" },
    receiver: { _id: "me" },
  },
  {
    _id: "notif_6",
    type: "mention",
    isRead: true,
    content: "@you — dropping the updated specs in the shared folder now.",
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    entity: "group_design",
    renderUrl: "/chat/group_design",
    sender: { _id: "user_6" },
    receiver: { _id: "me" },
    isGroupNotification: true,
  },
]

// Sender info keyed by user _id.
// In production, populate this by populating sender in your notifications query:
//   Notification.find({ receiver: userId }).populate("sender", "username avatar")
const SENDER_INFO_MAP = {
  user_1: { username: "Aryan Mehta",  avatar: "" },
  user_2: { username: "Priya Sharma", avatar: "" },
  user_3: { username: "Rohan Das",    avatar: "" },
  user_4: { username: "Neha Joshi",   avatar: "" },
  user_5: { username: "Kabir Singh",  avatar: "" },
  user_6: { username: "Simran Kaur",  avatar: "" },
}

// ─── Component ─────────────────────────────────────────────────────────────────

function Notification({ activePanel, setActivePanel }) {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Mark a single notification as read
  function handleMarkRead(id) {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    )
    // TODO: PATCH /api/notifications/:id/read
  }

  // Mark all as read
  function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    // TODO: PATCH /api/notifications/read-all
  }

  // Navigate to the notification's context
  function handleClick(notif) {
    handleMarkRead(notif._id)
    if (notif.renderUrl) {
      // navigate(notif.renderUrl)  ← plug in your router here
    }
    setActivePanel(null)
  }

  return (
    <div className="slide-in-panel flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold">Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "rgba(124,131,229,0.2)",
                color: "#7c83e5",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 20,
                letterSpacing: "0.02em",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        <button onClick={() => setActivePanel(null)}>
          <X size={16} />
        </button>
      </div>

      <div className="panel-divider" />

      {/* ── Mark all read ── */}
      {unreadCount > 0 && (
        <div className="flex justify-end px-4 pt-2 pb-1">
          <button
            onClick={handleMarkAllRead}
            style={{
              fontSize: 11,
              color: "rgba(196,198,231,0.45)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "3px 6px",
              borderRadius: 5,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#7c83e5" }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(196,198,231,0.45)" }}
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* ── Notification list ── */}
      <div className="flex-1 overflow-y-auto px-2 custom-scroll">
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map(notif => (
            <NotificationCard
              key={notif._id}
              notification={notif}
              senderInfo={SENDER_INFO_MAP[notif.sender._id]}
              onClick={handleClick}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </div>

    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-3"
      style={{ color: "rgba(196,198,231,0.3)", fontSize: 13, paddingBottom: 40 }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(196,198,231,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(196,198,231,0.3)">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      </div>
      <span>You&apos;re all caught up!</span>
    </div>
  )
}

export default Notification