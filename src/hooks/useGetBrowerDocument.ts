import { useEffect, useState } from "react";

const useGetBrowerDocument = () => {
  const [doc, setDoc] = useState<Document | undefined>(undefined);
  useEffect(() => {
    if (window) {
      setDoc(window.document);
    }
  }, []);

  return doc;
};

export default useGetBrowerDocument;
