<template>
  <!-- Nuevo contenedor wrapper para controlar tamaño y centrado si es necesario -->
  <div class="chat-wrapper">
    <!-- Título añadido dentro del componente -->
    <div class="chat-title">
      Asistente Culinario AI 🍳
    </div>

    <!-- Contenedor principal para el contenido del chat (sidebar + mensajes/input) -->
    <div class="chat-content-area">

      <!-- Nueva Sidebar para información adicional -->
      <div class="sidebar">
        <h4>Información Útil</h4>
        <p>Puedes preguntar sobre:</p>
        <ul>
          <li>Recetas (ej: "Dame una receta de lasaña")</li>
          <li>Técnicas (ej: "Cómo hacer un sofrito")</li>
          <li>Sustituciones (ej: "Sustituto vegano para huevos")</li>
          <li>Definiciones (ej: "¿Qué es escalfar?")</li>
        </ul>
        <hr>
        <p><em></em></p>
        <!-- Podemos añadir más cosas: logo, links, etc. -->
         <div class="ai-brand">
            <span>Nuxt & Gemini C.O</span>
         </div>
      </div>

      <!-- Área principal de interacción (mensajes e input) -->
      <div class="chat-interaction-area">
        <!-- Los mensajes ahora están dentro de esta área -->
        <ChatMessages :messages="messages" class="chat-messages-area" />
        <!-- El input también está dentro de esta área -->
        <ChatInput @send="sendMessage" :loading="loading" class="chat-input-area" />
      </div>

    </div>
  </div>
</template>

<script setup>
import ChatMessages from "./ChatMessages.vue";
import ChatInput from "./ChatInput.vue";
import { useChat } from "~/composables/useChat";

const { messages, loading, sendMessage } = useChat();
</script>

<style scoped>
/* Estilos para el contenedor principal del chat */
.chat-wrapper {
  display: flex;
  flex-direction: column;
  /* Ajusta max-width según prefieras, debe ser lo suficientemente ancho para la sidebar */
  max-width: 950px;
  width: 90%; /* O un ancho más fijo si prefieres */
  height: 85vh; /* Altura significativa pero no total, para ver el h1 de index.vue */
  margin: 20px auto; /* Centrado por index.vue, pero añadimos margen vertical */
  background-color: #252526; /* Fondo oscuro del chat */
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  overflow: hidden; /* Esconde contenido que se desborde */
  color: #e0e0e0; /* Color de texto general */
}

/* Estilo para el título */
.chat-title {
  padding: 15px 20px;
  font-size: 1.3em;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #f0f0f0;
  flex-shrink: 0; /* Evita que se encoja */
}

/* Contenedor para sidebar y área de chat */
.chat-content-area {
  display: flex;
  flex-grow: 1; /* Ocupa el espacio restante vertical */
  overflow: hidden; /* Clave para que los hijos controlen su propio scroll */
}

/* Estilos para la Sidebar */
.sidebar {
  width: 230px; /* Ancho fijo para la sidebar */
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.15); /* Fondo ligeramente distinto */
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto; /* Scroll si el contenido es largo */
  flex-shrink: 0; /* Evita que se encoja */
  font-size: 0.9em;
  color: #b0b0b0; /* Texto más tenue */
}

.sidebar h4 {
  margin-top: 0;
  color: #e0e0e0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.sidebar ul {
  list-style: none;
  padding-left: 0;
}

.sidebar li {
  margin-bottom: 10px;
  padding-left: 18px;
  position: relative;
}
.sidebar li::before {
  content: '🍳'; /* O '•', '>', etc. */
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.8em;
}


.sidebar hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
}

.sidebar p {
    line-height: 1.5;
}

.ai-brand {
    margin-top: 30px;
    text-align: center;
    font-size: 0.8em;
    opacity: 0.6;
}

/* Área principal de interacción (derecha) */
.chat-interaction-area {
  flex-grow: 1; /* Ocupa el espacio restante */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Importante para controlar scroll interno */
}

/* Área de mensajes (hereda estilos de scroll de la versión anterior) */
.chat-messages-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
    /* Estilo para la barra de scroll (WebKit - Chrome, Safari) */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
}

/* Área de input (hereda estilos de la versión anterior) */
.chat-input-area {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #2d2d2d; /* Fondo consistente */
  flex-shrink: 0; /* No debe crecer ni encogerse */
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .chat-wrapper {
    width: 95%;
    height: 90vh; /* Ocupar más altura en móvil */
    margin: 10px auto;
  }

  .chat-content-area {
    flex-direction: column; /* Apila sidebar y chat en móvil */
  }

  .sidebar {
    width: auto; /* Ancho automático */
    max-height: 150px; /* Altura limitada para la sidebar en móvil */
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-y: auto; /* Asegurar scroll si excede max-height */
    padding: 10px 15px; /* Menos padding */
  }
  .sidebar h4 {
      margin-bottom: 8px;
  }
   .sidebar ul { margin-bottom: 5px; }
   .sidebar li { margin-bottom: 5px; }
   .sidebar hr { margin: 10px 0; }
   .ai-brand { display: none; } /* Ocultar branding en móvil si ocupa mucho */

 
   .chat-messages-area {
     padding: 15px;
   }
   .chat-input-area {
     padding: 10px 15px;
   }
}
</style>