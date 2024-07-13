import React, { useState, useCallback, ComponentType } from 'react';
import { ScrollView, RefreshControl } from 'react-native';

export function withRefreshControl<P extends object>(WrappedComponent: ComponentType<P>): ComponentType<P> {
  return function RefreshControlWrapper(props: P): JSX.Element {
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
    }, []);

    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <WrappedComponent {...props} />
      </ScrollView>
    );
  };
};

export default withRefreshControl;