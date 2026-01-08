import React, {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../redux/store';
import {fetchSubmissions} from '../../redux/dataSlice';
import {lightTheme} from '../../theme/theme';
import {SubmissionCard} from './components';
import {Loading} from '@/components';

const StudentSubmissionsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {submissions, loading} = useSelector((state: RootState) => state.data);
  const {user} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchSubmissions());
  }, [dispatch]);

  // Filter submissions for current student
  const mySubmissions = submissions
    .filter(s => s.student.id === user?.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <>
      <Loading visible={loading} />
      <View style={styles.container}>
        <Text style={styles.header}>My Submissions</Text>
        {mySubmissions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No submissions yet.</Text>
          </View>
        ) : (
          <FlatList
            data={mySubmissions}
            keyExtractor={item => item.id}
            renderItem={({item}) => <SubmissionCard item={item} />}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => dispatch(fetchSubmissions())}
              />
            }
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: lightTheme.colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default StudentSubmissionsScreen;
