import { useState, useEffect, RefObject } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
}

export const useIntersectionObserver = (
    ref: RefObject<Element | null>, // Modified to accept null which is common with useRef
    options: UseIntersectionObserverOptions = {}
): boolean => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Load once, then stop observing
                }
            },
            {
                threshold: options.threshold || 0,
                rootMargin: options.rootMargin || '100px' // Default: load 100px before appearing
            }
        );
        
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        
        return () => {
            observer.disconnect();
        };
    }, [ref, options.threshold, options.rootMargin]);
    
    return isVisible;
};
