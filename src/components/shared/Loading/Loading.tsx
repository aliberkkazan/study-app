import React from 'react';
import {StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '@/constant';
import {useIsFetching} from '@/helper';
import {Block} from '../Block';

type Props = {
  visible?: boolean;
};

function Loading({visible = false}: Props) {
  const isFetching = useIsFetching();
  // eslint-disable-next-line curly
  const showLoading = visible || isFetching;
  if (!showLoading) return null;

  return (
    <Block
      flex={0}
      align="center"
      justify="center"
      style={styles.screenOverlay}>
      <LottieView
        source={require('../../../assets/animations/loading_animation.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </Block>
  );
}

const styles = StyleSheet.create({
  screenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT / 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  lottie: {
    width: 150,
    height: 150,
  },
});

export default Loading;
