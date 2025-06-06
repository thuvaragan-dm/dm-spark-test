// "use client";

// import { AnimatePresence, motion } from "motion/react";
// import { useMemo, useRef } from "react";
// import { IoReader } from "react-icons/io5";
// import { useSearchParams } from "react-router-dom";
// import { documentKey, EDocument } from "../../../api/document/config";
// import { useUploadDocument } from "../../../api/document/useUploadDocument";
// import useFileUpload from "../../../hooks/useFileUpload";
// import { useAgent } from "../../../store/agentStore";
// import {
//   useChatInput,
//   useChatInputActions,
// } from "../../../store/chatInputStore";
// import ChatInput from "./ChatInput";
// import ChatThreads from "./ChatThreads";
// import ChatZeroState from "./ChatZeroState";
// import useSendMessage from "./useSendMessage";
// import useStream from "./useStream";

// const ChatArea = () => {
//   const { selectedAgent } = useAgent();
//   const [searchParams] = useSearchParams();

//   const chatContainerRef = useRef<HTMLUListElement>(null);

//   const threadId = useMemo(
//     () => searchParams.get("thread") || null,
//     [searchParams],
//   );

//   const { sendMessage, isSendMessageLoading } = useSendMessage();

//   const {
//     startStream,
//     stopStream,
//     streamData,
//     isStreamLoading,
//     isStreamDone,
//     isStreamActive,
//     resetStream,
//   } = useStream();

//   const { files, fileData } = useChatInput();
//   const { setFiles, setSuggestions, setVideos } = useChatInputActions();

//   const { mutateAsync: uploadFile } = useUploadDocument({
//     invalidateQueryKey: [documentKey[EDocument.FETCH_ALL]],
//   });

//   const {
//     getRootProps,
//     getInputProps,
//     isDragActive,
//     open,
//     isFileUploadLoading,
//   } = useFileUpload({
//     files,
//     setFiles,
//     handleFileUpload: async (file) => {
//       await uploadFile({
//         body: {
//           file: file,
//           shard_id: selectedAgent?.shard_id || "",
//           description: "",
//         },
//       });
//     },
//   });

//   const handleSubmit = async (message: string) => {
//     if (message.trim().length > 0) {
//       // Append file data if available
//       if (fileData && files.length > 0) {
//         message += ` <span className="hidden">document id:${fileData.id}</span>`;
//       }

//       setSuggestions([]);
//       setVideos([]);

//       await sendMessage(message);

//       startStream(message);
//     }
//   };

//   return (
//     <section
//       {...getRootProps()}
//       className="dark:bg-primary-dark-foreground relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden bg-gray-100 focus:outline-0"
//     >
//       <AnimatePresence>
//         {isDragActive && (
//           <motion.div className="absolute inset-0 isolate z-[999999] flex flex-col">
//             <div className="relative inset-0 flex size-full flex-col items-center justify-center">
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="absolute inset-0 z-10 bg-black/10 backdrop-blur-sm"
//               ></motion.div>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="dark:bg-primary-dark-foreground relative inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-200 p-10 shadow-2xl dark:border-white/20"
//               >
//                 <IoReader className="size-12 text-gray-400 dark:text-white/60" />
//                 <h2 className="mt-2 text-xl font-medium text-gray-800 dark:text-white">
//                   Drop your files here
//                 </h2>
//                 <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
//                   Add your files here to add it to the conversation
//                 </p>
//               </motion.div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* pattern */}
//       {/* <div className="pointer-events-none absolute inset-0 z-10">
//         <div className="from-primary/20 dark:from-primary/50 pointer-events-none relative size-full bg-gradient-to-b to-transparent mask-b-from-0 [mask-image:linear-gradient(45deg,transparent,white)] dark:opacity-50"></div>
//         <DotPattern className="inset-0 mask-x-from-0% mask-b-from-0.5 mask-b-to-50% fill-gray-900 dark:fill-white dark:opacity-50" />
//       </div> */}
//       {/* pattern */}

//       {selectedAgent && !threadId && (
//         <ChatZeroState isLoading={isSendMessageLoading} />
//       )}

//       <AnimatePresence initial={false} mode="popLayout">
//         {selectedAgent && threadId && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="relative z-30 flex w-full flex-1 flex-col overflow-hidden"
//           >
//             <ChatThreads
//               isStreamLoading={isStreamLoading}
//               streamData={streamData}
//               isStreamDone={isStreamDone}
//               chatContainerRef={chatContainerRef.current}
//               resetStream={resetStream}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence initial={false} mode="popLayout">
//         {(threadId || (!isSendMessageLoading && !threadId)) && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="relative z-30 flex w-full flex-col py-5"
//           >
//             {/* suggestions */}
//             <AnimatePresence>
//               {streamData.suggestedQuestions &&
//                 streamData.suggestedQuestions.length > 0 && (
//                   <motion.div
//                     initial={{ y: 10, opacity: 0, filter: "blur(10px)" }}
//                     animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
//                     exit={{ y: 10, opacity: 0, filter: "blur(10px)" }}
//                     className="relative mx-auto flex w-full max-w-4xl snap-x items-center justify-center pb-2"
//                   >
//                     {/* left gradient */}
//                     <div className="dark:from-primary-dark-foreground absolute top-0 left-0 z-[99999] h-14 w-16 bg-gradient-to-r from-gray-100 to-transparent"></div>
//                     {/* left gradient */}

//                     <div className="scrollbar z-10 flex w-full items-center justify-start gap-5 overflow-x-auto p-1 pl-10">
//                       {/* card */}
//                       {streamData.suggestedQuestions.map((suggestion, idx) => (
//                         <button
//                           onClick={() => {
//                             handleSubmit(suggestion.question);
//                           }}
//                           key={idx}
//                           className="flex-shrink-0 rounded-xl border border-gray-300 bg-white p-3 ring-gray-300 hover:bg-gray-50 data-[presses]:bg-gray-100 md:p-3 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/20 dark:data-[presses]:bg-white/20"
//                         >
//                           <p className="text-skin-primary text-sm font-medium whitespace-nowrap">
//                             {suggestion.question}
//                           </p>
//                         </button>
//                       ))}
//                       {/* card */}

//                       <div className="-ml-5 h-12 w-10 flex-shrink-0"></div>
//                       {/* card */}
//                     </div>

//                     {/* right gradient */}
//                     <div className="dark:from-primary-dark-foreground absolute top-0 right-0 z-20 h-14 w-16 bg-gradient-to-l from-gray-100 to-transparent"></div>
//                     {/* right gradient */}
//                   </motion.div>
//                 )}
//             </AnimatePresence>
//             {/* suggestions */}

//             <div className="relative mx-auto flex w-full max-w-4xl flex-col overflow-hidden px-5 py-1 md:px-10">
//               <input className="sr-only" type="file" {...getInputProps()} />
//               <ChatInput
//                 isLoading={isStreamLoading || (isStreamActive && !isStreamDone)}
//                 isFileUploadLoading={isFileUploadLoading}
//                 openExplorer={open}
//                 handleSubmit={handleSubmit}
//                 stopStreaming={stopStream}
//                 placeholder="What do you want to know?"
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </section>
//   );
// };

// export default ChatArea;

const ChatArea = () => {
  return <div>ChatArea</div>;
};

export default ChatArea;
