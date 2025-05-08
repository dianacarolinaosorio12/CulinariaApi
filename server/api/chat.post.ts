// server/api/chat.post.ts
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// --- Constante para la instrucción de brevedad ---
// Puedes mantenerla aquí o pasarla desde el frontend si quieres más flexibilidad
const BRIEF_INSTRUCTION =
  "Por favor, responde de forma corta, detallada y coherente a cada pregunta y responde  y ten el hilo de la conversacion(sin pasarte de 1200 tokens, y no dejes la conversacion sin terminar tu objetivo de responder precisamente ). \n responde preguntas de culinaria, recetas y todo lo que tenga que ver con cocina. \n\n";
  // Aca es el promt, la forma en la que deseas que responda y asi

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event); // Usar useRuntimeConfig CON el evento en el servidor
  const apiKey = runtimeConfig.geminiApiKey; // Accede a la clave segura del servidor

  if (!apiKey) {
    console.error(
      "SERVER ERROR: La clave API de Gemini no está configurada en el servidor."
    );
    // Es mejor lanzar un error que el cliente pueda interpretar
    throw createError({
      statusCode: 50000,
      statusMessage: "Error de configuración del servidor: falta la clave API.",
    });
  }

  // Lee el mensaje del cuerpo de la solicitud POST
  const body = await readBody(event);
  const userMessage = body?.message; // Asegúrate que el frontend envía 'message'

  if (!userMessage || typeof userMessage !== "string") {
    throw createError({
      statusCode: 400, // Bad Request
      statusMessage: "Mensaje de usuario no proporcionado o inválido.",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey); // Inicializa la instancia de GoogleGenerativeAI con la clave API

    // Aca ya configuraciones de las respuestas como el maximo de tokens, por eso no nos saca una lista de pollo asado XD
    const generationConfig = {
      maxOutputTokens: 500, // Puedes ajustar esto aquí también
      // temperature: 0.7, // Controla la aleatoriedad de la respuesta
      // topP: 0.95, // Controla la diversidad de la respuesta
      // topK: 40, // Limita el número de opciones consideradas
    };

    // Considera añadir configuraciones de seguridad si es necesario
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT, // Categoría de acoso
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Umbral de bloqueo medio y superior
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, // Categoría de discurso de odio
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Umbral de bloqueo medio y superior
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, // Categoría de contenido sexualmente explícito
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Umbral de bloqueo medio y superior
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, // Categoría de contenido peligroso
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, // Umbral de bloqueo medio y superior
      },
    ];

    // Aca ya informacion del modelo que desas usar de gimini y su configuracion
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Especifica el modelo de IA a utilizar
      generationConfig, // Configuración de generación
      safetySettings, // Configuraciones de seguridad
    });

    const fullPrompt = BRIEF_INSTRUCTION + userMessage; // Combina la instrucción de brevedad con el mensaje del usuario

    console.log("SERVER: Enviando prompt a Gemini:", fullPrompt); // Log para seguimiento

    const result = await model.generateContent(fullPrompt); // Genera contenido basado en el prompt
    const aiResponse = result.response.text(); // Extrae la respuesta de la IA

    console.log("SERVER: Respuesta recibida de Gemini."); // Log para seguimiento

    // Devuelve solo la respuesta como JSON
    return { reply: aiResponse }; // Retorna la respuesta generada
  } catch (error: any) {
    console.error("SERVER ERROR: Error al llamar a la API de Gemini:", error); // Log del error
    // Devuelve un error genérico al cliente
    throw createError({
      statusCode: 500,
      statusMessage: `Error al comunicarse con el servicio de IA: ${
        error.message || "Error desconocido"
      }`, // Mensaje de error para el cliente
    });
  }
});
