import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Error from "../components/alerts/Error";
import extractFileExtension from "../utilities/extractFileExtension";

interface UseFileUploadProps {
  handleFileUpload: (file: File) => Promise<void>;
  maxFileSize?: number; // Maximum file size in MB
  acceptedExtensions?: Set<string>;
  disableExtensionValidation?: boolean;
  multiple?: boolean;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

const defaultAcceptedExtensions = new Set([
  "pdf",
  "json",
  "ppt",
  "docx",
  "yaml",
  "md",
  "xlsx",
  "txt",
  "pptx",
  "jpeg",
  "jpg",
  "png",
]);

const useFileUpload = ({
  handleFileUpload,
  maxFileSize = 15,
  acceptedExtensions = defaultAcceptedExtensions,
  multiple = false, // Default to false
  files = [],
  setFiles,
  disableExtensionValidation = false,
}: UseFileUploadProps) => {
  const [isFileUploadLoading, setIsFileUploadLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setFiles((prev) =>
        multiple ? [...prev, ...acceptedFiles] : acceptedFiles,
      );

      fileRejections.forEach((rejection) => {
        const error = rejection.errors[0];

        toast.custom(
          (t) => (
            <Error
              t={t}
              title={"File upload failed!"}
              description={error.message}
            />
          ),
          { id: Math.floor(Math.random() * 10000) },
        );
      });

      // Handle file uploads in parallel
      setIsFileUploadLoading(true);
      const uploadPromises = acceptedFiles.map((file) =>
        handleFileUpload(file).catch(() => {
          // Remove the file from `files` if upload fails
          setFiles((prev) => prev.filter((f) => f !== file));
        }),
      );

      await Promise.allSettled(uploadPromises);
      setIsFileUploadLoading(false);
    },
    [handleFileUpload, setFiles, multiple],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple,
    validator: (file: FileWithPath) => {
      const fileExtension = extractFileExtension(file.name);

      if (!fileExtension) {
        return {
          code: "invalid_file",
          message: `Unsupported file type. Please upload a valid file format.`,
        };
      }

      if (!multiple && files.length > 0) {
        return {
          code: "too_many_files",
          message: `Currently you can upload only one file.`,
        };
      }

      if (files.find((f) => f.name === file.name)) {
        return {
          code: "duplicate_file",
          message: `${file.name} already exists`,
        };
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        return {
          code: "file_too_large",
          message: `File is too large, The maximum file size allowed is ${maxFileSize}MB`,
        };
      }
      if (
        !disableExtensionValidation &&
        !acceptedExtensions.has(fileExtension)
      ) {
        return {
          code: "file-invalid-type",
          message: `File type .${fileExtension} is not accepted.`,
        };
      }
      return null;
    },
  });

  return {
    files,
    setFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    open,
    isFileUploadLoading,
  };
};

export default useFileUpload;
