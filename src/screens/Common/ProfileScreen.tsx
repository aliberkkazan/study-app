/* eslint-disable react-native/no-inline-styles */
/* eslint-disable jsx-quotes */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import {Button, Loading, IconButton, Icon, Block} from '@/components';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {
  logout,
  fetchCurrentUser,
  refreshMentorCode,
} from '../../redux/authSlice';

import {lightTheme} from '../../theme/theme';
import {useNavigation, useRoute} from '@react-navigation/native';

export const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {user: currentUser} = useSelector((state: RootState) => state.auth);
  // If 'student' param is passed, we are viewing that student's profile (as a mentor)
  // Otherwise we are viewing our own profile
  const route = useRoute();
  const studentParam = (route.params as any)?.student; // Need to useRoute or props

  // Effective user to display: studentParam or currentUser
  // BUT be careful: if studentParam exists, we show THEIR info, but role-based actions are based on currentUser
  const isViewingStudent = !!studentParam;
  const displayedUser = isViewingStudent ? studentParam : currentUser;

  // For refresh code: only if !isViewingStudent and role === MENTOR

  const {isAuthenticated, loading: authLoading} = useSelector(
    (state: RootState) => state.auth,
  );
  const {loading: dataLoading} = useSelector((state: RootState) => state.data);
  const loading = authLoading || dataLoading;

  React.useEffect(() => {
    if (!isViewingStudent && isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isViewingStudent, isAuthenticated]);

  const handleLogout = () => {
    console.log('Logout pressed');
    dispatch(logout());
  };

  const handleRefreshCode = () => {
    Alert.alert(
      'Refresh Mentor Code',
      'Are you sure? You can only do this once every 12 hours.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Refresh',
          style: 'destructive',
          onPress: () => dispatch(refreshMentorCode()),
        },
      ],
    );
  };

  const copyToClipboard = () => {
    if (displayedUser?.mentorCode) {
      Clipboard.setString(displayedUser.mentorCode);
      Alert.alert('Copied', 'Mentor code copied to clipboard');
    }
  };

  return (
    <>
      <Loading visible={loading} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.name}>{displayedUser?.name}</Text>
          <Text style={styles.email}>{displayedUser?.email}</Text>
          <Text style={styles.role}>{displayedUser?.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          {/* Show Mentor Code ONLY if viewing OWN profile and Role is Mentor */}
          {!isViewingStudent && displayedUser?.role === 'mentor' && (
            <>
              <Block flex={0} align="center" marginBottom={5}>
                <Text style={styles.label}>My Mentor Code:</Text>
                <Block flex={0} align="center" left={20} row>
                  <TouchableOpacity onPress={copyToClipboard}>
                    <Text style={styles.code}>
                      {displayedUser?.mentorCode || 'N/A'}
                    </Text>
                  </TouchableOpacity>
                  <IconButton
                    onPress={handleRefreshCode}
                    icon="refresh-circle"
                    size={22}
                    iconColor={lightTheme.colors.button as string}
                  />
                </Block>
                <Text style={styles.hint}>
                  (Tap to copy, button to refresh)
                </Text>
              </Block>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('MentorRequests' as never)}
                style={styles.actionButton}
                contentStyle={{flexDirection:'row-reverse'}}
                icon='arrow-right'>
                Connection Requests 
              </Button>
            </>
          )}

          {/* Show My Mentors if available (for Students or Mentors who have mentors) */}
          {displayedUser?.mentors && displayedUser.mentors.length > 0 && (
            <View style={styles.codeContainer}>
              <Text style={styles.label}>My Mentor(s):</Text>
              {displayedUser.mentors.map((m: any) => (
                <View
                  key={m.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}>
                  <View style={{marginRight: 8}}>
                    <Icon
                      source="school"
                      size={20}
                      color={lightTheme.colors.secondary as string}
                    />
                  </View>
                  <Text style={styles.name}>{m.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Show Join Mentor ONLY if viewing OWN profile and Role is Student */}
          {!isViewingStudent && displayedUser?.role === 'student' && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('JoinMentor' as never)}
              style={styles.actionButton}>
              Join a Mentor
            </Button>
          )}
        </View>

        {/* Logout only if viewing OWN profile */}
        {!isViewingStudent && (
          <Button
            mode="contained"
            onPress={handleLogout}
            buttonColor={lightTheme.colors.danger as string}
            loading={loading}
            disabled={loading}
            style={styles.logoutButton}>
            Log Out
          </Button>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lightTheme.colors.primary,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: lightTheme.colors.text,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  role: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: lightTheme.colors.secondary,
    backgroundColor: '#f0f0f8',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  section: {
    marginBottom: 30,
    backgroundColor: lightTheme.colors.card,
    borderRadius: 10,
    padding: 20,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: lightTheme.colors.primary,
    letterSpacing: 2,
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 'auto',
  },
  marginTop: {
    marginTop: 10,
  },
});
