
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// import { launchImageLibrary } from 'react-native-image-picker'; 
import { AppDispatch, RootState } from '../../redux/store';
import { addSubmission } from '../../redux/dataSlice';
import { lightTheme } from '../../theme/theme';

const UploadTestScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth) || {};
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleSelectImage = async () => {
        // Mocking Image Picker for now as native modules require linking
        // In real app:
        // const result = await launchImageLibrary({ mediaType: 'photo' });
        // if (result.assets) setSelectedImage(result.assets[0].uri);

        // Mock:
        setSelectedImage('https://via.placeholder.com/300');
        Alert.alert('Mock Image Selected', 'A placeholder image has been selected for demonstration.');
    };

    const handleUpload = () => {
        if (!selectedImage) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        const studentId = user?.id || '1bf5ad6b-ad4d-456b-8509-ca3215417600'; // Fallback to existing user for demo

        dispatch(addSubmission({
            // id: Date.now().toString(), // Removed mock ID
            // studentId: 'student1',
            studentId,
            imageUrl: selectedImage,
            // timestamp: new Date().toISOString(),
            // status: 'pending',
        }) as any); // Type assertion if needed, but thunk should handle it.

        setSelectedImage(null);
        Alert.alert('Success', 'Test page uploaded for review');
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

                <TouchableOpacity style={styles.selectButton} onPress={handleSelectImage}>
                    <Text style={styles.buttonText}>Select Page Photo</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.uploadButton, !selectedImage && styles.disabledButton]}
                onPress={handleUpload}
                disabled={!selectedImage}
            >
                <Text style={styles.buttonText}>Upload to Mentor</Text>
            </TouchableOpacity>
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
        borderColor: lightTheme.colors.border,
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#999',
    },
    selectButton: {
        backgroundColor: lightTheme.colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    uploadButton: {
        backgroundColor: lightTheme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UploadTestScreen;
