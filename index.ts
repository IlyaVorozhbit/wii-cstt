const fs = require('fs').promises;

let currentSttTask: Promise<string | null> | null = null;

export function register(api: any) {
    const {apiKey, apiUrl, model, log, logErrors} = api.pluginConfig || {};
    const shouldLog = log === true;
    const shouldLogErrors = logErrors === true;

    if (!apiKey || !apiUrl || !model) {
        if (shouldLogErrors) console.error("❌ Please configure apiKey, apiUrl, and model in plugin config.");
    }

    const logFn = (msg: string) => shouldLog && console.log(msg);
    const logErrFn = (msg: string) => shouldLogErrors && console.error(msg);

    api.registerHook(
        "message",
        async (event: any) => {
            const mediaPath = event.context?.mediaPath;
            const mediaType = event.context?.mediaType;
            const mimeType = event.context?.mimeType;

            if (!mediaPath) return event;

            // Check that this is audio (not image/video)
            const normalizedMediaType = mediaType?.split(';')[0]?.trim();
            const normalizedMimeType = mimeType?.split(';')[0]?.trim();

            logFn(mediaType + " " + mimeType);
            const isAudio = normalizedMediaType === 'audio' || normalizedMediaType === 'voice' || normalizedMediaType?.startsWith('audio/') || normalizedMimeType?.startsWith('audio/');

            if (!isAudio) {
                logFn(`📷 This is ${mediaType || mimeType}, skipping STT — image will reach me directly`);
                return event;
            }

            logFn("🎤 Audio detected, starting STT in background...");

            currentSttTask = (async () => {
                try {
                    const audioBuffer = await fs.readFile(mediaPath);
                    const base64 = audioBuffer.toString("base64");

                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [{
                                role: "user",
                                content: [
                                    {
                                        type: "text",
                                        text: "Transcribe this audio to text. Output only the recognized text."
                                    },
                                    {type: "input_audio", input_audio: {data: base64, format: "ogg-opus"}}
                                ]
                            }],
                            max_tokens: 200,
                        }),
                    });

                    const result: any = await response.json();
                    return result.choices?.[0]?.message?.content?.trim() || null;
                } catch (error) {
                    logErrFn("❌ STT error: " + error);
                    return null;
                }
            })();

            return event;
        },
        {name: "custom-stt-trigger", description: "Initiates audio transcription"}
    );

    api.on("before_prompt_build", async () => {
        if (currentSttTask) {
            logFn("⏳ Waiting for STT response for prompt building...");
            const transcription = await currentSttTask;
            currentSttTask = null;

            if (transcription) {
                logFn("✅ STT complete! Injecting text into context: " + transcription);
                return {
                    prependContext: `\n[Voice message from user: "${transcription}"]\n`
                };
            }
        }
        return {};
    });
}
