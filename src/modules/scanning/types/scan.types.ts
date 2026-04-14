export interface ScanRecognition {
    food_label?: string;
    confidence?: string;
    cosine_distance?: number;
}

export interface ScanLlmMeta {
    model?: string;
    tokens_used?: number;
    latency_ms?: number;
    attempt?: number;
}

export interface ScanSourceData {
    story?: string;
    ingredients?: string;
}

export interface ScanPredictResponse {
    status: string;
    recognition?: ScanRecognition;
    content: string | Record<string, unknown>;
    llm_meta?: ScanLlmMeta;
    source_data?: ScanSourceData;
    message?: string;
}

export interface ScanPredictResult
    extends Omit<ScanPredictResponse, 'content'> {
    content: string;
}
