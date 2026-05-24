
import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from '@/components';
import { addSubmission } from '../../redux/dataSlice';
import { fetchCurrentUser } from '../../redux/authSlice';
import { useFocusEffect } from '@react-navigation/native';
import { lightTheme } from '../../theme/theme';

const UploadTestScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth) || {};
    const { loading } = useSelector((state: any) => state.data);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const hasMentors = user?.mentors && user.mentors.length > 0;

    useFocusEffect(
        useCallback(() => {
            if (!hasMentors) {
                dispatch(fetchCurrentUser() as any);
            }
        }, [dispatch, hasMentors])
    );

    const handleSelectImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            includeBase64: true,
            quality: 0.5,
        });

        if (result.didCancel) {
            return;
        }

        if (result.errorCode) {
            Alert.alert('Error', result.errorMessage);
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            if (asset.base64 && asset.type) {
                const base64Image = `data:${asset.type};base64,${asset.base64}`;
                setSelectedImage(base64Image);
            } else {
                Alert.alert('Error', 'Could not process image');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        const studentId = user?.id; // Use real user ID

        if (!studentId) {
            Alert.alert('Error', 'User validation failed');
            return;
        }

        try {
            await dispatch(addSubmission({
                studentId,
                imageUrl: selectedImage,
            }) as any).unwrap();

            setSelectedImage(null);
            Alert.alert('Success', 'Submission uploaded successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to upload');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Upload Solved Test</Text>

            <View style={styles.uploadArea}>
                {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.preview} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                )}

                <Button
                    mode="contained"
                    onPress={handleSelectImage}
                    style={styles.selectButton}
                    disabled={!hasMentors}
                >
                    Select Page Photo
                </Button>

                {!hasMentors && (
                    <Text style={styles.warningText}>
                        You must be connected to a mentor to upload photos.
                    </Text>
                )}
            </View>

            <Button
                mode="contained"
                onPress={handleUpload}
                disabled={!selectedImage || loading || !hasMentors}
                loading={loading}
                style={styles.uploadButton}
            >
                Upload to Mentor
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: lightTheme.colors.background,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: lightTheme.colors.text,
    },
    uploadArea: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
    },
    preview: {
        width: 300,
        height: 400,
        borderRadius: 12,
        marginBottom: 16,
    },
    placeholder: {
        width: 300,
        height: 400,
        backgroundColor: lightTheme.colors.card,
        borderRadius: 12,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: lightTheme.colors.gray, // Fixed border color
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#999',
    },
    selectButton: {
        marginBottom: 10,
    },
    uploadButton: {
        width: '100%',
    },
    warningText: {
        color: '#FF6B6B',
        marginTop: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default UploadTestScreen;
