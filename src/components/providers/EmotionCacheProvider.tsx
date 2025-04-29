'use client';

import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { useState } from 'react';

export default function EmotionCacheProvider({
    children,
    options = { key: 'mui' },
}: {
    children: React.ReactNode;
    options?: Parameters<typeof createCache>[0];
}) {
    const [registry] = useState(() => {
        const cache = createCache(options);
        cache.compat = true;
        const prevInsert = cache.insert;
        let inserted: string[] = [];
        cache.insert = (...args) => {
            const serialized = prevInsert.apply(null, args);
            if (serialized) {
                inserted.push(serialized);
            }
            return serialized;
        };
        const flush = () => {
            const prevInserted = inserted;
            inserted = [];
            return prevInserted;
        };
        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const inserted = registry.flush();
        if (inserted.length === 0) {
            return null;
        }
        return (
            <style
                key={registry.cache.key}
                data-emotion={`${registry.cache.key} ${inserted.join(' ')}`}
                dangerouslySetInnerHTML={{
                    __html: inserted.join(' '),
                }}
            />
        );
    });

    return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
