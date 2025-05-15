<template>
  <div class="messages">
    <!-- Iteramos sobre los mensajes -->
    <!-- La clase dinámica ahora verifica msg.role y usa 'ai' si es 'model' -->
    <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role === 'model' ? 'ai' : msg.role]">
      <!-- El contenido del mensaje se toma de msg.parts[0].text -->
      <!-- Llamamos a la función renderMarkdown para procesar el contenido -->
      <div class="content" v-html="renderMarkdown(msg.parts && msg.parts.length > 0 ? msg.parts[0].text : '')"></div>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// defineProps espera un array de objetos con la estructura GeminiHistoryMessage
// (aunque TypeScript no se aplica aquí directamente, es bueno tenerlo en mente)
defineProps({
  messages: {
    type: Array,
    default: () => [] // Proporcionar un valor por defecto para evitar errores si es undefined
  }
});

// Función para procesar el Markdown y sanitizar el HTML resultante
function renderMarkdown(markdownString) {
  // Manejar casos donde el contenido pueda ser nulo, indefinido o una cadena vacía
  if (!markdownString) {
    return '';
  }
  try {
    // Configurar marked para que los saltos de línea simples se conviertan en <br>
    marked.setOptions({
        breaks: true,
        gfm: true // GitHub Flavored Markdown
    });
    // 1. Convertir Markdown a HTML
    const rawHtml = marked.parse(markdownString);
    // 2. Sanitizar el HTML para seguridad
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return cleanHtml;
  } catch (error) {
    console.error("Error processing markdown:", error);
    // En caso de error, devolver el texto original (o un mensaje de error)
    // Escaparlo para evitar la interpretación de HTML si el markdown es malicioso y falló al parsear
    // Esta es una forma simple de escapar HTML. Para una solución más robusta, se podría usar una librería.
    const tempDiv = document.createElement('div');
    tempDiv.textContent = markdownString;
    return tempDiv.innerHTML;
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
/* msg.role será 'user' o 'model'. Si es 'model', aplicamos la clase 'ai'. */
.message-bubble.user {
  align-self: flex-end; /* Alinea a la derecha */
  background-color: #007bff; /* Fondo azul */
  color: white; /* Texto blanco */
}

.message-bubble.ai { /* Esta clase se aplicará cuando msg.role sea 'model' */
  align-self: flex-start; /* Alinea a la izquierda */
  background-color: #f0f0f0; /* Fondo gris claro */
  color: #333; /* Texto oscuro */
}

/* --- ESTILOS PARA CONTENIDO GENERADO POR v-html --- */
.content :deep(p) {
  margin-top: 0;
  margin-bottom: 0.6em;
}
.content :deep(p:last-child) {
  margin-bottom: 0;
}

.content :deep(ul),
.content :deep(ol) {
  padding-left: 25px;
  margin-top: 0.5em;
  margin-bottom: 0.6em;
}

.content :deep(li) {
  margin-bottom: 0.3em;
}

.content :deep(strong),
.content :deep(b) {
  font-weight: bold;
}

.content :deep(em),
.content :deep(i) {
  font-style: italic;
}

.content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  /* Para que el código dentro de párrafos no tenga un fondo blanco sobre fondo claro */
  /* si el tema del chat es oscuro y la burbuja de IA es oscura */
  color: inherit; /* Hereda el color de la burbuja */
}

/* Si la burbuja de IA es oscura (ej. background-color: #000; color: #eee;) */
/* entonces el `code` podría necesitar un color específico para ser visible */
/* .message-bubble.ai .content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #eee;
} */
</style>