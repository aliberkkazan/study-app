import React from 'react';
import { Modal, StyleSheet, View, Image, TouchableOpacity, ScrollView, Dimensions, Text } from 'react-native';
import { Icon } from './Icon'; // Assuming Icon is in the same shared folder or accessible

interface ImageViewerProps {
    visible: boolean;
    imageUrl: string;
    onClose: () => void;
}

const ImageViewer = ({ visible, imageUrl, onClose }: ImageViewerProps) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    centerContent={true}
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    image: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    closeText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default ImageViewer;
