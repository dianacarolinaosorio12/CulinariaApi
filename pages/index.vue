<template>
  <div class="main-container"> <!-- Contenedor principal para el chat -->
    <h1>Chat de ejemplo con Gemini y nuxt GenerativeAI</h1> <!-- Título del chat -->
    <Chat /> <!-- Componente de chat que maneja la lógica de conversación -->
  </div>
</template>

<script setup>
import Chat from "~/components/Chat.vue"; // Importación del componente Chat desde la ruta especificada
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* Añadimos un fondo oscuro base para que el contraste funcione */
  min-height: 100vh;
  background-color: #1e1e1e;
  color: #f0f0f0;
}

h1 {
  color: #e0e0e0;
  margin-bottom: 20px;
}
</style>