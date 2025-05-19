import DropdownButton from "./DropdownButton";
import DropdownMenu from "./DropdownMenu";
import DropdownMenuItem from "./DropdownMenuItem";
import DropdownRoot from "./DropdownRoot";
import DropdownSeparator from "./DropdownSeparator";

export default Object.assign(DropdownRoot, {
  Item: DropdownMenuItem,
  Button: DropdownButton,
  Menu: DropdownMenu,
  Divider: DropdownSeparator,
});

/* 
 Dependencies:
 @radix-ui/react-dialog - Radix UI components for dialog
 tailwindcss - Utility-first CSS framework for styling
 framer-motion - Motion library for React to animate the components

 Install dependencies:
 npm install @radix-ui/react-dialog tailwindcss framer-motion

      <Dropdown>
        <Dropdown.Button>
          Open Menu
        </Dropdown.Button>
        <Dropdown.Menu>
          <Dropdown.Item onSelect={() => console.log('Item 1 clicked')}>
            Item 1
          </Dropdown.Item>
          <Dropdown.Item onSelect={() => console.log('Item 2 clicked')}>
            Item 2
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onSelect={() => console.log('Item 3 clicked')}>
            Item 3
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
*/
