import { useState } from 'react';
import { LoadingModal } from '../common/components/LoadingModal';

export function LoadingModalDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'analyzing' | 'uploading' | 'processing'>('analyzing');

  const demoMessages = {
    analyzing: {
      message: 'Analyzing...',
      submessage: 'AI is identifying your food'
    },
    uploading: {
      message: 'Uploading...',
      submessage: 'Please wait while we process your image'
    },
    processing: {
      message: 'Processing...',
      submessage: 'Translating menu items'
    }
  };

  const handleDemo = (type: 'analyzing' | 'uploading' | 'processing') => {
    setCurrentDemo(type);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Loading Modal Component</h1>
          <p className="text-gray-600">
            Click any button to see the loading overlay in action
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <button
            onClick={() => handleDemo('analyzing')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Show "Analyzing..." Modal
          </button>

          <button
            onClick={() => handleDemo('uploading')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Show "Uploading..." Modal
          </button>

          <button
            onClick={() => handleDemo('processing')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Show "Processing..." Modal
          </button>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-bold text-neutral-800 mb-4">Component Features</h2>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Animated spinning loader with pulse effect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Blurred backdrop with dark overlay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Customizable message and submessage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Smooth enter/exit animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Animated dots for loading indication</span>
            </li>
          </ul>
        </div>
      </div>

      <LoadingModal
        isOpen={isLoading}
        message={demoMessages[currentDemo].message}
        submessage={demoMessages[currentDemo].submessage}
      />
    </div>
  );
}
