import { ref } from "vue"; // Importa la función 'ref' de Vue para crear referencias reactivas

// Definimos el tipo para los mensajes del historial que espera la API de Gemini
// Esto debe coincidir con lo que el backend espera para `history`
interface GeminiMessagePart {
  text: string;
}
interface GeminiHistoryMessage {
  role: "user" | "model"; // Gemini usa 'user' y 'model'
  parts: GeminiMessagePart[];
}

export function useChat() {
  // `messages` ahora almacenará el historial en el formato que espera Gemini para el envío
  // y también se usará para renderizar. Adaptaremos `role: "ai"` a `role: "model"` para consistencia.
  const messages = ref<GeminiHistoryMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function sendMessage(userMessageText: string) {
    error.value = null;

    // Añade el mensaje del usuario al historial local en el formato de Gemini
    const userMessageForHistory: GeminiHistoryMessage = {
      role: "user",
      parts: [{ text: userMessageText }],
    };
    messages.value.push(userMessageForHistory);

    loading.value = true;

    // Prepara el historial para enviar al backend.
    // No incluimos el último mensaje del usuario porque se envía por separado como 'message'.
    // El backend espera el historial *antes* del mensaje actual.
    // Si messages.value solo tiene el mensaje actual del usuario, historyForApi será un array vacío.
    const historyForApi = messages.value.slice(0, -1);

    try {
      const response = await $fetch<{ reply: string }>("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessageText, // El mensaje actual del usuario
          history: historyForApi,    // El historial de la conversación anterior
        }),
      });

      if (response && response.reply) {
        // Añade la respuesta de la IA al historial local en el formato de Gemini
        messages.value.push({
          role: "model", // Usamos 'model' para la IA, consistente con Gemini
          parts: [{ text: response.reply }],
        });
      } else {
        console.error("Respuesta inesperada del servidor:", response);
        error.value = "Error: Respuesta inválida del servidor.";
        messages.value.push({
          role: "model",
          parts: [{ text: "Error al recibir la respuesta." }],
        });
      }
    } catch (err: any) {
      console.error("Error llamando al endpoint /api/chat:", err);
      const errorMessage =
        err.data?.statusMessage || // Nuxt $fetch a menudo pone el error en err.data.statusMessage
        err.data?.message ||
        err.message ||
        "Error desconocido";
      error.value = `Error al obtener respuesta: ${errorMessage}`;
      messages.value.push({
        role: "model",
        parts: [
          {
            text: `Lo siento, ocurrió un error (${errorMessage}). Por favor, inténtalo de nuevo.`,
          },
        ],
      });
    } finally {
      loading.value = false;
    }
  }

  // Opcional: Añadir una función para limpiar el chat si es necesario
  function clearChat() {
    messages.value = [];
    error.value = null;
  }

  return {
    messages, // Este ahora es un array de GeminiHistoryMessage
    loading,
    error,
    sendMessage,
    clearChat, // Opcional
  };
}