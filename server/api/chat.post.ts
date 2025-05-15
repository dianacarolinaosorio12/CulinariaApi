// server/api/chat.post.ts
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  // Importa el tipo para el historial si lo vas a tipar estrictamente
  // import type { Content } from "@google/generative-ai";
} from "@google/generative-ai";

// --- Instrucción del sistema ---
// Esta instrucción puede ser el primer mensaje en el historial
// o una configuración especial si la API lo permite directamente.
// Por ahora, la incluiremos como el primer mensaje del historial
// si el historial está vacío (primera interacción).
const SYSTEM_INSTRUCTION =
  "Eres un asistente experto en culinaria. Por favor, responde de forma concisa pero detallada y coherente a cada pregunta. Mantén el hilo de la conversación y enfócate en temas de cocina, recetas, técnicas culinarias, ingredientes, etc. Intenta que tus respuestas no superen los 1200 tokens y asegúrate de completar tus explicaciones de manera precisa.";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const apiKey = runtimeConfig.geminiApiKey;

  if (!apiKey) {
    console.error(
      "SERVER ERROR: La clave API de Gemini no está configurada en el servidor."
    );
    throw createError({
      statusCode: 500, // Internal Server Error
      statusMessage: "Error de configuración del servidor: falta la clave API.",
    });
  }

  // Lee el mensaje y el historial del cuerpo de la solicitud POST
  const body = await readBody(event);
  const userMessage = body?.message;
  // El frontend debe enviar el historial como un array de objetos
  // con formato { role: "user" | "model", parts: [{ text: "..." }] }
  let history = body?.history || []; // Asegúrate que el frontend envía 'history'

  if (!userMessage || typeof userMessage !== "string") {
    throw createError({
      statusCode: 400, // Bad Request
      statusMessage: "Mensaje de usuario no proporcionado o inválido.",
    });
  }

  // Validar que el historial sea un array
  if (!Array.isArray(history)) {
    console.warn("SERVER WARNING: El historial recibido no es un array. Se usará un historial vacío.");
    history = [];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig = {
      maxOutputTokens: 1200, // Ajustado según tu instrucción
      // temperature: 0.7,
      // topP: 0.95,
      // topK: 40,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // "gemini-1.0-pro" o "gemini-1.5-flash-latest" son buenos para chat
      generationConfig,
      safetySettings,
    });

    // Si el historial está vacío y es la primera interacción,
    // podemos añadir la instrucción del sistema como el primer "turno" del usuario,
    // y una respuesta modelo de "entendido" para que el chat comience correctamente.
    // El frontend también podría manejar esto enviando un historial inicial.
    const chatHistoryForGemini = [...history]; // Copiamos para no modificar el original que podría venir del cliente

    if (chatHistoryForGemini.length === 0 && SYSTEM_INSTRUCTION) {
      chatHistoryForGemini.push(
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: "model", parts: [{ text: "Entendido. Estoy listo para ayudarte con tus preguntas sobre cocina." }] }
      );
    }

    console.log("SERVER: Iniciando chat con historial:", JSON.stringify(chatHistoryForGemini, null, 2));
    console.log("SERVER: Enviando nuevo mensaje a Gemini:", userMessage);

    // Iniciar el chat con el historial
    const chat = model.startChat({
      history: chatHistoryForGemini,
      generationConfig, // Puedes pasar generationConfig aquí también si no lo hiciste en getGenerativeModel
      // safetySettings, // Ídem para safetySettings
    });

    // Enviar el nuevo mensaje del usuario
    const result = await chat.sendMessage(userMessage);
    const aiResponse = result.response.text();

    console.log("SERVER: Respuesta recibida de Gemini.");

    return { reply: aiResponse };
  } catch (error: any) {
    console.error("SERVER ERROR: Error al llamar a la API de Gemini:", error);
    let errorMessage = "Error desconocido al comunicarse con el servicio de IA.";
    if (error.message) {
      errorMessage = error.message;
    }
    // Si el error tiene una respuesta con detalles, podríamos usarlos
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        errorMessage = error.response.data.error.message;
    }

    throw createError({
      statusCode: 500, // Internal Server Error
      statusMessage: `Error al comunicarse con el servicio de IA: ${errorMessage}`,
    });
  }
});