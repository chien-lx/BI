/**
 * 应用级导航 hook
 * 允许子页面进行页面跳转并传递参数
 */
import { useCallback } from 'react';

export function useNavigate() {
    const navigate = useCallback((pageId: string, params?: Record<string, string>) => {
        if (typeof window === 'undefined') return;
        let hash = `page=${pageId}`;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                hash += `&${key}=${encodeURIComponent(value)}`;
            });
        }
        window.location.hash = hash;
    }, []);

    return { navigate };
}
