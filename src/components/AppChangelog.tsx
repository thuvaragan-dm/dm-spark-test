import { useEffect } from "react";
import { useGetChangelog } from "../api/configurations/useGetChangelog";
import { useAppConfig, useAppConfigActions } from "../store/configurationStore";
import { Button } from "./Button";
import { MemoizedMarkdown } from "./MemMDRenderer";
import Modal from "./modal";

const AppChangelog = () => {
  const { showChangelog, appVersion } = useAppConfig();
  const { setShowChangelog } = useAppConfigActions();
  const { data: changelog } = useGetChangelog({ version: appVersion || "" });

  useEffect(() => {
    const handleShowChangelog = async () => {
      if (
        changelog &&
        changelog.length > 0 &&
        appVersion &&
        appVersion?.length > 0
      ) {
        const isShowChangelog = await window.electronAPI.shouldShowChangelog();
        if (isShowChangelog) {
          setShowChangelog(true);
        }
      }
    };

    handleShowChangelog();
  }, [changelog, setShowChangelog, appVersion]);

  return (
    <Modal
      isOpen={showChangelog}
      setIsOpen={setShowChangelog}
      desktopClassName="w-full h-dvh sm:max-w-screen-md"
      title={`Whats New in v${appVersion}`}
      description={
        "Discover the latest features, improvements, and fixes in this version."
      }
      showClose
      Trigger={() => <></>}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="scrollbar flex flex-1 flex-col overflow-y-auto p-5">
          <MemoizedMarkdown
            id={"changelog"}
            content={changelog || ""}
            showDot={false}
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-5">
          <Button
            type="button"
            onClick={() => setShowChangelog(false)}
            wrapperClass="w-full md:w-auto"
            className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AppChangelog;
