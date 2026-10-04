import {
  Image,
  ImageProps,
  View,
  Text,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface LogoProps extends Omit<ImageProps, 'source'> {
  /** The logo asset to show. */
  variant?: 'mark' | 'icon';
  /** Size of the logo (default 48). */
  size?: number;
  /** When true, show the app name next to the logo. */
  showName?: boolean;
  /** When true, render the name in white (for dark/indigo backgrounds). */
  nameColor?: string;
  /** Style for the wrapping row (for showName layout). */
  containerStyle?: ViewStyle;
  /** Style passed through to the Image. */
  style?: ImageStyle;
}

const logoAssets = {
  mark: require('../../../assets/logo-mark.png'),
  icon: require('../../../assets/icon.png'),
} as const;

/**
 * Emprende+ brand logo.
 *
 * - `variant="mark"` (default): the multicolor growth-bar mark on a
 *   transparent background.  Reads well on light surfaces and light cards.
 * - `variant="icon"`: the full app icon (indigo gradient + white mark).
 *
 * Optionally renders the app name beside the mark.
 */
export function Logo({
  variant = 'mark',
  size = 48,
  showName = false,
  nameColor,
  containerStyle,
  style,
  ...rest
}: LogoProps) {
  const c = useThemeColors();
  const textColor = nameColor ?? c.text;

  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 10 },
        containerStyle,
      ]}
    >
      <Image
        source={logoAssets[variant]}
        style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
        {...rest}
      />
      {showName && (
        <Text
          style={{
            fontSize: Math.round(size * 0.42),
            fontWeight: '700',
            color: textColor,
            letterSpacing: -0.5,
          }}
        >
          Emprende+
        </Text>
      )}
    </View>
  );
}
