import { fromBlob, Size, ImageFormat } from "image-resize-compress";

type Options = {
  width?: Size["width"] | "auto";
  height?: Size["height"] | "auto";
  quality?: number;
  format?: ImageFormat;
};

export async function mutateImage(
  file: File,
  { quality, width, height, format }: Options,
) {
  const resizedFile = await fromBlob(file, quality, width, height, format);
  return resizedFile;
}
