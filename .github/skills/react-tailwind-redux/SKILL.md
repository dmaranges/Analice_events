---
name: react-tailwind-redux
description: Standards for generating React-Redux components styled with utility-first Tailwind CSS.
user-invocable: true
---

# React & Tailwind CSS Coding Standards

## 1. React and Redux Components Architecture

- **Architecture Paradigm:** Functional components with arrow functions exclusively (`const Component = () => {}`).
- **React 19 Concurrent & Form Management:**
  - **Rule 1 (Actions over Interceptors):** Prioritize React 19 `useActionState` for handling local form submission workflows (e.g., login, onboarding, metadata edits). Do NOT use legacy `useState` triggers for pending status or validation errors.
  - **Rule 2 (Contextual Form Elements):** Use `useFormStatus` inside atomic sub-components (such as submit buttons) to eliminate prop-drilling of loading states.
  - **Rule 3 (The `use` API):** Use the new `use()` hook for consuming light React Contexts (e.g., theme, responsive layouts), keeping `useSelector` strictly for data fetching.
- **Modern React-Redux (`@reduxjs/toolkit`):**
  - **Syntax Standards:** Use `createSlice`, `createAsyncThunk`, and `configureStore` exclusively. Pure legacy boilerplate is strictly prohibited.
  - **Encapsulation:** Maintain clean structural separation. Slice files must live inside their corresponding feature folder (e.g., `features/auth/authSlice.js`).
  - **State Boundaries:** Redux must govern global synchronized data layers (e.g., cached arrays of active `cycles` or current `schedules`). Transient view states, form input captures, and mutation loaders must remain local to React 19 Actions.
  - **Hooks Integration:** Interact with the store using `useDispatch` and `useSelector` custom hooks.

## 2. Tailwind CSS Styling Guidelines

- **Utility-First:** Never use inline `style={{}}` objects or external vanilla `.css` files. Everything must be written inline via Tailwind utility classes.
- **Responsiveness:** Always design Mobile-First. Use `md:` and `lg:` prefixes explicitly to handle layout switches (e.g., `grid grid-cols-1 md:grid-cols-3`).
- **Dynamic Classes:** Never concatenate partial Tailwind class names (e.g., `text-${color}-500` is invalid). Use full explicit strings or a map dictionary object and never concatenate partial class names:
  ```javascript
  const colorVariants = {
    danger: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
  };
  ```
- **No Custom CSS:** Avoid custom CSS classes or stylesheets. If a design cannot be achieved with Tailwind utilities, reconsider the design or use Tailwind's `@apply` directive in a separate file for complex patterns.
- **Consistent Spacing:** Use Tailwind's spacing scale consistently (e.g., `p-4`, `m-2`) and avoid arbitrary values.

## 3. Request Minimization & Caching Strategies (Strict Efficiency Rules)

- **Rule 3.1: State Validation Before Fetching**
  Before dispatching an asynchronous thunk (`createAsyncThunk`) to fetch data, always check the current state. If data is already present and valid, skip the network request entirely.
  _Example pattern to generate:_

  ```javascript
  const handleFetchData = () => {
    if (dataList.length === 0) {
      // Only fetch if the global cache is empty
      dispatch(fetchDataThunk());
    }
  };
  ```

- **Rule 3.2: Single Source of Truth for Shared Data**
  Never fetch the same data in multiple sibling components. Fetch once at the parent/layout level, store it in Redux, and let children consume it via useSelector.

- **Rule 3.3: Use Memoized Selectors**
  Use createSelector from Redux Toolkit for computing derived state. This prevents unnecessary component re-renders and re-computations when unrelated state changes.

- **Rule 3.4: Optimistic Updates**
  For mutation actions (e.g., editing or deleting an item), update the Redux state optimistically before receiving the server confirmation. Rollback only if the API returns an error. This avoids full page/list re-fetches.
