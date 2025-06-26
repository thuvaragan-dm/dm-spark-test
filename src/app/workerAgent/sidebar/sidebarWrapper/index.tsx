import { useEffect, useState } from "react";
import DesktopSidebarWrapper from "./DesktopSidebarWrapper";
import MobileSidebarWrapper from "./MobileSidebarWrapper";
import { MotionComponent } from "../../../../types/type-utils";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";

export interface ISidebarWrapper extends MotionComponent<"aside"> {}

// The pattern below is chosen to avoid hydration issues caused by rendering different UI on the server and client.
// By delaying the rendering until after the component is mounted, we ensure that the correct sidebar version is rendered based on the actual screen size.
const SidebarWrapper = ({ children, ...rest }: ISidebarWrapper) => {
  const isMd = useBreakpoint("md");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DesktopSidebarWrapper {...rest}>{children}</DesktopSidebarWrapper>;
  }

  if (isMd) {
    return <DesktopSidebarWrapper {...rest}>{children}</DesktopSidebarWrapper>;
  } else {
    return <MobileSidebarWrapper {...rest}>{children}</MobileSidebarWrapper>;
  }
};

export { SidebarWrapper };
