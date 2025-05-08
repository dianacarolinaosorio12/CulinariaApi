<template>
    <form class="chat-input" @submit.prevent="handleSend">
      <input v-model="message" type="text" placeholder="Escribe un mensaje..." />
      <button type="submit" :disabled="loading">Enviar</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  const message = ref("");
  const emit = defineEmits(["send"]);
  defineProps(["loading"]);
  
  function handleSend() {
    if (message.value.trim() !== "") {
      emit("send", message.value);
      message.value = "";
    }
  }
  </script>
  
  <style scoped>
  .chat-input {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    background-color: #007bff;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
  </style>
  