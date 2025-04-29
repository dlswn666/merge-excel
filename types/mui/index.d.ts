// MUI 아이콘 타입 선언
import { SvgIconProps } from '@mui/material';
import * as React from 'react';

declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGSVGElement>>;
    export default content;
}

// MUI 아이콘 모듈 타입 선언
declare module '@mui/icons-material/*' {
    const Icon: React.ForwardRefExoticComponent<
        React.PropsWithoutRef<SvgIconProps> & React.RefAttributes<SVGSVGElement>
    >;
    export default Icon;
}
