import type { ReactNode } from 'react';
import {
    Map,
    ScanFace,
    Languages,
    Store,
    ClipboardList,
    ShoppingCart,
    ShoppingBag,
    Ticket,
    Truck,
    History,
    RefreshCcw,
    Users,
    Target,
    Trophy,
    User as UserIcon,
    MapPin,
    CreditCard,
    Coins,
    HelpCircle,
    MessageSquare,
    AlertTriangle,
    Code,
    LayoutDashboard,
} from 'lucide-react';

export type NavItem = {
    path?: string;
    label: string;
    icon: ReactNode;
    description: string;
    disabled?: boolean;
    badge?: string;
    badgeColor?: string; // e.g. "bg-orange-100 text-orange-700"
};

export type NavSection = {
    title: string;
    items: NavItem[];
};

/**
 * Hàm lấy danh sách các nhóm tính năng (NavSections) dựa trên phân quyền người dùng.
 * Phân chia theo hành trình: Khám phá -> Đặt và mua -> Theo dõi -> Cộng đồng -> Tài khoản -> Hỗ trợ.
 * @param isAdmin - Cờ xác định user hiện tại có phải là Admin hay không để hiển thị thêm menu Quản trị.
 * @returns Mảng các NavSection cấu trúc sidebar.
 */
export const getNavSections = (isAdmin: boolean): NavSection[] => {
    const sections: NavSection[] = [
        {
            title: 'Khám phá',
            items: [
                { path: '/itinerary', label: 'Lịch trình', icon: <Map className="h-5 w-5" />, description: 'Gợi ý quán' },
                { path: '/scan', label: 'Quét món', icon: <ScanFace className="h-5 w-5" />, description: 'Nhận diện món' },
                { path: '/menu', label: 'Menu AI', icon: <Languages className="h-5 w-5" />, description: 'Đề xuất AI' },
                { path: '/market', label: 'Chợ món', icon: <Store className="h-5 w-5" />, description: 'Khám phá quán' },
            ],
        },
        {
            title: 'Đặt và mua',
            items: [
                { label: 'Đặt hàng', icon: <ClipboardList className="h-5 w-5" />, description: 'Order trực tiếp', disabled: true, badge: 'Soon' },
                { label: 'Giỏ hàng', icon: <ShoppingCart className="h-5 w-5" />, description: 'Giỏ hàng của bạn', disabled: true, badge: 'Soon' },
                { path: '/store', label: 'Cửa hàng', icon: <ShoppingBag className="h-5 w-5" />, description: 'Voucher & Quà' },
                { label: 'Voucher', icon: <Ticket className="h-5 w-5" />, description: 'Mã giảm giá', disabled: true, badge: 'Soon' },
            ],
        },
        {
            title: 'Theo dõi',
            items: [
                { label: 'Theo dõi đơn', icon: <Truck className="h-5 w-5" />, description: 'Tracking đơn hàng', disabled: true, badge: 'Soon' },
                { label: 'Lịch sử đơn', icon: <History className="h-5 w-5" />, description: 'Đơn đã đặt', disabled: true, badge: 'Soon' },
                { label: 'Hoàn tiền', icon: <RefreshCcw className="h-5 w-5" />, description: 'Đổi trả/Khiếu nại', disabled: true, badge: 'Soon' },
            ],
        },
        {
            title: 'Cộng đồng',
            items: [
                { path: '/group', label: 'Nhóm ăn', icon: <Users className="h-5 w-5" />, description: 'Lên lịch cùng bạn bè' },
                { path: '/quests', label: 'Nhiệm vụ', icon: <Target className="h-5 w-5" />, description: 'Tích điểm thưởng' },
                { label: 'Xếp hạng', icon: <Trophy className="h-5 w-5" />, description: 'Bảng xếp hạng', disabled: true, badge: 'Soon' },
            ],
        },
        {
            title: 'Tài khoản',
            items: [
                { path: '/profile', label: 'Hồ sơ', icon: <UserIcon className="h-5 w-5" />, description: 'Thông tin cá nhân' },
                { label: 'Địa chỉ', icon: <MapPin className="h-5 w-5" />, description: 'Địa chỉ giao hàng', disabled: true, badge: 'Soon' },
                { label: 'Thanh toán', icon: <CreditCard className="h-5 w-5" />, description: 'Phương thức TT', disabled: true, badge: 'Soon' },
                { label: 'Điểm thưởng', icon: <Coins className="h-5 w-5" />, description: 'Taste Points', disabled: true, badge: 'Soon' },
            ],
        },
        {
            title: 'Hỗ trợ',
            items: [
                { label: 'Trợ giúp', icon: <HelpCircle className="h-5 w-5" />, description: 'Trung tâm trợ giúp', disabled: true, badge: 'Soon' },
                { label: 'Chat', icon: <MessageSquare className="h-5 w-5" />, description: 'Chat với CSKH', disabled: true, badge: 'Soon' },
                { label: 'Báo lỗi', icon: <AlertTriangle className="h-5 w-5" />, description: 'Báo cáo sự cố', disabled: true, badge: 'Soon' },
            ],
        },
    ];

    if (isAdmin) {
        sections.push({
            title: 'Quản trị',
            items: [
                { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, description: 'Tổng quan' },
                { path: '/admin/settings', label: 'Developer', icon: <Code className="h-5 w-5" />, description: 'Hệ thống' },
            ],
        });
    }
    
    return sections;
};
