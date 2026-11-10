import styled from '@emotion/styled';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
const NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE=32;
const StyledItem = styled.button`
  align-items: center;
  background: ${({ active, variant }) =>
    active || variant === 'placeholder'
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border: ${({ isSelectedInEditMode }) =>
    isSelectedInEditMode
      ? `1px solid ${themeCssVariables.color.blue}`
      : '1px solid transparent'};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${({ active, isSoon, variant }) => {
    if (variant === 'placeholder') {
      return themeCssVariables.font.color.light;
    }
    if (variant === 'tertiary') {
      return themeCssVariables.font.color.tertiary;
    }
    if (active === true) {
      return themeCssVariables.font.color.primary;
    }
    if (isSoon) {
      return themeCssVariables.font.color.light;
    }
    return themeCssVariables.font.color.secondary;
  }};
  cursor: ${({ isSoon, isDragging }) =>
    isDragging ? 'grabbing' : isSoon ? 'default' : 'pointer'};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  height: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? themeCssVariables.spacing[7]
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  margin-top: ${({ indentationLevel }) =>
    indentationLevel === 2 ? '2px' : '0'};
  min-width: 0;
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? themeCssVariables.spacing[1]
      : `calc(${themeCssVariables.spacing[2]} - 1px)`};
  padding-right: ${({ hasRightOptions, isNavigationDrawerExpanded }) =>
    hasRightOptions && isNavigationDrawerExpanded
      ? themeCssVariables.spacing['0.5']
      : themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
  pointer-events: ${({ isSoon, variant }) =>
    isSoon || variant === 'placeholder' ? 'none' : 'auto'};
  text-decoration: none;
  user-select: none;
  width: ${({ isNavigationDrawerExpanded, hasRightOptions }) =>
    !isNavigationDrawerExpanded
      ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`
      : `calc(100% - ${themeCssVariables.spacing['1.5']} + ${themeCssVariables.spacing[1]} + ${hasRightOptions ? themeCssVariables.spacing['0.5'] : themeCssVariables.spacing[1]})`};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${({ variant }) =>
      variant === 'tertiary'
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.font.color.primary};
  }

  &:has(.navigation-drawer-item-label:focus-visible) {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: ${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px;
  }
`;

const StyledItemElementsContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledLabelParent = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0px;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
  }
`;

const StyledItemLabel = styled.span<{ $isUnread: boolean }>`
  color: ${({ $isUnread }) =>
    $isUnread ? themeCssVariables.font.color.primary : 'inherit'};
  font-weight: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
`;

const StyledItemSecondaryLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledNavigationDrawerItemContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledSpacer = styled.span`
  flex-grow: 1;
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: center;
  margin-right: ${themeCssVariables.spacing[2]};
  position: relative;
`;


export function DrawerItem({icon,label,active,onClick}){
return <StyledItem active={active} isNavigationDrawerExpanded onClick={onClick}><StyledItemElementsContainer><StyledIcon>{icon}</StyledIcon><StyledLabelParent><StyledItemLabel>{label}</StyledItemLabel></StyledLabelParent></StyledItemElementsContainer></StyledItem>
}
