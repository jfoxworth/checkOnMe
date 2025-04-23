import { useState, useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

/**
 * Hook to manage collapsible header state based on scroll position.
 * 
 * For a complete implementation, use with a Header component that has 
 * 'collapsible' and 'visible' props, and a ScrollView/FlatList with 
 * the handleScroll function connected to onScroll.
 * 
 * @example
 * ```
 * // In your screen component:
 * const { isVisible, handleScroll } = useCollapsibleHeader();
 * 
 * return (
 *   <>
 *     <Header
 *       collapsible
 *       visible={isVisible}
 *       title="My Screen"
 *     />
 *     <ScrollView
 *       onScroll={handleScroll}
 *       scrollEventThrottle={16}
 *     >
 *       // Your content
 *     </ScrollView>
 *   </>
 * );
 * ```
 * 
 * @param options Configuration options
 * @param options.initialState Initial visibility state (default: true)
 * @param options.threshold Scroll distance threshold to trigger header visibility change (default: 10)
 * @returns Object containing the visibility state and scroll handler
 */
export function useCollapsibleHeader({
  initialState = true,
  threshold = 5,
} = {}) {
  // Track header visibility state
  const [isVisible, setIsVisible] = useState(initialState);
  const lastScrollY = useRef(0);

  // Handle scroll events to show/hide header
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;
    
    // Only trigger change if we've scrolled more than the threshold
    if (Math.abs(scrollDelta) >= threshold) {
      if (scrollDelta > 0) {
        // Scrolling down - hide header
        if (isVisible) {
          setIsVisible(false);
        }
      } else {
        // Scrolling up - show header
        if (!isVisible) {
          setIsVisible(true);
        }
      }
    }

    lastScrollY.current = currentScrollY;
  };

  return {
    isVisible,
    handleScroll,
    // For manual control
    setIsVisible,
  };
}

export default useCollapsibleHeader; 