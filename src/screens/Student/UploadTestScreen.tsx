import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Button } from '@/components';
import { addSubmission } from '../../redux/dataSlice';
import { fetchCurrentUser } from '../../redux/authSlice';
import { useFocusEffect } from '@react-navigation/native';
import { lightTheme } from '../../theme/theme';
import {
    SECURE_IMAGE_PICKER_OPTIONS,
    validateImageAsset,
    uploadImageMultipart,
} from '../../utils/fileUpload';

const UploadTestScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth) || {};
    const { loading } = useSelector((state: any) => state.data);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [previewUri, setPreviewUri] = useState<string | null>(null);

    const hasMentors = user?.mentors && user.mentors.length > 0;
    const isStudent = user?.role === 'student';

    useFocusEffect(
        useCallback(() => {
            if (!hasMentors) {
                dispatch(fetchCurrentUser() as any);
            }
        }, [dispatch, hasMentors])
    );

    const handleSelectImage = async () => {
        const result = await launchImageLibrary(SECURE_IMAGE_PICKER_OPTIONS);

        if (result.didCancel) {
            return;
        }

        if (result.errorCode) {
            Alert.alert('Error', result.errorMessage || 'Could not access photo library');
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const validation = validateImageAsset(asset);

            if (!validation.isValid) {
                Alert.alert('Invalid Image', validation.error);
                return;
            }

            setSelectedAsset(asset);
            setPreviewUri(asset.uri || null);
        }
    };

    const handleUpload = async () => {
        if (!selectedAsset || !previewUri) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        const studentId = user?.id;
        if (!studentId) {
            Alert.alert('Authentication Error', 'User identification failed. Please log in again.');
            return;
        }

        if (!isStudent) {
            Alert.alert('Access Denied', 'Only registered students can upload test evidence.');
            return;
        }

        try {
            let finalImageUrl = previewUri;

            // Attempt multipart upload to server storage
            try {
                finalImageUrl = await uploadImageMultipart(selectedAsset);
            } catch (uploadErr: any) {
                // If multipart upload fails on local storage backend, provide safe error feedback
                console.warn('Multipart upload failed:', uploadErr.message);
                Alert.alert('Upload Failed', uploadErr.message || 'File upload service unavailable');
                return;
            }

            await dispatch(addSubmission({
                studentId,
                imageUrl: finalImageUrl,
            }) as any).unwrap();

            setSelectedAsset(null);
            setPreviewUri(null);
            Alert.alert('Success', 'Submission uploaded successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit evidence');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Upload Solved Test</Text>

            <View style={styles.uploadArea}>
                {previewUri ? (
                    <Image source={{ uri: previewUri }} style={styles.preview} />
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
                disabled={!previewUri || loading || !hasMentors}
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
        borderColor: lightTheme.colors.gray,
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
