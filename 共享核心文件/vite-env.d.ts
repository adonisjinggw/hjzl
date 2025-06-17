/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAP_API_KEY: string
  readonly VITE_AMAP_SECURITY_CODE: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_RUNNINGHUB_API_KEY: string
  readonly VITE_DEEPAI_API_KEY: string
  readonly VITE_HUGGINGFACE_API_KEY: string
  readonly VITE_MIDJOURNEY_API_KEY: string
  readonly VITE_MAP_DEBUG: string
  readonly VITE_API_DEBUG: string
  readonly VITE_DEFAULT_MAP_PROVIDER: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 