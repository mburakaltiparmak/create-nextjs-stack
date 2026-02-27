import { combineReducers } from '@reduxjs/toolkit';
// Import your reducers here
// import exampleReducer from './exampleReducer';

const rootReducer = combineReducers({
  // example: exampleReducer,
  // Add a placeholder to prevent error if no reducers yet
  _placeholder: (state = {}) => state,
});

export default rootReducer;
