import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param {any} value The value to debounce (e.g., a search term)
 * @param {number} delay The debounce delay in milliseconds (e.g., 300)
 * @returns {any} The debounced value
 */
function useDebounce(value, delay) {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes (or component unmounts)
        // This is how we "cancel" the previous timer
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run if value or delay changes

    return debouncedValue;
}

export default useDebounce;