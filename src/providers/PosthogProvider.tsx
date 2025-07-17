import { PostHogProvider as PH_P } from "posthog-js/react";
import { ReactNode } from "react";
import { useAppConfig } from "../store/configurationStore";

const PosthogProvider = ({ children }: { children: ReactNode }) => {
  const { posthogApiKey } = useAppConfig();

  if (posthogApiKey) {
    return (
      <PH_P
        options={{
          api_host: "https://us.i.posthog.com",
          defaults: "2025-05-24",
          autocapture: true,
          capture_pageview: true,
          person_profiles: "identified_only",
        }}
        apiKey={posthogApiKey}
      >
        {children}
      </PH_P>
    );
  }

  return (
    <section className="from-sidepanel-start to-sidepanel-end flex h-dvh w-full flex-col items-center justify-center bg-linear-to-br/oklch font-sans">
      <h1 className="text-center text-xl font-semibold text-white">
        Missing Configurations for Analytics
      </h1>
      <p className="mt-1 text-center text-xs text-white/60">
        Please contact Deepmodel for more information.
      </p>
    </section>
  );
};

export default PosthogProvider;
