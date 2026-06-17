/**
 * 获取 hash 路由中的额外参数
 */
import { useState, useEffect } from 'react';
import { parseHashParams } from './useHashPage';

export function useHashParams(): Record<string, string> {
    const [params, setParams] = useState<Record<string, string>>(() => {
        if (typeof window === 'undefined') return {};
        return parseHashParams(window.location.hash);
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const onHashChange = () => {
            setParams(parseHashParams(window.location.hash));
        };

        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    return params;
}
