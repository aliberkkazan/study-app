export * from './components';
export * from './theme';

export interface FilterType {
    pageNumber?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    filter?: Record<string, any>;
}
