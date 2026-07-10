import { useState, useCallback } from 'react';
import { fetchDocuments, deleteDocument, uploadFiles } from '../services/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDocuments();
      setDocuments(response.data.documents || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeDocument = useCallback(
    async (docId) => {
      try {
        await deleteDocument(docId);
        setDocuments((prev) => prev.filter((doc) => doc.doc_id !== docId));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    []
  );

  const upload = useCallback(
    async (files) => {
      if (!files || files.length === 0) return { uploaded: [], failed: [], duplicates: [] };

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const response = await uploadFiles(files, (percent) =>
          setUploadProgress(percent)
        );
        const { uploaded, failed, duplicates } = response.data;

        if (uploaded && uploaded.length > 0) {
          await loadDocuments();
        }

        return { uploaded: uploaded || [], failed: failed || [], duplicates: duplicates || [] };
      } catch (err) {
        setError(err.message || 'Upload failed');
        return { uploaded: [], failed: [{ filename: 'files', reason: err.message }], duplicates: [] };
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [loadDocuments]
  );

  return {
    documents,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    loadDocuments,
    removeDocument,
    upload,
  };
}
