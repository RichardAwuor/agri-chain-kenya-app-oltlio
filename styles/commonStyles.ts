
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// PLUS-Kenya Brand Colors: Black, Red, Green, White
// Slogan: Integrating Kenya into global trade
export const colors = {
  primary: '#006400',      // Dark Green (Kenya flag green)
  secondary: '#DC143C',    // Crimson Red (Kenya flag red)
  accent: '#228B22',       // Forest Green
  background: '#FFFFFF',   // White background
  backgroundAlt: '#F5F5F5', // Light gray for cards
  text: '#000000',         // Black text
  textSecondary: '#4A4A4A', // Dark gray for secondary text
  textLight: '#FFFFFF',    // White text for dark backgrounds
  card: '#FFFFFF',         // White cards
  border: '#E0E0E0',       // Light border
  error: '#DC143C',        // Red for errors (using brand red)
  success: '#006400',      // Dark green for success (using brand green)
  warning: '#FF8C00',      // Dark orange for warnings
  highlight: '#FFF9C4',    // Light yellow highlight
  
  // PLUS-Kenya specific brand colors
  kenyaGreen: '#006400',   // Kenya flag green
  kenyaRed: '#DC143C',     // Kenya flag red
  kenyaBlack: '#000000',   // Kenya flag black
  kenyaWhite: '#FFFFFF',   // Kenya flag white
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: "white",
  },
});
