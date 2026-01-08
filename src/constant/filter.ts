import { FilterType } from '@/types';

export const DATE_SCHEMAS = {
    today: 1,
    'last week': 7,
    'last month': 30,
};

export const initialFilter: FilterType = {
    pageNumber: 1,
    pageSize: 20,
    sortField: 'id',
    sortOrder: 'desc',
    filter: {
        active: 1,
    },
};
