import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { captureException } from 'common/errorLogger';

interface User {
  name: string;
  avatar?: string;
  premium: boolean;
  github?: {
    premium?: boolean;
    expires?: string;
  };
  patreon?: {
    premium?: boolean;
  };
  wcl?: {
    validAuth?: boolean;
  };
}

export const fetchUser = createAsyncThunk<User | null>('user/fetchUser', async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_BASE}user`, {
      credentials: 'include',
    });

    if (response.status !== 200) {
      if (response.status === 401 || response.status === 403) {
        // Unauthorized
        // We need to store this explicitely so we know the diff between "unknown" and "logged out"
        return false;
      }
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data satisfies User;
  } catch (err: unknown) {
    captureException(err, {
      extra: {
        location: 'user',
      },
    });
    // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
  }
});

export const logout = createAsyncThunk('user/logout', async () => {
  try {
    await fetch(`${import.meta.env.VITE_SERVER_BASE}logout`, {
      credentials: 'include',
    });
  } catch (err: unknown) {
    captureException(err);
    console.error(err);
    // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
  }
  return;
});

// Link account actions (these trigger OAuth flows, similar to login)
// These are simple functions, not async thunks since they redirect
export function linkPatreon() {
  window.location.href = `${import.meta.env.VITE_SERVER_BASE}link/patreon`;
}

export function linkGitHub() {
  window.location.href = `${import.meta.env.VITE_SERVER_BASE}link/github`;
}

// Unlink account actions (API calls that refresh user state)
export const unlinkPatreon = createAsyncThunk<User>('user/unlinkPatreon', async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_BASE}unlink/patreon`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to unlink Patreon');
    }
    return (await response.json()) satisfies User;
  } catch (err: unknown) {
    captureException(err, {
      extra: {
        location: 'user/unlinkPatreon',
      },
    });
    throw err;
  }
});

export const unlinkGitHub = createAsyncThunk<User>('user/unlinkGitHub', async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_BASE}unlink/github`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to unlink GitHub');
    }
    return (await response.json()) satisfies User;
  } catch (err: unknown) {
    captureException(err, {
      extra: {
        location: 'user/unlinkGitHub',
      },
    });
    throw err;
  }
});

type UserState = User | null;
const initialState: UserState = null as UserState;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      const payload = action.payload;
      return payload;
    });
    builder.addCase(logout.fulfilled, () => {
      return null;
    });
    builder.addCase(unlinkPatreon.fulfilled, (state, action) => {
      return action.payload; // Updated user from backend
    });
    builder.addCase(unlinkGitHub.fulfilled, (state, action) => {
      return action.payload; // Updated user from backend
    });
  },
});

export default userSlice.reducer;
