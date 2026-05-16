import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Camera,
  CameraOff,
  ChefHat,
  Clock3,
  Cpu,
  Lightbulb,
  Loader2,
  Mic2,
  RefreshCcw,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { FileUpload } from '../common/components/FileUpload';
import { LoadingModal } from '../common/components/LoadingModal';
import { scanService, menuScanService } from '../services/api';
import type { ScanMultiPredictResult, ScanFoodItem, ScanDetectedObject, ScanObjectDetailResponse } from '../modules/scanning/types/scan.types';
import {
  parseCommaList,
  parseScanContent,
} from '../modules/scanning/utils/scan-content';

type CaptureMode = 'camera' | 'upload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'user' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
};

const CAMERA_FALLBACK_CONSTRAINTS: MediaStreamConstraints = {
  video: true,
  audio: false,
};

const getServiceStatusLabel = (status: unknown) => {
  if (typeof status !== 'string') {
    return 'Hệ thống đang hoạt động ổn định';
  }

  const normalized = status.trim().toLowerCase();

  if (['healthy', 'ok', 'success', 'ready'].includes(normalized)) {
    return 'Hệ thống đang hoạt động ổn định';
  }

  if (['degraded', 'warning', 'partial'].includes(normalized)) {
    return 'Hệ thống vẫn hoạt động, nhưng có thể phản hồi chậm';
  }

  if (['down', 'error', 'failed', 'unavailable'].includes(normalized)) {
    return 'Hệ thống đang gặp sự cố, vui lòng thử lại sau';
  }

  return 'Hệ thống đang hoạt động';
};

const getModelStateLabel = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'sẵn sàng' : 'đang cập nhật';
  }

  if (typeof value === 'number') {
    return value > 0 ? 'sẵn sàng' : 'đang cập nhật';
  }

  if (isRecord(value)) {
    if (typeof value.status === 'string') {
      return value.status;
    }

    if (typeof value.ready === 'boolean') {
      return value.ready ? 'sẵn sàng' : 'đang cập nhật';
    }

    if (typeof value.available === 'boolean') {
      return value.available ? 'sẵn sàng' : 'đang cập nhật';
    }
  }

  return 'đang cập nhật';
};

const buildHealthSummary = (systemName: string, health: unknown) => {
  if (!isRecord(health)) {
    return `${systemName}: Hệ thống đang hoạt động.`;
  }

  const statusLabel = getServiceStatusLabel(health.status);
  const models = isRecord(health.models) ? Object.entries(health.models) : [];

  if (models.length === 0) {
    return `${systemName}: ${statusLabel}.`;
  }

  const modelDetails = models
    .slice(0, 2)
    .map(([name, value]) => `${name}: ${getModelStateLabel(value)}`)
    .join(' | ');

  return `${systemName}: ${statusLabel}. ${modelDetails}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof DOMException) {
    if (error.name === 'NotReadableError') {
      return 'Camera đang được ứng dụng khác sử dụng. Hãy tắt Zoom/Meet/Teams rồi thử lại.';
    }

    if (error.name === 'NotAllowedError') {
      return 'Bạn chưa cấp quyền camera cho trình duyệt. Hãy cho phép quyền rồi thử lại.';
    }

    if (error.name === 'NotFoundError') {
      return 'Không tìm thấy camera trên thiết bị.';
    }
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Hệ thống phản hồi chậm hơn bình thường. Bạn hãy thử lại với ảnh nhỏ hơn.';
    }

    const payload = error.response?.data as
      | { detail?: unknown; message?: unknown }
      | undefined;

    if (typeof payload?.detail === 'string' && payload.detail.trim()) {
      return payload.detail;
    }

    if (Array.isArray(payload?.detail)) {
      const detailLines = payload.detail
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }

          if (item && typeof item === 'object') {
            const detailMessage = (item as { msg?: unknown }).msg;
            if (typeof detailMessage === 'string' && detailMessage.trim()) {
              return detailMessage;
            }
          }

          return '';
        })
        .filter(Boolean);

      if (detailLines.length > 0) {
        return detailLines.join(' | ');
      }
    }

    if (payload?.detail && typeof payload.detail === 'object') {
      const serialized = JSON.stringify(payload.detail);
      if (serialized && serialized !== '{}') {
        return serialized;
      }
    }

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối tới máy chủ phân tích. Vui lòng thử lại sau ít phút.';
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const parseConfidencePercent = (value?: string) => {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value.replace('%', ''));
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(100, Math.max(0, parsed));
};

const formatLatency = (latency?: number) => {
  if (!latency || latency <= 0) {
    return 'N/A';
  }

  if (latency >= 1000) {
    return `${(latency / 1000).toFixed(2)}s`;
  }

  return `${latency}ms`;
};

const formatTokens = (tokens?: number) => {
  if (!tokens || tokens <= 0) {
    return 'N/A';
  }

  return tokens.toLocaleString('vi-VN');
};

const isPredictSuccess = (result: ScanMultiPredictResult) => {
  const normalizedStatus = String(result.status || '')
    .trim()
    .toLowerCase();

  if (
    normalizedStatus === 'success' ||
    normalizedStatus === 'ok' ||
    normalizedStatus === 'true' ||
    normalizedStatus === '200'
  ) {
    return true;
  }

  // Fallback: một số backend trả payload đúng nhưng không có status chuẩn
  if (result.content.trim() || result.recognition?.food_label) {
    return true;
  }

  // Multi-food: nếu có results array thì coi như thành công
  if (result.results && result.results.length > 0) {
    return true;
  }

  return false;
};

export const FoodScan = () => {
  const navigate = useNavigate();
  const [isMenuScanning, setIsMenuScanning] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanMultiPredictResult | null>(null);

  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [apiCheckSummary, setApiCheckSummary] = useState<string | null>(null);

  const [showFullStory, setShowFullStory] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState<ScanDetectedObject[]>([]);
  const [objectDetailsCache, setObjectDetailsCache] = useState<Record<number, ScanObjectDetailResponse>>({});
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const predictAbortRef = useRef<AbortController | null>(null);
  const audioAbortRef = useRef<AbortController | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }, []);

  const clearAudio = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, []);

  const setNewSelectedFile = useCallback(
    (file: File) => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      setSelectedFile(file);
    },
    []
  );

  const bindStreamToVideo = useCallback(async (stream: MediaStream) => {
    if (stream.getVideoTracks().length === 0) {
      return false;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      return false;
    }

    stream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });

    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;

    try {
      await videoElement.play();
    } catch {
      // Vẫn giữ stream vì một số máy trả lỗi play() giả dù camera đã live.
    }

    return stream.getVideoTracks()[0]?.readyState === 'live';
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt này không hỗ trợ camera. Hãy chuyển sang upload ảnh.');
      return;
    }

    setIsStartingCamera(true);
    setCameraError(null);

    try {
      stopCamera();

      const attemptConstraints: MediaStreamConstraints[] = [
        CAMERA_CONSTRAINTS,
        CAMERA_FALLBACK_CONSTRAINTS,
      ];

      let lastError: unknown = null;

      for (let index = 0; index < attemptConstraints.length; index += 1) {
        const constraints = attemptConstraints[index];

        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          const isBound = await bindStreamToVideo(stream);
          if (!isBound) {
            stream.getTracks().forEach((track) => track.stop());
            continue;
          }

          streamRef.current = stream;
          setIsCameraActive(true);
          setCameraError(null);

          if (index > 0) {
            toast.info('Đã chuyển sang cấu hình camera tương thích hơn.');
          }

          window.setTimeout(() => {
            if (
              streamRef.current === stream &&
              videoRef.current &&
              videoRef.current.videoWidth === 0
            ) {
              setCameraError('Camera đã bật nhưng hình lên chậm. Nếu vẫn đen, hãy đóng ứng dụng khác đang dùng camera rồi thử lại.');
            }
          }, 2200);

          return;
        } catch (candidateError) {
          lastError = candidateError;
        }
      }

      throw lastError || new Error('Không thể hiển thị hình ảnh từ camera.');
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Không thể bật camera. Hãy cho phép camera hoặc chuyển sang upload ảnh.'
      );
      setCameraError(message);
      toast.error(message);
    } finally {
      setIsStartingCamera(false);
    }
  }, [bindStreamToVideo, stopCamera]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !isCameraActive) {
      toast.error('Camera chưa sẵn sàng để chụp.');
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext('2d');
    if (!context) {
      toast.error('Không thể xử lý ảnh vừa chụp.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });

    if (!blob) {
      toast.error('Không thể tạo tệp ảnh từ camera.');
      return;
    }

    const file = new File([blob], `scan-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    setNewSelectedFile(file);
    toast.success('Đã chụp xong. Bạn có thể bấm phân tích ngay.');
  }, [isCameraActive, setNewSelectedFile]);

  /**
   * Load chi tiết (story + TTS) cho 1 object cụ thể từ /predict_object.
   * Tự động cache kết quả để không gọi lại.
   */
  const loadObjectDetail = useCallback(async (objectIndex: number, objects: ScanDetectedObject[]) => {
    const obj = objects[objectIndex];
    if (!obj) return;

    setIsLoadingDetail(true);
    try {
      const detail = await scanService.getObjectDetail(obj.crop_b64);

      // Cache kết quả
      setObjectDetailsCache(prev => ({ ...prev, [objectIndex]: detail }));

      // Cập nhật scanResult để phần hiển thị story/audio hoạt động
      setScanResult({
        status: detail.status,
        recognition: detail.recognition,
        content: detail.content,
      });

      toast.success(`Đã tải thông tin "${detail.recognition?.food_label || obj.food_label}".`);

      // Pre-fetch audio ngay để tránh bị ghi đè trên server khi chuyển tab
      try {
        const audioBlob = await scanService.fetchNarrationAudio();
        const url = URL.createObjectURL(audioBlob);
        setAudioCache(prev => ({ ...prev, [objectIndex]: url }));
      } catch (err) {
        console.warn('Lỗi tải trước audio:', err);
      }
    } catch (error) {
      if (!axios.isAxiosError(error) || error.code !== 'ERR_CANCELED') {
        const message = getErrorMessage(error, 'Không thể tải chi tiết món ăn.');
        toast.error(message);
      }
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  /**
   * Handler khi user click vào tab món ăn khác.
   * Nếu detail đã cache thì dùng luôn, nếu chưa thì gọi API.
   */
  const handleTabClick = useCallback((index: number) => {
    setActiveResultIndex(index);
    setShowFullStory(false);
    clearAudio();

    // Nếu đã cache thì set scanResult từ cache
    const cached = objectDetailsCache[index];
    if (cached) {
      setScanResult({
        status: cached.status,
        recognition: cached.recognition,
        content: cached.content,
      });
    } else if (detectedObjects.length > 0) {
      // Chưa cache → gọi API
      loadObjectDetail(index, detectedObjects);
    }
  }, [clearAudio, detectedObjects, loadObjectDetail, objectDetailsCache]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      toast.warning('Hãy chọn ảnh trước khi phân tích.');
      return;
    }

    // Tắt camera khi bắt đầu phân tích
    if (isCameraActive) {
      stopCamera();
    }

    predictAbortRef.current?.abort();
    const controller = new AbortController();
    predictAbortRef.current = controller;

    clearAudio();
    setAudioError(null);
    setScanResult(null);
    setShowFullStory(false);
    setActiveResultIndex(0);
    setDetectedObjects([]);
    setObjectDetailsCache({});
    setAudioCache({});
    setIsAnalyzing(true);

    try {
      // Bước 1: Detect nhiều món bằng YOLO + CLIP
      const detectResult = await scanService.detectMultiFoods(selectedFile, controller.signal);

      if (detectResult.status !== 'success' || !detectResult.objects?.length) {
        throw new Error('Không nhận diện được món ăn nào trong ảnh.');
      }

      // Gộp các món ăn bị trùng tên và đếm số lượng (chỉ giữ lại 1 tab cho 1 loại món)
      const groupedObjects = detectResult.objects.reduce((acc, obj) => {
        const existing = acc.find(item => item.food_label === obj.food_label);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          acc.push({ ...obj, quantity: 1 });
        }
        return acc;
      }, [] as typeof detectResult.objects);

      setDetectedObjects(groupedObjects);

      // Bước 2: Auto-load chi tiết cho món đầu tiên
      const firstObj = groupedObjects[0];
      const firstDetail = await scanService.getObjectDetail(firstObj.crop_b64, controller.signal);

      setObjectDetailsCache({ 0: firstDetail });
      setScanResult({
        status: firstDetail.status,
        recognition: firstDetail.recognition,
        content: firstDetail.content,
      });

      // Pre-fetch audio cho món đầu tiên
      try {
        const audioBlob = await scanService.fetchNarrationAudio(controller.signal);
        const url = URL.createObjectURL(audioBlob);
        setAudioCache({ 0: url });
      } catch (err) {
        console.warn('Lỗi tải trước audio món đầu tiên:', err);
      }

      const totalFoods = groupedObjects.length;
      toast.success(
        totalFoods > 1
          ? `Nhận diện được ${totalFoods} loại món ăn! Bấm vào tab để xem chi tiết.`
          : 'Nhận diện thành công. Bạn có thể nghe thuyết minh ngay.'
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
        return;
      }

      const message = getErrorMessage(error, 'Không thể phân tích ảnh vào lúc này.');
      toast.error(message);
    } finally {
      if (predictAbortRef.current === controller) {
        predictAbortRef.current = null;
      }
      setIsAnalyzing(false);
    }
  }, [clearAudio, isCameraActive, loadObjectDetail, selectedFile, stopCamera]);

  const handleMenuScan = useCallback(async () => {
    if (!selectedFile) {
      toast.warning('Hãy chọn ảnh Menu trước khi phân tích.');
      return;
    }

    if (isCameraActive) {
      stopCamera();
    }

    setIsMenuScanning(true);
    try {
      const response = await menuScanService.scanMenuImage(selectedFile);
      if (response.success && response.text) {
        toast.success('Trích xuất Menu thành công! Đang chuyển trang...');
        navigate('/menu', { state: { autoTranslateText: response.text } });
      } else {
        throw new Error('Không thể trích xuất văn bản từ Menu này.');
      }
    } catch (error) {
      toast.error('Lỗi quét Menu: Vui lòng thử lại với ảnh rõ nét hơn.');
    } finally {
      setIsMenuScanning(false);
    }
  }, [selectedFile, isCameraActive, stopCamera, navigate]);

  const handleFetchAudio = useCallback(async () => {
    if (!scanResult) {
      toast.warning('Hãy phân tích ảnh trước khi nghe thuyết minh.');
      return;
    }

    // Nếu đã có sẵn audio cho tab hiện tại trong cache
    const cachedUrl = audioCache[activeResultIndex];
    if (cachedUrl) {
      setAudioUrl(cachedUrl);
      setIsAudioLoading(false);
      setAudioError(null);
      return;
    }

    audioAbortRef.current?.abort();
    const controller = new AbortController();
    audioAbortRef.current = controller;

    setIsAudioLoading(true);
    setAudioError(null);
    clearAudio();

    try {
      const blob = await scanService.fetchNarrationAudio(controller.signal);
      if (!blob.size) {
        throw new Error('Server trả về file audio rỗng.');
      }

      const nextAudioUrl = URL.createObjectURL(blob);
      audioUrlRef.current = nextAudioUrl;
      setAudioUrl(nextAudioUrl);

      toast.success('Đã chuẩn bị xong bản thuyết minh âm thanh.');

      requestAnimationFrame(() => {
        void audioPlayerRef.current?.play().catch(() => undefined);
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
        return;
      }

      const message = getErrorMessage(error, 'Không thể tải bản thuyết minh âm thanh.');
      setAudioError(message);
      toast.error(message);
    } finally {
      if (audioAbortRef.current === controller) {
        audioAbortRef.current = null;
      }
      setIsAudioLoading(false);
    }
  }, [clearAudio, scanResult]);

  const handleCheckApiConnection = useCallback(async () => {
    setIsCheckingApi(true);

    try {
      const [systemInfo, health] = await Promise.all([
        scanService.getSystemInfo(),
        scanService.getHealth(),
      ]);

      const systemName =
        typeof systemInfo.name === 'string' && systemInfo.name.trim()
          ? systemInfo.name.replace(/\s*api\s*$/i, '').trim() || 'Hệ thống quét món'
          : 'Hệ thống quét món';

      const summary = buildHealthSummary(systemName, health);
      setApiCheckSummary(summary);
      toast.success('Đã cập nhật trạng thái hệ thống.');
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Không thể kiểm tra trạng thái hệ thống lúc này.'
      );
      setApiCheckSummary(`Lỗi: ${message}`);
      toast.error(message);
    } finally {
      setIsCheckingApi(false);
    }
  }, []);

  const resetSession = useCallback(() => {
    predictAbortRef.current?.abort();
    audioAbortRef.current?.abort();

    setIsAnalyzing(false);
    setIsAudioLoading(false);
    setScanResult(null);
    setAudioError(null);
    setShowFullStory(false);
    setActiveResultIndex(0);
    setDetectedObjects([]);
    setObjectDetailsCache({});
    setAudioCache({});
    setIsLoadingDetail(false);
    setCameraError(null);
    clearAudio();
    clearPreview();
  }, [clearAudio, clearPreview]);

  useEffect(() => {
    if (captureMode !== 'camera') {
      stopCamera();
    }
  }, [captureMode, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      predictAbortRef.current?.abort();
      audioAbortRef.current?.abort();

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [stopCamera]);

  // Danh sách các món ăn nhận diện được
  const foodItems: ScanFoodItem[] = useMemo(() => {
    // Multi-detect flow: derive from detectedObjects + cached details
    if (detectedObjects.length > 0) {
      return detectedObjects.map((obj, idx) => {
        const baseLabel = objectDetailsCache[idx]?.recognition?.food_label || obj.food_label;
        const displayLabel = obj.quantity && obj.quantity > 1 ? `${baseLabel} (${obj.quantity})` : baseLabel;

        return {
          recognition: {
            food_label: displayLabel,
            confidence: objectDetailsCache[idx]?.recognition?.confidence || obj.clip_sim,
          },
          content: objectDetailsCache[idx]?.content ?? '',
        };
      });
    }
    // Single /predict flow (backward compat)
    if (!scanResult) return [];
    if (scanResult.results && scanResult.results.length > 0) {
      return scanResult.results;
    }
    return [{
      recognition: scanResult.recognition,
      content: scanResult.content,
      source_data: scanResult.source_data,
    }];
  }, [detectedObjects, objectDetailsCache, scanResult]);

  const activeItem = foodItems[activeResultIndex] ?? foodItems[0] ?? null;

  const parsedContent = useMemo(
    () => parseScanContent(activeItem?.content ?? ''),
    [activeItem?.content]
  );

  const storyParagraphs = useMemo(() => {
    if (parsedContent.culturalStory.length > 0) {
      return parsedContent.culturalStory;
    }

    if (activeItem?.source_data?.story) {
      return [activeItem.source_data.story];
    }

    return parsedContent.intro;
  }, [parsedContent, activeItem?.source_data?.story]);

  const ingredients = useMemo(() => {
    if (parsedContent.ingredients.length > 0) {
      return parsedContent.ingredients;
    }

    return parseCommaList(activeItem?.source_data?.ingredients);
  }, [parsedContent.ingredients, activeItem?.source_data?.ingredients]);

  const confidence = parseConfidencePercent(activeItem?.recognition?.confidence);
  const visibleStory = showFullStory
    ? storyParagraphs
    : storyParagraphs.slice(0, 2);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-orange-100 dark:border-white/10 bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full bg-orange-200/50 dark:bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/50 dark:bg-amber-500/10 blur-3xl" />

      {!scanResult ? (
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quét Món Thông Minh</h1>
                <p className="text-sm text-neutral-600 dark:text-gray-400">
                  Chụp ảnh hoặc upload ảnh món ăn để nhận diện và nghe bản thuyết minh.
                </p>
              </div>
            </div>

            <div className="mt-5 inline-flex rounded-2xl border border-orange-200 bg-orange-50 p-1">
              <button
                type="button"
                onClick={() => setCaptureMode('camera')}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition ${captureMode === 'camera'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Chụp ảnh
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCaptureMode('upload')}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition ${captureMode === 'upload'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" /> Upload ảnh
                </span>
              </button>
            </div>

            {captureMode === 'camera' ? (
              <div className="mt-5 space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
                  <video
                    ref={videoRef}
                    className="h-[22rem] w-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-700 text-center text-white">
                      <div className="space-y-2 px-6">
                        <Camera className="mx-auto h-10 w-10 text-orange-300" />
                        <p className="font-semibold">Camera đang tạm dừng</p>
                        <p className="text-sm text-white/80">
                          Bấm "Bật camera" để chụp ảnh món ăn trực tiếp.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-orange-300" />
                    <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-orange-300" />
                    <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-orange-300" />
                    <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-orange-300" />
                  </div>
                </div>

                {cameraError && (
                  <p className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {cameraError}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={isStartingCamera}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isStartingCamera ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {isStartingCamera ? 'Đang bật camera...' : 'Bật camera'}
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraActive}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    Chụp món ăn
                  </button>

                  {isCameraActive && (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-white/20 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-gray-300 transition hover:bg-neutral-100 dark:hover:bg-slate-700"
                    >
                      <CameraOff className="h-4 w-4" />
                      Tắt camera
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <FileUpload
                  onFileSelect={setNewSelectedFile}
                  onClear={clearPreview}
                  accept="image/*"
                  preview
                />
              </div>
            )}

            {previewUrl && (
              <div className="mt-5 rounded-2xl border border-orange-100 dark:border-white/10 bg-orange-50/80 dark:bg-orange-950/20 p-4">
                <p className="text-sm font-semibold text-neutral-800 dark:text-white">Ảnh đã sẵn sàng</p>
                <div className="mt-3 flex gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="text-sm text-neutral-600 dark:text-gray-400">
                    <p className="font-medium text-neutral-800 dark:text-white">{selectedFile?.name}</p>
                    <p>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                    <button
                      type="button"
                      onClick={clearPreview}
                      className="mt-2 cursor-pointer text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700"
                    >
                      Xóa ảnh và chọn lại
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing || isMenuScanning}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                Phân tích món ăn
              </button>

              <button
                type="button"
                onClick={handleMenuScan}
                disabled={!selectedFile || isAnalyzing || isMenuScanning}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMenuScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                Trích xuất chữ
              </button>

              <button
                type="button"
                onClick={resetSession}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-white/20 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-gray-300 transition hover:bg-neutral-100 dark:hover:bg-slate-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Đặt lại
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 p-5 shadow-sm backdrop-blur sm:p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Cách sử dụng</h2>
            <ol className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-gray-400">
              <li className="rounded-xl border border-orange-100 dark:border-white/10 bg-orange-50/70 dark:bg-orange-950/20 p-3">
                <p className="font-semibold text-neutral-800 dark:text-white">1. Chọn ảnh món ăn</p>
                <p className="mt-1">Dùng camera hoặc upload tệp ảnh từ thư viện.</p>
              </li>
              <li className="rounded-xl border border-orange-100 dark:border-white/10 bg-orange-50/70 dark:bg-orange-950/20 p-3">
                <p className="font-semibold text-neutral-800 dark:text-white">2. Bấm phân tích</p>
                <p className="mt-1">Hệ thống nhận diện món và tạo câu chuyện thưởng thức.</p>
              </li>
              <li className="rounded-xl border border-orange-100 dark:border-white/10 bg-orange-50/70 dark:bg-orange-950/20 p-3">
                <p className="font-semibold text-neutral-800 dark:text-white">3. Nghe thuyết minh</p>
                <p className="mt-1">Bản âm thanh sẽ tự đọc lại nội dung vừa tạo.</p>
              </li>
            </ol>

            <div className="mt-5 rounded-2xl border border-amber-300 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <p className="font-semibold text-amber-900 dark:text-amber-200">Trạng thái hệ thống</p>
              <p className="mt-1">
                Nếu ứng dụng phản hồi chậm, bạn có thể kiểm tra nhanh kết nối tại đây.
              </p>

              <button
                type="button"
                onClick={handleCheckApiConnection}
                disabled={isCheckingApi}
                className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingApi ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isCheckingApi ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối'}
              </button>

              {apiCheckSummary && (
                <p className="mt-2 break-all text-xs text-amber-900">{apiCheckSummary}</p>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="relative z-10 space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-orange-100 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="relative h-64 bg-neutral-900 sm:h-72">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Scanned food"
                  className="h-full w-full object-cover opacity-85"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/70">
                  Không có ảnh hiển thị
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

              <button
                type="button"
                onClick={resetSession}
                className="absolute left-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
              >
                <RefreshCcw className="h-4 w-4" />
                Quét lại
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-sm text-white/80">
                  {foodItems.length > 1 ? `Nhận diện được ${foodItems.length} món ăn` : 'Món ăn được nhận diện'}
                </p>
                <h1 className="text-3xl font-bold">
                  {activeItem?.recognition?.food_label || 'Không rõ tên món'}
                </h1>
                <p className="mt-2 text-sm text-white/80">
                  Độ tin cậy: {activeItem?.recognition?.confidence || 'N/A'}
                </p>
              </div>
            </div>

            {foodItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-1">
                {foodItems.map((item, index) => (
                  <button
                    key={`food-tab-${item.recognition?.food_label ?? index}`}
                    type="button"
                    onClick={() => handleTabClick(index)}
                    className={`cursor-pointer shrink-0 rounded-2xl border px-4 py-3 text-left transition-all ${
                      index === activeResultIndex
                        ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 dark:border-orange-500/50 shadow-sm'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:border-orange-200 dark:hover:border-orange-500/30'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${
                      index === activeResultIndex ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-700 dark:text-gray-300'
                    }`}>
                      {item.recognition?.food_label || `Món ${index + 1}`}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      index === activeResultIndex ? 'text-orange-500/80 dark:text-orange-400/60' : 'text-neutral-500 dark:text-gray-500'
                    }`}>
                      {item.recognition?.confidence || 'N/A'}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-semibold text-neutral-700 dark:text-white">Độ tin cậy nhận diện</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-neutral-600">{confidence.toFixed(1)}%</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-slate-800 p-4">
                <p className="text-sm font-semibold text-neutral-700 dark:text-white">Thông tin xử lý</p>
                <div className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-gray-400">
                  <p className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-orange-500" />
                    Mô hình: {scanResult.llm_meta?.model || 'N/A'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-orange-500" />
                    Thời gian phản hồi: {formatLatency(scanResult.llm_meta?.latency_ms)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    Số token: {formatTokens(scanResult.llm_meta?.tokens_used)}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Audio Thuyết Minh</h2>
                <p className="text-sm text-neutral-600 dark:text-gray-400">
                  Bản thuyết minh âm thanh sẽ được phát trực tiếp ngay trên trình duyệt.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFetchAudio}
                disabled={isAudioLoading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAudioLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic2 className="h-4 w-4" />
                )}
                {isAudioLoading ? 'Đang chuẩn bị thuyết minh...' : 'Nghe thuyết minh'}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-300 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <p className="inline-flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Nội dung âm thanh dựa trên kết quả nhận diện mới nhất.
              </p>
            </div>

            {audioError && (
              <p className="mt-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {audioError}
              </p>
            )}

            {audioUrl && (
              <audio
                ref={audioPlayerRef}
                controls
                src={audioUrl}
                className="mt-4 w-full"
              />
            )}
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="inline-flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    Câu Chuyện Văn Hóa
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-gray-400">
                    Nội dung được hệ thống tổng hợp tự động từ món ăn vừa nhận diện.
                  </p>
                </div>

                {storyParagraphs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowFullStory((current) => !current)}
                    className="cursor-pointer text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    {showFullStory ? 'Thu gọn' : 'Xem đầy đủ'}
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700 dark:text-gray-300">
                {visibleStory.length > 0 ? (
                  visibleStory.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))
                ) : (
                  <p>Chưa có nội dung câu chuyện để hiển thị.</p>
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="inline-flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                <ChefHat className="h-5 w-5 text-orange-500" />
                Nguyên Liệu
              </h3>

              <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-gray-300">
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="rounded-xl border border-orange-100 dark:border-white/10 bg-orange-50/70 dark:bg-orange-950/20 px-3 py-2"
                    >
                      {ingredient}
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500 dark:text-gray-500">Không có danh sách nguyên liệu.</li>
                )}
              </ul>
            </article>

            <article className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="inline-flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                <Clock3 className="h-5 w-5 text-orange-500" />
                Cách Làm Cơ Bản
              </h3>
              <ol className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-gray-300">
                {parsedContent.steps.length > 0 ? (
                  parsedContent.steps.map((step, index) => (
                    <li
                      key={`${index}-${step}`}
                      className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-slate-800 px-3 py-2"
                    >
                      <span className="mr-2 font-semibold text-orange-600 dark:text-orange-400">{index + 1}.</span>
                      {step}
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500 dark:text-gray-500">Chưa có hướng dẫn cách làm.</li>
                )}
              </ol>
            </article>

            <article className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2">
              <h3 className="inline-flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                <Lightbulb className="h-5 w-5 text-orange-500" />
                Mẹo Thưởng Thức
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700 dark:text-gray-300">
                {parsedContent.tips.length > 0 ? (
                  parsedContent.tips.map((tip) => <p key={tip}>{tip}</p>)
                ) : (
                  <p>Chưa có mẹo thưởng thức trong kết quả hiện tại.</p>
                )}
              </div>
            </article>

            {parsedContent.fallbackSections.map((section) => (
              <article
                key={section.title}
                className="rounded-3xl border border-orange-100 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2"
              >
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{section.title}</h3>
                <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700 dark:text-gray-300">
                  {section.lines.map((line) => (
                    <p key={`${section.title}-${line}`}>{line}</p>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </div>
      )}

      <LoadingModal
        isOpen={isAnalyzing || isMenuScanning}
        message={isAnalyzing ? "Đang nhận diện món ăn" : "Đang trích xuất chữ"}
        submessage={isAnalyzing ? "YOLO phát hiện vùng ảnh → CLIP phân loại → LLM viết câu chuyện" : "Hệ thống đang trích xuất dữ liệu từ hình ảnh menu"}
      />

      <LoadingModal
        isOpen={isLoadingDetail}
        message="Đang tải chi tiết món ăn"
        submessage="Hệ thống đang sinh câu chuyện văn hóa cho món bạn chọn"
      />
    </div>
  );
};