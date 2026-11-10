import { isValidElement } from 'react';
import { useTheme } from 'twenty-ui/theme';

import type { ElementType, ReactElement } from 'react';

type NavigationDrawerItemIconProps = {
  Icon: ElementType | ReactElement;
  color: string;
};

export const NavigationDrawerItemIcon = ({
  Icon,
  color,
}: NavigationDrawerItemIconProps) => {
  const theme = useTheme();

  if (isValidElement(Icon)) {
    return Icon;
  }

  return (
    <Icon
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.md}
      color={color}
    />
  );
};
