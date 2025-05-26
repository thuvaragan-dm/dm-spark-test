import HoverCardButton from "./HoverCardButton";
import HoverCardMenu from "./HoverCardMenu";
import HoverCardRoot from "./HoverCardRoot";

export default Object.assign(HoverCardRoot, {
  Button: HoverCardButton,
  Menu: HoverCardMenu,
});

/* 
 Dependencies:
 @radix-ui/react-hover-card - Radix UI components for dialog
 tailwindcss - Utility-first CSS framework for styling
 framer-motion - Motion library for React to animate the components

 Install dependencies:
 npm install @radix-ui/react-hover-card tailwindcss framer-motion

      <HoverCard>
        <HoverCard.Button>
          Open Menu
        </HoverCard.Button>
        <HoverCard.Menu>
          your content
        </HoverCard.Menu>
      </HoverCard>
*/
