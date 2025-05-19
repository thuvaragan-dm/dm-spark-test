import DialogButton from "./DialogButton";
import DialogClose from "./DialogClose";
import DialogContent from "./DialogContent";
import DialogDescription from "./DialogDescription";
import DialogFooter from "./DialogFooter";
import DialogHeader from "./DialogHeader";
import DialogRoot from "./DialogRoot";
import DialogTitle from "./DialogTitle";

export default Object.assign(DialogRoot, {
  Button: DialogButton,
  Title: DialogTitle,
  Description: DialogDescription,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Close: DialogClose,
});

/* 
 Dependencies:
 @radix-ui/react-dropdown-menu - Radix UI components for dropdown menu
 tailwindcss - Utility-first CSS framework for styling
 framer-motion - Motion library for React to animate the components

 Install dependencies:
 npm install @radix-ui/react-dropdown-menu tailwindcss framer-motion

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Button asChild>
          <button>edit</button>
        </Dialog.Button>
        <Dialog.Content className="sm:max-w-[425px]">
          <Dialog.Header>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>
              Make changes to your profile here. Click save when you're done.
            </Dialog.Description>
          </Dialog.Header>
          <div >hello</div>
        </Dialog.Content>
      </Dialog>
*/
