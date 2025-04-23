import { useTheme } from './ThemeContext';

export const useThemeColors = () => {
  const { isDark } = useTheme();

  return {
    icon: isDark ? 'white' : 'black',
    bg: isDark ? '#0A0A0A' : '#ffffff',
    invert: isDark ? '#000000' : '#ffffff',
    secondary: isDark ? '#171717' : '#E2E8F0',
    state: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    sheet: isDark ? '#171717' : '#ffffff',
    highlight: '#0EA5E9',    
    lightDark: isDark ? '#262626' : 'white',
    border: isDark ? '#404040' : '#E2E8F0',
    text: isDark ? 'white' : 'black',
    placeholder: isDark ? '#697F8D' : '#A5ABB4',
    switch: isDark ? 'rgba(255,255,255,0.4)' : '#ccc',
    chatBg: isDark ? '#262626' : '#efefef',
    isDark
  };
};

export default useThemeColors;