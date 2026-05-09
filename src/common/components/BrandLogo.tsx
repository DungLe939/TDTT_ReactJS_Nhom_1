import { useTheme } from 'next-themes';

/**
 * Props cho BrandLogo component.
 * @param variant - 'full' (icon + text), 'icon' (chỉ icon), 'text' (chỉ text)
 * @param size - Kích thước: 'sm' | 'md' | 'lg' | 'xl'
 * @param theme - Theme cố định hoặc 'auto' (theo system)
 * @param animated - Có hiệu ứng hover không
 * @param className - Class CSS tùy chỉnh thêm
 */
type BrandLogoProps = {
    variant?: 'full' | 'icon' | 'text';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    theme?: 'light' | 'dark' | 'auto';
    animated?: boolean;
    className?: string;
};

/** Kích thước icon theo variant size */
const ICON_SIZES = {
    sm: 32,
    md: 44,
    lg: 56,
    xl: 72,
} as const;

/**
 * Logo SVG icon — Hương Vị Bản Địa
 * Thiết kế: Nón lá + Pin bản đồ + Muỗng & Nĩa trong khung hình thoi (diamond)
 */
const LogoIcon = ({ size = 44, color = '#F97316' }: { size?: number; color?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        {/* Diamond border — viền hình thoi xoay 45° */}
        <g transform="translate(100,100) rotate(45)">
            <rect
                x="-62"
                y="-62"
                width="124"
                height="124"
                rx="18"
                stroke={color}
                strokeWidth="10"
                fill="none"
            />
        </g>

        {/* Nón lá (conical hat) — tam giác cong ở phần trên */}
        <path
            d="M100 52 L68 108 Q100 118 132 108 Z"
            fill={color}
            opacity="0.95"
        />

        {/* Viền cong dưới nón lá — tạo cảm giác vành nón */}
        <path
            d="M56 110 Q78 125 100 122 Q122 125 144 110"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
        />

        {/* Pin bản đồ nhỏ trên đỉnh nón */}
        <circle cx="100" cy="62" r="6" fill="white" />
        <path
            d="M100 50 C92 50 86 56 86 63 C86 72 100 82 100 82 C100 82 114 72 114 63 C114 56 108 50 100 50Z"
            fill={color}
        />
        <circle cx="100" cy="62" r="5" fill="white" />

        {/* Nĩa (fork) — bên trái */}
        <g transform="translate(82, 120)">
            {/* Thân nĩa */}
            <rect x="4" y="18" width="5" height="28" rx="2.5" fill={color} />
            {/* Đầu nĩa 3 răng */}
            <rect x="-2" y="0" width="3.5" height="18" rx="1.75" fill={color} />
            <rect x="4.5" y="0" width="3.5" height="18" rx="1.75" fill={color} />
            <rect x="11" y="0" width="3.5" height="18" rx="1.75" fill={color} />
        </g>

        {/* Muỗng (spoon) — bên phải */}
        <g transform="translate(105, 120)">
            {/* Thân muỗng */}
            <rect x="5" y="22" width="5" height="24" rx="2.5" fill={color} />
            {/* Đầu muỗng oval */}
            <ellipse cx="7.5" cy="10" rx="10" ry="12" fill={color} />
            <ellipse cx="7.5" cy="9" rx="6" ry="7.5" fill="white" opacity="0.3" />
        </g>
    </svg>
);

/**
 * BrandLogo — Component thương hiệu tái sử dụng cho toàn bộ app.
 *
 * Sử dụng:
 * ```tsx
 * <BrandLogo variant="full" size="md" />
 * <BrandLogo variant="icon" size="sm" animated />
 * <BrandLogo variant="text" size="lg" theme="dark" />
 * ```
 */
export const BrandLogo = ({
    variant = 'full',
    size = 'md',
    theme: themeProp = 'auto',
    animated = true,
    className = '',
}: BrandLogoProps) => {
    const { theme: systemTheme } = useTheme();
    const currentTheme = themeProp === 'auto' ? systemTheme : themeProp;
    const isDark = currentTheme === 'dark';

    const iconSize = ICON_SIZES[size];

    // Text size tương ứng
    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
    }[size];

    const subTextSizeClasses = {
        sm: 'text-[9px]',
        md: 'text-xs',
        lg: 'text-xs',
        xl: 'text-sm',
    }[size];

    return (
        <div
            className={`
                flex items-center gap-2.5
                ${animated ? 'transition-transform duration-300 hover:scale-[1.03]' : ''}
                ${className}
            `}
        >
            {/* Icon */}
            {(variant === 'full' || variant === 'icon') && (
                <div
                    className={`
                        shrink-0 flex items-center justify-center rounded-2xl
                        ${animated
                            ? 'transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 dark:hover:shadow-orange-500/15'
                            : ''
                        }
                    `}
                    style={{ width: iconSize, height: iconSize }}
                >
                    <LogoIcon
                        size={iconSize}
                        color={isDark ? '#FB923C' : '#F97316'}
                    />
                </div>
            )}

            {/* Text */}
            {(variant === 'full' || variant === 'text') && (
                <div className="min-w-0">
                    <p
                        className={`
                            ${textSizeClasses} font-bold truncate leading-tight
                            ${isDark ? 'text-white' : 'text-neutral-900'}
                        `}
                    >
                        Hương Vị{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                            Bản Địa
                        </span>
                    </p>
                    <p
                        className={`
                            ${subTextSizeClasses} font-semibold uppercase tracking-[0.16em] truncate
                            text-orange-500 dark:text-orange-400
                        `}
                    >
                        Food Explorer
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * Export LogoIcon riêng để dùng cho favicon, loading screen, v.v.
 */
export { LogoIcon };
