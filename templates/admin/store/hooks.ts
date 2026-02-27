import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '.';

/**
 * Typed hook wrappers — use these instead of plain useDispatch/useSelector.
 * @example const dispatch = useAppDispatch();
 * @example const value = useAppSelector((state) => state.someSlice.value);
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
