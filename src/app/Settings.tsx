import { AxiosError } from "axios";
import { AnimatePresence, motion } from "motion/react";
import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  IoArrowBack,
  IoCall,
  IoEye,
  IoEyeOff,
  IoImage,
  IoLockClosed,
  IoMail,
  IoPerson,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { z } from "zod";
import { EUser, userKey } from "../api/user/config";
import { User } from "../api/user/types";
import { useChangePassword } from "../api/user/useChangePassword";
import { useGenerateAvatar } from "../api/user/useGenerateAvatar";
import { useGetUser } from "../api/user/useGetUser";
import { ChangePasswordSchema } from "../api/user/UserSchema";
import { useUpdateUser } from "../api/user/useUpdateUser";
import BlurWrapper from "../components/BlurWrapper";
import { Button, ButtonWithLoader } from "../components/Button";
import ErrorMessage from "../components/Forms/ErrorMessage";
import Field from "../components/Forms/Field";
import Form from "../components/Forms/Form";
import Input from "../components/Forms/Input";
import InputGroup from "../components/Forms/InputGroup";
import Label from "../components/Forms/Label";
import Modal from "../components/modal";
import SlidingContainer from "../components/SlidingContainer";
import Spinner from "../components/Spinner";
import useFileUpload from "../hooks/useFileUpload";
import { useAuthActions } from "../store/authStore";
import { cn } from "../utilities/cn";
import capitalizeFirstLetter from "../utilities/capitalizeFirstLetter";

enum ActiveTab {
  PROFILE = 1,
  SECURITY = 2,
  CHANGE_NAME = 3,
  CHANGE_PHONE = 4,
  CHANGE_PASSWORD = 5,
}

type Picture = {
  url: string;
};

export const SettingsModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setUser } = useAuthActions();
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.PROFILE);
  const [file, setFile] = useState<File[]>([]);
  const [picture, setPicture] = useState<Picture | null>();
  const { data: user, isPending: isUserLoading } = useGetUser();
  const { mutateAsync: generateAvatar, isPending: isGenerateAvatarLoading } =
    useGenerateAvatar({
      invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
    });

  const { getRootProps, getInputProps, open } = useFileUpload({
    files: file,
    setFiles: setFile,
    handleFileUpload: async (file) => {
      const url = URL.createObjectURL(file);
      setPicture({ url });
      setFile([]);

      const { avatar_url } = await generateAvatar({
        body: {
          uploaded_picture: file,
          regenerate_avatar: false,
        },
      });

      setUser((pv) =>
        pv
          ? {
              ...pv,
              avatar_url: avatar_url || "",
              original_profile_picture_url: url || "",
            }
          : null,
      );
    },
  });

  useEffect(() => {
    if (user && user?.avatar_url) {
      setPicture({
        url: user.original_profile_picture_url || "",
      });
    }
  }, [user, setPicture]);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      desktopClassName="w-full h-dvh sm:max-w-screen-md"
      title="Settings"
      description={"User settings"}
      showClose
      Trigger={() => <></>}
    >
      <div className="scrollbar flex w-full flex-col items-start justify-start divide-gray-300 overflow-y-auto border-t border-gray-100 px-3 pt-5 md:h-full md:flex-row md:divide-x dark:divide-white/10 dark:border-white/10">
        {/* left section */}
        <div className="flex w-full flex-col pr-3 pl-3 md:w-[25%]">
          <div className="flex w-full flex-row gap-5 md:flex-col md:gap-2">
            <Button
              variant={"ghost"}
              onClick={() => setActiveTab(ActiveTab.PROFILE)}
              wrapperClass="w-full flex -mx-2"
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10",
                {
                  "dark:bg-secondary dark:data-[pressed]:bg-secondary dark:hover:bg-secondary bg-gray-200 dark:text-white":
                    activeTab === ActiveTab.PROFILE ||
                    activeTab === ActiveTab.CHANGE_NAME ||
                    activeTab === ActiveTab.CHANGE_PHONE,
                },
              )}
            >
              <IoPerson className="size-6" />
              <p className="text-sm font-medium">Profile</p>
            </Button>

            <Button
              variant={"ghost"}
              wrapperClass="w-full flex -mx-2"
              onClick={() => setActiveTab(ActiveTab.SECURITY)}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10",
                {
                  "dark:bg-secondary dark:data-[pressed]:bg-secondary dark:hover:bg-secondary bg-gray-200 dark:text-white":
                    activeTab === ActiveTab.SECURITY ||
                    activeTab === ActiveTab.CHANGE_PASSWORD,
                },
              )}
            >
              <IoLockClosed className="size-6" />
              <p className="text-sm font-medium">Security</p>
            </Button>
          </div>
        </div>
        {/* left section */}

        {/* right section */}
        {!isUserLoading && user && (
          <div
            {...getRootProps()}
            className="mt-5 flex h-full w-full flex-1 flex-col md:mt-0 md:w-[75%] md:flex-auto md:overflow-y-auto"
          >
            <SlidingContainer
              active={activeTab}
              className="p-1 md:pr-3 md:pl-5"
            >
              {activeTab === ActiveTab.PROFILE && (
                <div className="w-full flex-1">
                  <h3 className="text-base font-medium text-gray-800 dark:text-white">
                    Your profile picture
                  </h3>

                  <div className="mt-3 flex w-full flex-col justify-start gap-5 md:flex-row md:items-center">
                    <div className="relative aspect-square size-full overflow-hidden rounded-xl bg-gray-200 md:size-40 dark:bg-white/20">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {isGenerateAvatarLoading && (
                          <motion.div
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(10px)" }}
                            className="absolute inset-0 z-20 animate-pulse rounded-xl bg-white/70 backdrop-blur-xl"
                          ></motion.div>
                        )}
                      </AnimatePresence>

                      {picture && (
                        <BlurWrapper Key={picture.url}>
                          {picture.url ? (
                            <img
                              src={picture.url}
                              className="aspect-square w-full object-cover"
                              alt="user profile picture"
                            />
                          ) : (
                            <div className="flex aspect-square w-full items-center justify-center p-5">
                              <IoPersonCircleOutline className="size-20 text-gray-500" />
                            </div>
                          )}
                        </BlurWrapper>
                      )}
                    </div>

                    <AnimatePresence mode="popLayout" initial={false}>
                      {!isGenerateAvatarLoading && (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(10px)" }}
                        >
                          <input
                            className="sr-only"
                            type="file"
                            {...getInputProps()}
                          />

                          <Button
                            onClick={open}
                            wrapperClass="w-max flex items-center justify-center"
                            variant={"ghost"}
                            className={
                              "flex items-center justify-start gap-3 rounded-xl border p-3 hover:bg-gray-100 data-[pressed]:bg-gray-100 md:p-3 dark:border-white/10 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10"
                            }
                          >
                            <IoImage className="text-primary size-6 flex-shrink-0" />
                            {picture?.url ? "Update picture" : "Add picture"}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout" initial={false}>
                      {isGenerateAvatarLoading && (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(10px)" }}
                        >
                          <div
                            className={
                              "group relative bg-white transition-shadow duration-500 ease-out [--bg-size:500%] dark:bg-transparent"
                            }
                          >
                            <span
                              className={
                                "animate-gradient from-accent via-primary-600 to-accent inline bg-gradient-to-r bg-[length:var(--bg-size)_100%] bg-clip-text text-base font-semibold text-transparent"
                              }
                            >
                              Generating a cool looking avatar for you.
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* name */}
                  <div className="mt-5">
                    <div className="flex w-full items-center justify-between gap-5">
                      <label
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        htmlFor="name"
                      >
                        Name
                      </label>

                      <Button
                        onClick={() => setActiveTab(ActiveTab.CHANGE_NAME)}
                        variant={"ghost"}
                        className={
                          "text-primary dark:text-secondary text-xs hover:underline"
                        }
                      >
                        Edit
                      </Button>
                    </div>

                    <p className="mt-1 text-sm text-gray-800 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-white/60">
                      Member
                    </p>
                  </div>
                  {/* name */}

                  {/* email */}
                  <div className="mt-5 border-t border-gray-300 pt-5 dark:border-white/10">
                    <label
                      className="text-sm font-medium text-gray-800 dark:text-white"
                      htmlFor="name"
                    >
                      Email
                    </label>

                    <div className="mt-1 flex items-center justify-start gap-2">
                      <IoMail className="text-primary dark:text-secondary size-6" />
                      <p className="text-sm text-gray-800 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {/* email */}

                  {/* phone number */}
                  <div className="mt-5 border-t border-gray-300 pt-5 dark:border-white/10">
                    <div className="flex w-full items-center justify-between gap-5">
                      <label
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        htmlFor="phone"
                      >
                        Phone
                      </label>

                      <Button
                        onClick={() => setActiveTab(ActiveTab.CHANGE_PHONE)}
                        variant={"ghost"}
                        wrapperClass="w-max"
                        className={
                          "text-primary dark:text-secondary text-xs hover:underline"
                        }
                      >
                        {user.phone_number ? "Edit" : "Add number"}
                      </Button>
                    </div>
                    {user.phone_number && (
                      <div className="mt-1 flex items-center justify-start gap-2">
                        <IoCall className="text-primary dark:text-secondary size-6" />

                        <p className="text-sm text-gray-800 dark:text-white">
                          +1 {user.phone_number}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* phone number */}
                </div>
              )}

              {activeTab === ActiveTab.SECURITY && (
                <div className="w-ful h-full min-h-full flex-1">
                  <div className="flex w-full flex-1 flex-col">
                    {user.login_method === "EMAIL" && (
                      <div className="flex w-full items-start justify-between gap-5">
                        <div className="">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            Change Password
                          </p>
                          <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
                            Update your password for added security. Click here
                            to change it now. Didn&apos;t request this? Contact
                            support.
                          </p>
                        </div>

                        <Button
                          onClick={() =>
                            setActiveTab(ActiveTab.CHANGE_PASSWORD)
                          }
                          variant={"ghost"}
                          className={
                            "text-primary dark:text-secondary text-xs hover:underline"
                          }
                        >
                          Change
                        </Button>
                      </div>
                    )}

                    {user.login_method !== "EMAIL" && (
                      <div className="">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          You signed in using{" "}
                          {capitalizeFirstLetter(
                            user.login_method.toLowerCase().split("_")[0],
                          )}
                        </p>
                        <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
                          Please use{" "}
                          {user.login_method.toLowerCase().split("_")[0]} to
                          update the password.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === ActiveTab.CHANGE_NAME && (
                <ChangeName user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === ActiveTab.CHANGE_PHONE && (
                <ChangeNumber user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === ActiveTab.CHANGE_PASSWORD && (
                <ChangePassword setActiveTab={setActiveTab} />
              )}
            </SlidingContainer>
          </div>
        )}

        {isUserLoading && (
          <div className="flex h-full w-full items-center justify-center md:w-[75%]">
            <Spinner className="size-4" />
          </div>
        )}
        {/* right section */}
      </div>
    </Modal>
  );
};

interface IChangeName extends ComponentProps<"div"> {
  user: User;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangeName = ({ user, setActiveTab }: IChangeName) => {
  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.PROFILE)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Name
          </p>
        </div>
      </div>

      <Form
        validationSchema={z.object({
          first_name: z
            .string({ required_error: "First name is required." })
            .trim()
            .min(1, "First name is required."),

          last_name: z
            .string({ required_error: "Last name is required." })
            .trim()
            .min(1, "Last name is required."),
        })}
        className="mt-5"
        onSubmit={(values) => {
          updateUser({
            body: { ...user, ...values },
          });

          setActiveTab(ActiveTab.PROFILE);
        }}
        defaultValues={{
          first_name: user.first_name,
          last_name: user.last_name,
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <>
            <Field>
              <Label>First name</Label>
              <Input
                placeholder={"Enter first name"}
                className="w-full"
                data-invalid={errors.first_name}
                {...register("first_name")}
              />
              <ErrorMessage>{errors.first_name?.message}</ErrorMessage>
            </Field>

            <Field>
              <Label>Last name</Label>
              <Input
                placeholder={"Enter last name"}
                className="w-full"
                data-invalid={errors.last_name}
                {...register("last_name")}
              />
              <ErrorMessage>{errors.last_name?.message}</ErrorMessage>
            </Field>

            <div className="mt-5 flex w-full justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

interface IChangeNumber extends ComponentProps<"div"> {
  user: User;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangeNumber = ({ user, setActiveTab }: IChangeNumber) => {
  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.PROFILE)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Number
          </p>
        </div>
      </div>

      <Form
        validationSchema={z
          .object({
            phone_number: z
              .string({ required_error: "Phone number is required." })
              .min(1, "Phone number is required.")
              .nullable(),
          })
          .superRefine((data, ctx) => {
            const phoneNumber = data.phone_number;

            if (phoneNumber) {
              // Check if phone number contains spaces
              if (/\s/.test(phoneNumber)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number must not contain spaces.",
                  path: ["phone_number"],
                });
              }

              // Check if phone number starts with '+1'
              if (phoneNumber.startsWith("+1")) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number should not start with '+1'.",
                  path: ["phone_number"],
                });
              }

              // Check if the phone number has exactly 10 digits
              if (phoneNumber.length !== 10) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number must be exactly 10 digits.",
                  path: ["phone_number"],
                });
              }

              // Check if the phone number follows the valid US format
              if (!/^[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/.test(phoneNumber)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message:
                    "Invalid US phone number format (Area code and exchange code can't start with 1).",
                  path: ["phone_number"],
                });
              }
            }
          })}
        className="mt-5"
        onSubmit={(values) => {
          updateUser({
            body: { ...user, ...values },
          });

          setActiveTab(ActiveTab.PROFILE);
        }}
        defaultValues={{
          phone_number: user.phone_number,
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <>
            <Field>
              <Label>Contact number</Label>
              <Input
                placeholder={"Enter first name"}
                className="w-full"
                data-invalid={errors.phone_number}
                {...register("phone_number")}
              />
              <ErrorMessage>{errors.phone_number?.message}</ErrorMessage>
            </Field>

            <div className="mt-5 flex w-full justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

interface IChangePassword extends ComponentProps<"div"> {
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangePassword = ({ setActiveTab }: IChangePassword) => {
  const { mutateAsync: changePassword } = useChangePassword({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.SECURITY)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Password
          </p>
          <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
            Update your password for added security. Click here to change it
            now. Didn't request this? Contact support.
          </p>
        </div>
      </div>

      <Form
        validationSchema={ChangePasswordSchema}
        className="mt-5"
        onSubmit={async (values, methods) => {
          try {
            await changePassword({
              body: values,
            });
            setActiveTab(ActiveTab.SECURITY);
          } catch (error) {
            const err = error as AxiosError;

            if (err.response?.status === 400) {
              methods.setError("current_password", {
                message: "Invalid current password",
              });
            }
          }
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <div className="flex flex-col space-y-2">
            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  className="w-full"
                  data-invalid={errors.current_password?.message}
                  {...register("current_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.current_password?.message}</ErrorMessage>
            </Field>

            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full"
                  data-invalid={errors.new_password?.message}
                  {...register("new_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.new_password?.message}</ErrorMessage>
            </Field>

            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="w-full"
                  data-invalid={errors.confirm_password?.message}
                  {...register("confirm_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.confirm_password?.message}</ErrorMessage>
            </Field>

            <div className="flex w-full justify-end">
              <ButtonWithLoader
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </ButtonWithLoader>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};
