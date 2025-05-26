import { Toaster } from "sonner";

const AlertProvider = () => {
  return (
    <Toaster
      position="top-right"
      offset={{
        top: "3.6rem",
      }}
      visibleToasts={5}
    />
  );
};

export default AlertProvider;
