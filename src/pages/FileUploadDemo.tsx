import { useState } from 'react';
import { FileUpload } from '../common/components/FileUpload';
import { LoadingModal } from '../common/components/LoadingModal';

export function FileUploadDemo() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (file: File) => {
    setIsAnalyzing(true);

    // Simulate API call or processing
    setTimeout(() => {
      setUploadedFile(file);
      setIsAnalyzing(false);
      console.log('File selected:', file.name, file.size);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">File Upload Component</h1>
          <p className="text-gray-600">
            Drag and drop an image or click to browse
          </p>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          accept="image/*"
          preview={true}
        />

        {uploadedFile && (
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h3 className="mb-2">File Details</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-500">Name:</dt>
                <dd className="font-medium">{uploadedFile.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Size:</dt>
                <dd className="font-medium">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Type:</dt>
                <dd className="font-medium">{uploadedFile.type}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <LoadingModal
        isOpen={isAnalyzing}
        message="Analyzing..."
        submessage="Processing your image"
      />
    </div>
  );
}
