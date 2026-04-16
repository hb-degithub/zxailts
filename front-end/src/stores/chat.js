import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const currentRoom = ref(null)
  const messages = ref([])
  const rooms = ref([])

  const setCurrentRoom = (room) => {
    currentRoom.value = room
  }

  const setMessages = (newMessages) => {
    messages.value = newMessages
  }

  const addMessage = (message) => {
    messages.value.push(message)
  }

  const setRooms = (newRooms) => {
    rooms.value = newRooms
  }

  return {
    currentRoom,
    messages,
    rooms,
    setCurrentRoom,
    setMessages,
    addMessage,
    setRooms
  }
})
