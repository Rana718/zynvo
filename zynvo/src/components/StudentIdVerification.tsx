'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentIdVerificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentIdVerification({ isOpen, onClose }: StudentIdVerificationProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    // Show submitted message after 1 second
    setTimeout(() => {
      setIsUploading(false);
      setIsVerified(true);
      setTimeout(() => {
        onClose();
        setIsVerified(false);
        setSelectedFile(null);
        setPreview(null);
      }, 2000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Verify Student ID</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>

            {!isVerified ? (
              <>
                <p className="text-gray-400 mb-6 text-sm">
                  Upload your student ID card to verify your student status
                </p>

                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center mb-4">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Student ID Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-400">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="mx-auto text-gray-500" size={48} />
                      <div>
                        <p className="text-white mb-2">Upload Student ID</p>
                        <p className="text-sm text-gray-400">
                          JPG, PNG or PDF up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="student-id-upload"
                />

                <div className="flex gap-3">
                  <label
                    htmlFor="student-id-upload"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-700 rounded-lg text-white hover:bg-gray-800 cursor-pointer transition"
                  >
                    <Upload size={16} />
                    Choose File
                  </label>

                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {isUploading ? 'Uploading...' : 'Submit'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                <h3 className="text-xl font-bold text-white mb-2">Submitted!</h3>
                <p className="text-gray-400">
                  Submitted for verification
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
