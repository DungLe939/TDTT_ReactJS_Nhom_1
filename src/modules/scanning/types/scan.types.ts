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

/**
 * Một món ăn đơn lẻ trong kết quả nhận diện multi-food.
 */
export interface ScanFoodItem {
    recognition?: ScanRecognition;
    content: string;
    source_data?: ScanSourceData;
}

/**
 * Response từ API khi nhận diện nhiều món ăn trong 1 ảnh.
 * Có backward-compatible: vẫn chứa các field cũ (recognition, content, source_data)
 * cho món chính xác nhất.
 */
export interface ScanMultiPredictResponse extends ScanPredictResponse {
    results?: ScanFoodItem[];
    primary_index?: number;
}

export interface ScanMultiPredictResult
    extends Omit<ScanMultiPredictResponse, 'content'> {
    content: string;
}

// ── Types cho /predict_multi và /predict_object ──

/**
 * Một object được detect bởi YOLO + CLIP trong /predict_multi.
 */
export interface ScanDetectedObject {
    object_id: number;
    bbox: [number, number, number, number];
    crop_b64: string;
    food_label: string;
    clip_sim: string;
    quantity?: number;
    story?: string;
    ingredients?: string;
}

/**
 * Response từ POST /predict_multi.
 */
export interface ScanMultiDetectResponse {
    status: string;
    image_size: [number, number];
    original_b64: string;
    objects: ScanDetectedObject[];
}

/**
 * Response từ POST /predict_object.
 */
export interface ScanObjectDetailResponse {
    status: string;
    recognition: ScanRecognition;
    content: string;
    llm_meta?: ScanLlmMeta;
}

