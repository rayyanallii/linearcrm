import styled from '@emotion/styled';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
const PAGE_BAR_MIN_HEIGHT=32;
const StyledTopBarContainer = styled.div<{ isMobile: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.noisy};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${themeCssVariables.font.size.lg};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-left: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[3] : themeCssVariables.spacing[4]};
  padding-right: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 auto;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow-x: hidden;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${themeCssVariables.spacing[1]};
  }
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-right: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  width: 100%;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  width: 100%;
`;

const StyledPageActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  gap: ${themeCssVariables.spacing[2]};

  justify-content: flex-end;
  min-width: 0;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;


export function PageHeader({icon,title,children}){
return <StyledTopBarContainer className="page-header"><StyledLeftContainer>{icon}<StyledTitleContainer>{title}</StyledTitleContainer></StyledLeftContainer><StyledPageActionContainer>{children}</StyledPageActionContainer></StyledTopBarContainer>
}
