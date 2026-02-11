import { combineReducers } from 'redux';
// Import your reducers here
// import exampleReducer from './exampleReducer';

const rootReducer = combineReducers({
  // example: exampleReducer,
  // Add a placeholder to prevent error if no reducers yet
  _placeholder: (state = {}) => state
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
