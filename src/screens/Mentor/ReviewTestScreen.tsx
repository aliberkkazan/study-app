import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../redux/store';
import {reviewSubmission, fetchSubmissions} from '../../redux/dataSlice';
import {lightTheme} from '../../theme/theme';
import SubmissionCard from './components/SubmissionCard';
import {Loading} from '@/components';

const ReviewTestScreen = ({route}: any) => {
  const {student} = route.params;
  const submissions = useSelector((state: RootState) => state.data.submissions);
  const {loading} = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    dispatch(fetchSubmissions());
  }, [dispatch]);

  // Internal state for feedback management
  const [feedbackMap, setFeedbackMap] = useState<{[key: string]: string}>({});

  const handleReview = (id: string, approved: boolean) => {
    const feedback =
      feedbackMap[id] || (approved ? 'Great work!' : 'Please check again.');

    dispatch(
      reviewSubmission({
        id,
        status: approved ? 'approved' : 'rejected',
        feedback: feedback,
      }) as any,
    );

    // Clear feedback for this item
    setFeedbackMap(prev => {
      const next = {...prev};
      delete next[id];
      return next;
    });
  };

  const updateFeedback = (id: string, text: string) => {
    setFeedbackMap(prev => ({...prev, [id]: text}));
  };

  const filteredSubmissions = submissions
    .filter(
      item =>
        item.student.id === student.id &&
        (activeTab === 'pending'
          ? item.status === 'pending'
          : item.status !== 'pending'),
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <>
      <Loading visible={loading} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Submissions</Text>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
              onPress={() => setActiveTab('pending')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'pending' && styles.activeTabText,
                ]}>
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'history' && styles.activeTabText,
                ]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={filteredSubmissions}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={() => dispatch(fetchSubmissions())}
          renderItem={({item}) => (
            <SubmissionCard
              item={item}
              feedback={feedbackMap[item.id] || ''}
              onFeedbackChange={text => updateFeedback(item.id, text)}
              onReview={approved => handleReview(item.id, approved)}
              loading={loading}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {activeTab} submissions</Text>
            </View>
          }
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: lightTheme.colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.card,
    padding: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: lightTheme.colors.primary,
  },
  tabText: {
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  activeTabText: {
    color: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReviewTestScreen;
