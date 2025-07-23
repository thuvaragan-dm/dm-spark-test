import { useCallback, useState } from "react";
import {
  Accept,
  FileRejection,
  FileWithPath,
  useDropzone,
} from "react-dropzone";
import { toast } from "sonner";
import Error from "../components/alerts/Error";
import { mutateImage } from "../utilities/mutateImage";

const MAX_FILE_SIZE_IN_MB = 2;

const ACCEPTED_FILE_TYPES: Accept = {
  "image/png": [],
  "image/jpeg": [],
};

const useImageUpload = ({
  onDropHandle,
}: {
  onDropHandle: (file: File) => Promise<void>;
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);

      fileRejections.forEach((rejection) => {
        const error = rejection.errors[0];
        const fileType = rejection.file.type.split("/")[1];

        switch (error.code) {
          case "file-invalid-type":
            toast.custom(
              (t) => (
                <Error
                  t={t}
                  title="Invalid file type!"
                  description={`Sorry, we currently don't support ${fileType} type.`}
                />
              ),
              { id: Math.floor(Math.random() * 10000) },
            );
            break;

          case "duplicate_file":
            toast.custom(
              (t) => (
                <Error
                  t={t}
                  title="Duplicate file detected!"
                  description={error.message}
                />
              ),
              { id: Math.floor(Math.random() * 10000) },
            );
            break;

          case "file_too_large":
            toast.custom(
              (t) => (
                <Error
                  t={t}
                  title="File too large!"
                  description={`${rejection.file.name} is of size ${(
                    rejection.file.size /
                    (1024 * 1024)
                  ).toFixed(
                    2,
                  )}MB, we allow only files below ${MAX_FILE_SIZE_IN_MB}MB.`}
                />
              ),
              { id: Math.floor(Math.random() * 10000) },
            );
            break;

          case "too_many_files":
            toast.custom(
              (t) => (
                <Error
                  t={t}
                  title="Too many files!"
                  description={error.message}
                />
              ),
              { id: Math.floor(Math.random() * 10000) },
            );
            break;

          default:
            break;
        }
      });

      // Handle file uploads and errors
      for (const file of acceptedFiles) {
        try {
          const mutatedFile = await mutateImage(file, {
            format: "png",
            height: "auto",
            width: 350,
            quality: 80,
          });
          const convertedFile = new File([mutatedFile], "user-avatar.png", {
            type: "image/png",
          });

          await onDropHandle(convertedFile);
        } catch {
          // If upload fails, remove the file from the state
          setFiles((prev) => prev.filter((f) => f !== file));
        }
      }
      setFiles([]);
    },
    [onDropHandle],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
    validator: (file: FileWithPath) => {
      if (files.length > 0) {
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
      if (
        MAX_FILE_SIZE_IN_MB &&
        file.size > MAX_FILE_SIZE_IN_MB * 1024 * 1024
      ) {
        return {
          code: "file_too_large",
          message: `File is too large, The maximum file size allowed is ${MAX_FILE_SIZE_IN_MB.toFixed(
            2,
          )}MB`,
        };
      }
      return null;
    },
    accept: ACCEPTED_FILE_TYPES,
  });

  return {
    files,
    setFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  };
};

export default useImageUpload;
