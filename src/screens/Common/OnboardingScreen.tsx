import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { setOnboardingCompleted } from '../../utils/userPreferences';
import { useAppLanguage } from '../../utils/i18n';

const { width } = Dimensions.get('window');

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    icon: string;
    accentColor: string;
    iconBg: string;
}

export const OnboardingScreen: React.FC = () => {
    const { t } = useAppLanguage();
    const navigation = useNavigation<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const slides: Slide[] = [
        {
            id: '1',
            badge: t('onboarding.slide1Badge'),
            title: t('onboarding.slide1Title'),
            subtitle: t('onboarding.slide1Sub'),
            icon: 'timer-outline',
            accentColor: '#4F46E5',
            iconBg: '#EEF2FF',
        },
        {
            id: '2',
            badge: t('onboarding.slide2Badge'),
            title: t('onboarding.slide2Title'),
            subtitle: t('onboarding.slide2Sub'),
            icon: 'school-outline',
            accentColor: '#2563EB',
            iconBg: '#EFF6FF',
        },
        {
            id: '3',
            badge: t('onboarding.slide3Badge'),
            title: t('onboarding.slide3Title'),
            subtitle: t('onboarding.slide3Sub'),
            icon: 'trending-up-outline',
            accentColor: '#059669',
            iconBg: '#ECFDF5',
        },
    ];

    const handleFinishOnboarding = async () => {
        const userId = user?.id || (user as any)?.sub;
        if (userId) {
            await setOnboardingCompleted(userId);
        }

        if (user?.role === 'mentor') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'MentorTab' }],
            });
        } else if (user?.role === 'student') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTab' }],
            });
        } else {
            navigation.navigate('RoleSelection');
        }
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinishOnboarding();
        }
    };

    const handleSkip = () => {
        handleFinishOnboarding();
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const currentSlide = slides[currentIndex] || slides[0];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* TOP BAR */}
            <View style={styles.topBar}>
                <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>
                        {currentIndex + 1} / {slides.length}
                    </Text>
                </View>

                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* SLIDES LIST */}
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <View style={styles.slideContainer}>
                        {/* ICON CIRCLE */}
                        <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
                            <View style={[styles.innerIconCircle, { backgroundColor: item.accentColor }]}>
                                <Ionicons name={item.icon} size={64} color="#FFFFFF" />
                            </View>
                        </View>

                        {/* CONTENT CARD */}
                        <View style={styles.contentContainer}>
                            <View style={[styles.categoryBadge, { backgroundColor: item.iconBg }]}>
                                <Text style={[styles.categoryBadgeText, { color: item.accentColor }]}>
                                    {item.badge}
                                </Text>
                            </View>

                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        </View>
                    </View>
                )}
            />

            {/* BOTTOM CONTROLS */}
            <View style={styles.bottomBar}>
                {/* DOTS */}
                <View style={styles.paginationDots}>
                    {slides.map((_, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    isActive && [styles.activeDot, { backgroundColor: currentSlide.accentColor }],
                                ]}
                            />
                        );
                    })}
                </View>

                {/* ACTION BUTTON */}
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: currentSlide.accentColor }]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
                    </Text>
                    <Ionicons
                        name={currentIndex === slides.length - 1 ? 'arrow-forward-circle' : 'arrow-forward'}
                        size={20}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        height: 54,
    },
    stepBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    stepBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    skipButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    slideContainer: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconWrapper: {
        width: 170,
        height: 170,
        borderRadius: 85,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 36,
    },
    innerIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    contentContainer: {
        alignItems: 'center',
    },
    categoryBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 14,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 23,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    bottomBar: {
        paddingHorizontal: 24,
        paddingBottom: 28,
        paddingTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    paginationDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
    },
    activeDot: {
        width: 24,
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 26,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default OnboardingScreen;
