import {RootState} from '@/redux/store';
import {useSelector} from 'react-redux';

export const useIsFetching = () => {
  return useSelector((state: RootState) =>
    Object.values(state).some(slice => (slice as any)?.loading === true),
  );
};
