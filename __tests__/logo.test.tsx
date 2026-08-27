import { render } from '@testing-library/react-native';
import { Logo } from '../src/components/brand/Logo';

// useThemeColors reads the theme store; default is light
jest.mock('../src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    primary: '#6366F1',
    text: '#111827',
    textSecondary: '#6B7280',
  }),
}));

describe('Logo', () => {
  it('renders the mark image with the requested size', () => {
    const { getByLabelText } = render(<Logo size={64} accessibilityLabel="EmprendePlus logo" />);
    const img = getByLabelText('EmprendePlus logo');
    expect(img).toBeTruthy();
  });

  it('renders the app name when showName is true', () => {
    const { getByText } = render(<Logo showName />);
    expect(getByText('EmprendePlus')).toBeTruthy();
  });

  it('does not render the name by default', () => {
    const { queryByText } = render(<Logo />);
    expect(queryByText('EmprendePlus')).toBeNull();
  });
});
