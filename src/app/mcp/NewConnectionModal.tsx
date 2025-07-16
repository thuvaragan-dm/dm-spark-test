import { AnimatePresence, motion } from "motion/react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { VscLock } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EMCP, mcpKey } from "../../api/mcp/config";
import { AuthMethod, CredentialConfig } from "../../api/mcp/types";
import { useCreateMCPConnection } from "../../api/mcp/useCreateMCPConnection";
import Success from "../../components/alerts/Success";
import { Button, ButtonWithLoader } from "../../components/Button";
import ErrorMessage from "../../components/Forms/ErrorMessage";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import Label from "../../components/Forms/Label";
import Modal from "../../components/modal";
import Spinner from "../../components/Spinner";
import { MCPAuth, useAuth, useAuthActions } from "../../store/authStore";
import { useAppConfig } from "../../store/configurationStore";
import { filterFalsyValues } from "../../utilities/filterFalsyValues";
import {
  generateZodSchema,
  getFormFieldsFromSchema,
  getNestedError,
} from "../../utilities/generateZodSchemaAndFields";

const NewConnectionModal = ({
  isOpen,
  setIsOpen,
  name,
  serviceProvider,
  authMethods,
  credentials,
  category,
  logo,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  name: string;
  serviceProvider: string;
  authMethods: AuthMethod[];
  credentials: CredentialConfig[];
  category: string;
  logo: string;
}) => {
  const navigate = useNavigate();
  const { apiUrl } = useAppConfig();
  const { MCP } = useAuth();
  const { setMCP } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [oAuthFlowTriggered, setOAuthFlowTriggered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setMCP(null);
      setOAuthFlowTriggered(false);
    }
  }, [isOpen, setMCP]);

  const { mutateAsync: createMCPConnection, isPending: isCreatingConnection } =
    useCreateMCPConnection({
      invalidateQueryKey: [mcpKey[EMCP.FETCH_ALL_CONNECTED]],
    });

  const handleCloseModal = useCallback(() => setIsOpen(false), [setIsOpen]);

  const handleSuccess = useCallback(() => {
    toast.custom((t) => (
      <Success
        t={t}
        title={`Connected to ${name}`}
        description={`We have successfully connected your ${name} account.`}
      />
    ));
    handleCloseModal();
    navigate("/mcp/connections");
  }, [handleCloseModal, name, navigate]);

  const handleOAuthSubmit = useCallback(
    async (data: any) => {
      try {
        // The 'data' from the form is nested, e.g., { APITokenConfig: { api_token: '...' } }
        // We flatten it to get the inner object, e.g., { api_token: '...' }
        const flattenedData = Object.values(data)[0] || {};

        const filteredData = filterFalsyValues(flattenedData);

        await createMCPConnection({
          params: {
            auth_method: "OAUTH2",
            service_provider: serviceProvider,
            category: category,
          },
          body: filteredData,
        });

        handleSuccess();
      } catch (error) {
        setError(
          "Something went wrong while making the connection. Please try again",
        );
      }
    },
    [createMCPConnection, serviceProvider, category, handleSuccess],
  );

  const handleApiTokenSubmit = useCallback(
    async (data: any) => {
      try {
        // The 'data' from the form is nested, e.g., { APITokenConfig: { api_token: '...' } }
        // We flatten it to get the inner object, e.g., { api_token: '...' }
        const flattenedData = Object.values(data)[0] || {};

        const filteredData = filterFalsyValues(flattenedData);

        console.log("Submitting data:", filteredData);

        await createMCPConnection({
          params: {
            auth_method: "API_TOKEN",
            service_provider: serviceProvider,
            category: category,
          },
          body: filteredData,
        });
        handleSuccess();
      } catch (error) {
        setError(
          "Something went wrong while making the connection. Please try again",
        );
      }
    },
    [createMCPConnection, serviceProvider, category, handleSuccess],
  );

  const handleBasicAuthSubmit = useCallback(
    async (data: any) => {
      try {
        // The 'data' from the form is nested, e.g., { APITokenConfig: { api_token: '...' } }
        // We flatten it to get the inner object, e.g., { api_token: '...' }
        const flattenedData = Object.values(data)[0] || {};

        const filteredData = filterFalsyValues(flattenedData);

        await createMCPConnection({
          params: {
            auth_method: "BASIC_AUTH",
            service_provider: serviceProvider,
            category: category,
          },
          body: filteredData,
        });
        handleSuccess();
      } catch (error) {
        setError(
          "Something went wrong while making the connection. Please try again",
        );
      }
    },
    [createMCPConnection, serviceProvider, category, handleSuccess],
  );

  const handleCustomSubmit = useCallback(
    async (data: any) => {
      try {
        // The 'data' from the form is nested, e.g., { APITokenConfig: { api_token: '...' } }
        // We flatten it to get the inner object, e.g., { api_token: '...' }
        const flattenedData = Object.values(data)[0] || {};

        const filteredData = filterFalsyValues(flattenedData);

        await createMCPConnection({
          params: {
            auth_method: "CUSTOM",
            service_provider: serviceProvider,
            category: category,
          },
          body: filteredData,
        });
        handleSuccess();
      } catch (error) {
        setError(
          "Something went wrong while making the connection. Please try again",
        );
      }
    },
    [createMCPConnection, serviceProvider, category, handleSuccess],
  );

  useEffect(() => {
    const handleOAuthConnection = async (MCP: MCPAuth) => {
      const payload = {
        OAuthConfig: MCP,
      };
      try {
        await handleOAuthSubmit(payload);
      } catch (error) {
        console.log(error);
      } finally {
        setOAuthFlowTriggered(false);
      }
    };
    if (MCP && oAuthFlowTriggered) {
      handleOAuthConnection(MCP);
      setMCP(null);
    }
  }, [MCP, setMCP, handleOAuthSubmit, oAuthFlowTriggered]);

  const { validationSchema, fields } = useMemo(() => {
    const schema = generateZodSchema(credentials);
    const fieldData = getFormFieldsFromSchema(schema);
    return { validationSchema: schema, fields: fieldData };
  }, [credentials]);

  const apiTokenFields = fields.APITokenConfig || [];
  const basicAuthFields = fields.BasicAuthConfig || [];
  const customAuthFields = fields.CustomAuthConfig || [];

  const handleOAuthFlow = async () => {
    setMCP(null);
    const providerName = name.toLowerCase().split(" ").join("-");
    const mcpURL = `${apiUrl}/${providerName}-mcp-login`;

    if (window.electronAPI?.send) {
      window.electronAPI.send("open-external-url", mcpURL);
    } else {
      window.open(mcpURL, "_blank");
    }
    setOAuthFlowTriggered(true);
  };

  return (
    <Modal
      title={`Connect with ${name}`}
      description="Set up integration to connect your tools and services."
      desktopClassName="w-full min-h-[40rem] sm:max-w-lg relative flex flex-col"
      isOpen={isOpen}
      Trigger={() => <></>}
      setIsOpen={handleCloseModal}
    >
      <AnimatePresence>
        {oAuthFlowTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
          >
            <div className="bg-primary/50 dark:bg-primary/30 dark:text-primary w-min rounded-full p-5 text-white">
              {isCreatingConnection ? (
                <Spinner className="size-8 text-white" />
              ) : (
                <VscLock className="size-8" />
              )}
            </div>
            <h3 className="mt-3 text-lg font-medium text-white">
              {isCreatingConnection
                ? "Finalizing Connection..."
                : "Complete Authentication"}
            </h3>
            <p className="mt-1 text-center text-xs text-balance text-white/60">
              {isCreatingConnection
                ? "We're confirming your authentication and getting things ready. Hang tight!"
                : "A browser window has opened to securely sign in. This modal will update automatically upon completion."}
            </p>
            {!isCreatingConnection && (
              <>
                <div className="mt-5 flex items-center justify-start gap-1 text-xs text-white">
                  <span>Didn't see a new tab?</span>
                  <Button
                    variant="ghost"
                    onClick={handleOAuthFlow}
                    className="text-secondary rounded-none p-0 text-xs hover:underline md:p-0"
                  >
                    Try again
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setOAuthFlowTriggered(false)}
                  className="text-secondary mt-2 rounded-none p-0 text-xs hover:underline md:p-0"
                >
                  Cancel operation
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scrollbar flex flex-1 flex-col overflow-y-auto pt-4">
        {authMethods.includes("OAUTH2") && (
          <div className="w-full px-5">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">
              OAuth
            </h3>
            <p className="text-xs text-gray-600 dark:text-white/60">
              You will be redirected to {name} to authorize the connection
              securely.
            </p>
            <Button
              onClick={handleOAuthFlow}
              wrapperClass="mt-3 w-full"
              className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 [--border-highlight-radius:var(--radius-lg)]"
            >
              <div className="aspect-square rounded-lg bg-white p-1 shadow-inner">
                <img className="w-6 object-cover" alt="mcp image" src={logo} />
              </div>
              Connect using oauth
            </Button>
          </div>
        )}

        {authMethods.includes("OAUTH2") &&
          authMethods.includes("API_TOKEN") && (
            <div className="my-10 flex items-center justify-between gap-2 px-5">
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
              <span className="text-[0.6rem] tracking-widest text-gray-500 uppercase dark:text-white/50">
                Or
              </span>
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
            </div>
          )}

        {authMethods.includes("API_TOKEN") && (
          <Form
            validationSchema={validationSchema}
            className="flex w-full flex-1 flex-col px-5"
            onSubmit={handleApiTokenSubmit}
            formOptions={{
              mode: "onSubmit",
            }}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <>
                {apiTokenFields.map((field) => (
                  <Field key={field.name}>
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      data-invalid={!!getNestedError(errors, field.name)}
                      {...register(field.name)}
                    />
                    <ErrorMessage>
                      {getNestedError(errors, field.name)}
                    </ErrorMessage>
                  </Field>
                ))}
                <ButtonWithLoader
                  type="submit"
                  isLoading={isSubmitting}
                  wrapperClass="mt-3 w-full"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-white [--border-highlight-radius:var(--radius-lg)]"
                >
                  Connect & continue
                </ButtonWithLoader>
              </>
            )}
          </Form>
        )}

        {authMethods.includes("API_TOKEN") &&
          authMethods.includes("BASIC_AUTH") && (
            <div className="my-10 flex items-center justify-between gap-2 px-5">
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
              <span className="text-[0.6rem] tracking-widest text-gray-500 uppercase dark:text-white/50">
                Or
              </span>
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
            </div>
          )}

        {authMethods.includes("BASIC_AUTH") && (
          <Form
            validationSchema={validationSchema}
            className="flex w-full flex-1 flex-col px-5"
            onSubmit={handleBasicAuthSubmit}
            formOptions={{
              mode: "onSubmit",
            }}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <>
                {basicAuthFields.map((field) => (
                  <Field key={field.name}>
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      data-invalid={!!getNestedError(errors, field.name)}
                      {...register(field.name)}
                    />
                    <ErrorMessage>
                      {getNestedError(errors, field.name)}
                    </ErrorMessage>
                  </Field>
                ))}
                <ButtonWithLoader
                  type="submit"
                  isLoading={isSubmitting}
                  wrapperClass="mt-3 w-full"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-white [--border-highlight-radius:var(--radius-lg)]"
                >
                  Connect & continue
                </ButtonWithLoader>
              </>
            )}
          </Form>
        )}

        {authMethods.includes("BASIC_AUTH") &&
          authMethods.includes("CUSTOM") && (
            <div className="my-10 flex items-center justify-between gap-2 px-5">
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
              <span className="text-[0.6rem] tracking-widest text-gray-500 uppercase dark:text-white/50">
                Or
              </span>
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
            </div>
          )}

        {authMethods.includes("CUSTOM") && (
          <Form
            validationSchema={validationSchema}
            className="flex w-full flex-1 flex-col px-5"
            onSubmit={handleCustomSubmit}
            formOptions={{
              mode: "onSubmit",
            }}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <>
                {customAuthFields.map((field) => (
                  <Field key={field.name}>
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      data-invalid={!!getNestedError(errors, field.name)}
                      {...register(field.name)}
                    />
                    <ErrorMessage>
                      {getNestedError(errors, field.name)}
                    </ErrorMessage>
                  </Field>
                ))}
                <ButtonWithLoader
                  type="submit"
                  isLoading={isSubmitting}
                  wrapperClass="mt-3 w-full"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-white [--border-highlight-radius:var(--radius-lg)]"
                >
                  Connect & continue
                </ButtonWithLoader>
              </>
            )}
          </Form>
        )}
      </div>

      <div className="flex items-end justify-end gap-5 px-5 py-5">
        {error && <p className="text-xs text-red-700">{error}</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={handleCloseModal}
          wrapperClass="w-full md:w-auto"
          className="flex w-full items-center justify-center rounded-md px-2 py-1.5"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default NewConnectionModal;
