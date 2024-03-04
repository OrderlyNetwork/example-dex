import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { Link } from '@remix-run/react';
import { FunctionComponent, useState } from 'react';

import { WalletConnection } from '~/components/WalletConnection';

export const NavBar: FunctionComponent = () => {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <nav className="flex flex-self-stretch gap-sm flex-justify-end align-center">
      <h2 className="flex-auto m0">Orderly DEX</h2>
      <WalletConnection />
      <DropdownMenu.Root open={open}>
        <DropdownMenu.Trigger>
          <Button
            variant="soft"
            onClick={() => {
              setOpen(!open);
            }}
          >
            Navigation
            <HamburgerMenuIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content onPointerDownOutside={closeMenu}>
          <DropdownMenu.Item className="p0">
            <Link to="/" className="w-full h-full px5 line-height-8" onClick={closeMenu}>
              Home
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="p0">
            <Link to="/account" className="w-full h-full px5 line-height-8" onClick={closeMenu}>
              Account
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>TODO</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </nav>
  );
};
