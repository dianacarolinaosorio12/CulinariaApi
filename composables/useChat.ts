import { ref } from "vue"; // Importa la función 'ref' de Vue para crear referencias reactivas

export function useChat() {
  // Crea una referencia reactiva para almacenar los mensajes
  const messages = ref<{ role: string; content: string }[]>([]);
  // Crea una referencia reactiva para indicar si se está cargando
  const loading = ref(false);
  // Crea una referencia reactiva para almacenar errores, inicializada como nula
  const error = ref<string | null>(null);

  async function sendMessage(userMessage: string) {
    // Limpia errores previos
    error.value = null;

    // Añade el mensaje del usuario inmediatamente a la lista de mensajes
    messages.value.push({ role: "user", content: userMessage });
    // Indica que se está cargando
    loading.value = true;

    try {
      // Llama a TU PROPIO endpoint de API del servidor Nuxt
      const response = await $fetch<{ reply: string }>("/api/chat", {
        method: "POST", // Especifica el método HTTP como POST
        headers: {
          "Content-Type": "application/json", // Establece el tipo de contenido a JSON
        },
        // Envía el mensaje en el cuerpo, asegurándote que la clave coincida
        // con lo que espera readBody(event) en el servidor (ej: 'message')
        body: JSON.stringify({ message: userMessage }), // Convierte el mensaje del usuario a JSON
      });

      // Añade la respuesta recibida de tu API
      if (response && response.reply) {
        // Si la respuesta es válida, añade la respuesta de la IA a los mensajes
        messages.value.push({ role: "ai", content: response.reply });
      } else {
        // Manejo por si la respuesta no tiene el formato esperado
        console.error("Respuesta inesperada del servidor:", response); // Registra el error en la consola
        error.value = "Error: Respuesta inválida del servidor."; // Establece un mensaje de error
        messages.value.push({
          role: "ai",
          content: "Error al recibir la respuesta.", // Añade un mensaje de error a los mensajes
        });
      }
    } catch (err: any) {
      console.error("Error llamando al endpoint /api/chat:", err); // Registra el error en la consola
      // Intenta obtener un mensaje de error más útil del objeto de error de $fetch
      const errorMessage =
        err.data?.message || err.message || "Error desconocido"; // Extrae un mensaje de error útil
      error.value = `Error al obtener respuesta: ${errorMessage}`; // Establece el mensaje de error
      messages.value.push({
        role: "ai",
        content: `Lo siento, ocurrió un error (${errorMessage}). Por favor, inténtalo de nuevo.`, // Añade un mensaje de error a los mensajes
      });
    } finally {
      // Finalmente, indica que la carga ha terminado
      loading.value = false;
    }
  }

  // Retorna las referencias reactivas y la función para enviar mensajes
  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}