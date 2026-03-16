export const TTS_CONFIG = {
  elevenlabs_agent_voice: {
    model_id: "eleven_multilingual_v2",
    voice: {
      voice_id: "ErXwobaYiN019PkySvjV", // "Antony" voice ID
      gender: "male",
      language: "pt-BR",
      description: "Voz do Antony - Natural, Multilíngue e Profissional"
    },
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    },
    speech_engine: {
      force_language: "pt-BR",
      always_portuguese: true,
      emotion_engine: true,
      emotion_default: "calm_confident",
      speech_speed: 0.96,
      pitch_adjustment: -1,
      intonation_variation: 0.45,
      pause_between_sentences_ms: 220
    },
    realism_enhancement: {
      human_breathing: true,
      micro_pauses: true,
      dynamic_emotion: true,
      context_awareness: true
    },
    audio_output: {
      format: "mp3",
      bitrate: 128,
      sample_rate: 44100,
      normalize_audio: true,
      noise_reduction: true
    },
    agent_rules: [
      "Sempre responder em português brasileiro",
      "Nunca usar voz feminina",
      "Manter tom masculino natural e profissional",
      "Evitar ritmo robótico",
      "Falar de forma clara e agradável"
    ],
    latency_optimization: {
      low_latency_mode: true,
      stream_audio: true,
      response_buffer_ms: 120
    }
  }
};
