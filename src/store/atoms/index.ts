import { atom } from 'recoil';

export const exampleState = atom({
    key: 'exampleState',
    default: {
        value: '',
        isLoading: false,
        error: null,
    },
});

interface User {
    userId: string;
}

export const authState = atom({
    key: 'authState',
    default: {
        isLoggedIn: false,
        user: null as User | null,
    },
});
