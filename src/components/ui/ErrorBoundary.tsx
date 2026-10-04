import { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { strings } from '../../constants/strings';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <Text className="text-red-500 dark:text-red-400 text-lg font-semibold mb-2">
              {strings.somethingWentWrong}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">
              {this.state.error?.message ?? strings.unknownError}
            </Text>
            <TouchableOpacity
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel={strings.retry}
              className="bg-indigo-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">{strings.retry}</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }
    return this.props.children;
  }
}
