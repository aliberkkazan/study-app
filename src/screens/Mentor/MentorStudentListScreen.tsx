import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchStudents, removeStudent } from '../../redux/dataSlice';
import { useTheme } from '@/theme';
import { useFocusEffect } from '@react-navigation/native';
import { MentorStudentListCard } from './components';
import { Loading, IconButton } from '@/components';

const MentorStudentListScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, loading } = useSelector((state: RootState) => state.data);
  const { colors } = useTheme();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const loadStudents = React.useCallback(async () => {
    if (isAuthenticated) {
      await dispatch(fetchStudents());
    }
  }, [dispatch, isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      loadStudents();
    }, [loadStudents]),
  );

  // Auto-redirect removed by request

  // Set Header Options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          style={{ marginRight: 8 }}
          onPress={() => navigation.navigate('Profile')}
          icon="account-circle-outline"
          size={30}
          iconColor={colors.primary as string}
        />
      ),
    });
  }, [navigation, colors.primary]);

  const handleSelectStudent = (student: any) => {
    navigation.navigate('MentorDashboard', { student });
  };

  const handleDeleteStudent = (student: any) => {
    Alert.alert(
      'Remove Student',
      'Are you sure you want to delete this student from your students?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            dispatch(removeStudent(student.id));
          },
        },
      ],
    );
  };

  return (
    <>
      <Loading visible={loading} />
      <View style={styles.container}>
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadStudents} />
          }
          renderItem={({ item }) => (
            <MentorStudentListCard
              item={item}
              onPress={handleSelectStudent}
              onDelete={handleDeleteStudent}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No students found.</Text>
              <Text style={styles.subText}>Ask students to add your code.</Text>
            </View>
          }
        />
      </View>
    </>
  );
};

export default MentorStudentListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    color: '#ccc',
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
