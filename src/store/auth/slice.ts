import { createSelector } from '@reduxjs/toolkit';
import { buildAuthSlice } from '@adamldoyle/react-aws-auth-redux-slice';
import { IRootState } from '../types';

const { authSlice, authSelectors, AuthInjector } = buildAuthSlice<IRootState>();

export const selectEmail = createSelector(authSelectors.selectProfile, (profile) => profile?.email || null);

const selectors = { ...authSelectors, selectEmail };
const reducer = authSlice.reducer;
export { selectors, AuthInjector, reducer };
