const UserMessage = ({ message }: { message: string }) => {
  return (
    <div className="relative mb-5 ml-auto flex max-w-[80.5%] min-w-[25%] items-start justify-start gap-2 @[xl]:max-w-[60%]">
      <div className="flex w-full flex-col rounded-xl border border-gray-400/50 bg-white/50 p-3 text-sm/6 text-gray-800 dark:border-white/10 dark:bg-white/10 dark:text-white">
        {message}
      </div>
    </div>
  );
};

export default UserMessage;
