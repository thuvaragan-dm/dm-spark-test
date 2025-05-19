import { IoCloudOffline } from "react-icons/io5";
import { Button } from "../../../../components/Button";

const ErrorState = ({ retry }: { retry: () => void }) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
      <div className="bg-secondary rounded-full p-5">
        <IoCloudOffline className="text-primary size-8" />
      </div>
      <p className="mt-3 text-base font-medium text-gray-600">
        something went wrong
      </p>
      <Button
        onClick={retry}
        variant={"ghost"}
        className={"mt-2 hover:underline"}
      >
        Try again
      </Button>
    </div>
  );
};

export default ErrorState;
