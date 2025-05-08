<template>
  <div class="messages">
    <!-- El bucle v-for sigue igual, iterando sobre los mensajes -->
    <!-- La clase dinámica :class="msg.role" sigue aplicando 'user' o 'ai' -->
    <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role]">
      <!-- En lugar de <p>{{ msg.content }}</p>, usamos un div con v-html -->
      <!-- Llamamos a la función renderMarkdown para procesar el contenido -->
      <div class="content" v-html="renderMarkdown(msg.content)"></div>
    </div>
  </div>
</template>

<script setup>
/* importamos librerias para mejorar la vizualizacion de nuesto texto*/
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// defineProps sigue igual
defineProps(["messages"]);

// Función para procesar el Markdown y sanitizar el HTML resultante
function renderMarkdown(markdownString) {
  // Manejar casos donde el contenido pueda ser nulo o indefinido
  if (!markdownString) {
    return '';
  }
  try {
    // Configurar marked para que los saltos de línea simples se conviertan en <br>
    marked.setOptions({
        breaks: true,
        gfm: true // Opcional: GitHub Flavored Markdown
    });
    // 1. Convertir Markdown a HTML
    const rawHtml = marked.parse(markdownString);
    // 2. Sanitizar el HTML para seguridad (¡muy importante!)
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return cleanHtml;
  } catch (error) {
    console.error("Error processing markdown:", error);
    // En caso de error, devolver el texto original (o un mensaje de error)
    // Escaparlo por si acaso contenía HTML malicioso que falló al parsear
     return markdownString.replace(/</g, "<").replace(/>/g, ">");
  }
}
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Espacio entre burbujas */
}

/* Estilos comunes para todas las burbujas */
.message-bubble {
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 80%; /* Evita que las burbujas sean demasiado anchas */
  word-wrap: break-word; /* Asegura que el texto largo se ajuste */
  line-height: 1.4; /* Mejora legibilidad */
}

/* Estilos específicos basados en el rol (user/ai) */
.message-bubble.user {
  align-self: flex-end; /* Alinea a la derecha */
  background-color: #007bff; /* Fondo azul */
  color: white; /* Texto blanco */
}

.message-bubble.ai {
  align-self: flex-start; /* Alinea a la izquierda */
  background-color: #f0f0f0; /* Fondo gris claro (mejor contraste que negro) */
  color: #333; /* Texto oscuro */
  /* Si prefieres el fondo negro original: */
  /* background-color: #000; */
  /* color: #eee; */ /* Texto claro para fondo negro */
}

/* --- ESTILOS PARA CONTENIDO GENERADO POR v-html --- */
/* Usamos :deep() para aplicar estilos a elementos dentro del .content */

.content :deep(p) {
  margin-top: 0;
  margin-bottom: 0.6em; /* Espacio entre párrafos */
}
/* Evitar doble margen si solo hay un párrafo */
.content :deep(p:last-child) {
  margin-bottom: 0;
}

.content :deep(ul),
.content :deep(ol) {
  padding-left: 25px; /* Indentación para listas */
  margin-top: 0.5em;
  margin-bottom: 0.6em;
}

.content :deep(li) {
  margin-bottom: 0.3em; /* Espacio entre ítems de lista */
}

.content :deep(strong),
.content :deep(b) {
  font-weight: bold; /* Asegurar negrita */
}

.content :deep(em),
.content :deep(i) {
  font-style: italic; /* Asegurar cursiva */
}

/* Puedes añadir más estilos :deep() para otros elementos si los necesitas */
/* Ejemplo para código inline: */

.content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

</style>