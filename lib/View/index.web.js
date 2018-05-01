// @flow

import Expo from 'expo';
import GLView from '../GLView';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

type Layout = {
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
};

type Props = {
  arEnabled?: ?boolean,
  onShouldReloadContext?: () => boolean,
  onContextCreate?: (props: *) => void,
  onResize?: (layout: Layout) => void,
  shouldIgnoreSafeGaurds?: ?boolean,
} & React.ElementProps<typeof GLView>;

function uuidv4() {
  //https://stackoverflow.com/a/2117523/4047926
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default class GraphicsView extends React.Component<Props> {
  nativeRef: ?HTMLCanvasElement;
  gl: ?any;

  state = {
    id: uuidv4(),
  };

  _renderErrorView = error => (
    <View style={styles.errorContainer}>
      <Text>{error}</Text>
    </View>
  );

  componentDidMount() {
    window.addEventListener('resize', this._onLayout);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onLayout);
    this.destroy();
  }

  destroy = () => {
    this.gl = null;
    this.nativeRef = null;
    this.arSession = null;
    cancelAnimationFrame(this.rafID);
  };

  render() {
    if (!this.props.shouldIgnoreSafeGaurds) {
      if (this.props.arEnabled) {
        const message = 'ExpoGraphics.View: AR is not enabled in web yet!';
        console.error(message);
        return this._renderErrorView(message);
      }
    }

    return (
      <GLView
        key={this.state.id}
        nativeRef_EXPERIMENTAL={ref => (this.nativeRef = ref)}
        style={[styles.container, this.props.style]}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _onLayout = () => {
    if (!this.gl || !this.nativeRef) {
      return;
    }
    this.props.onResize &&
      this.props.onResize({
        x: this.nativeRef.screenX,
        y: this.nativeRef.screenY,
        width: this.nativeRef.clientWidth,
        height: this.nativeRef.clientHeight,
        scale: window.devicePixelRatio,
      });
  };

  _onContextCreate = async ({ gl, ...props }) => {
    this.gl = gl;

    await this.props.onContextCreate({ gl, ...props });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'red',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
