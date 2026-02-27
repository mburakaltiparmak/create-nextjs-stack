import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '.';

// Pre-typed hooks — use these instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
