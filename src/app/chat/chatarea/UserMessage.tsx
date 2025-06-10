import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react/jsx-runtime";
import { MemoizedMarkdown } from "../../../components/MemMDRenderer";
import capitalizeFirstLetter from "../../../utilities/capitalizeFirstLetter";
import extractFileExtension from "../../../utilities/extractFileExtension";
import FileIcon from "../../../components/FileIcon";
import { documentsExtractorFromUserMessage } from "../../../utilities/documentsExtractorFromUserMessage";

const UserMessage = ({ id, message }: { id: string; message: string }) => {
  const { documents, message: extractedMessage } =
    documentsExtractorFromUserMessage(message);
  return (
    <div className="relative mb-5 ml-auto flex max-w-[80.5%] min-w-[25%] flex-col items-end justify-start gap-2 @[xl]:max-w-[60%]">
      <AnimatePresence>
        {documents && documents.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 10, opacity: 0, filter: "blur(10px)" }}
            className="relative mx-auto flex w-full max-w-4xl snap-x items-center justify-center pb-2"
          >
            {/* left gradient */}
            <div className="dark:from-primary-dark-foreground absolute top-0 left-0 z-[99999] h-14 w-16 bg-gradient-to-r from-gray-100 to-transparent"></div>
            {/* left gradient */}

            <div className="scrollbar z-10 flex w-full items-center justify-start gap-5 overflow-x-auto p-1 pl-10">
              {/* card */}
              {documents.map((document) => (
                <Fragment key={document.documentId}>
                  <AnimatePresence>
                    <motion.div
                      variants={{
                        open: { opacity: 1 },
                        close: { opacity: 0 },
                      }}
                      className=""
                    >
                      <DocumentChip document={document} />
                    </motion.div>
                  </AnimatePresence>
                </Fragment>
              ))}
              {/* card */}
            </div>

            {/* right gradient */}
            <div className="dark:from-primary-dark-foreground absolute inset-y-0 right-0 z-20 -mr-5 h-full w-16 bg-gradient-to-l from-gray-100 to-transparent"></div>
            {/* right gradient */}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-max flex-col rounded-xl border border-gray-400/50 bg-white/50 px-3 text-sm/6 text-gray-800 dark:border-white/10 dark:bg-white/10 dark:text-white">
        <MemoizedMarkdown id={id} content={extractedMessage} showDot={false} />
      </div>
    </div>
  );
};

export default UserMessage;

const DocumentChip = ({
  document,
}: {
  document: { documentId: string; name: string | null };
}) => {
  let type: string | null = null;

  if (document.name) {
    type = extractFileExtension(document.name);
  }
  return (
    <div className="group relative min-w-16 shrink-0">
      <div className="relative flex h-16 max-w-sm min-w-56 items-center justify-start gap-2 rounded-xl border border-gray-300 p-1 px-3 dark:border-white/10">
        <FileIcon fileType={type || ""} />
        <div className="truncate">
          <p className="truncate text-xs font-semibold text-gray-800 dark:text-white">
            {capitalizeFirstLetter(document.name || document.documentId)}
          </p>
          <p className="text-xs tracking-wide text-gray-600 uppercase dark:text-white/60">
            {type}
          </p>
        </div>
      </div>
    </div>
  );
};
