import React from 'react'
import { useGroupChatStore } from '../store/useGroupChatStore'
import { chatApi } from '../api/chat.api'

export const useGroup = () => {

    const {setNewGroupInfo,GroupInfo,newGroupNotication,setNewGroupNotification,participants,resetParticipant} = useGroupChatStore()
   const [loading , setLoading] = React.useState(false)

  
   const createGroup = async(groupName, participants)=>{
      setLoading(true)
      console.log("Creating Group with Data :: ",participants)
      const response = await chatApi.createGroupChat(groupName, participants)
   }
      
  return {

    loading,
    setLoading,
    createGroup
  }
}