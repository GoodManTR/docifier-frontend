import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import PropTypes from "prop-types";
import { loginRequest, logoutRequest } from "../api/auth";
import { createDocumentation, deleteDocumentation, getDocsRequest } from "../api/documentation";
import { getDocumentationTreeReq } from "../api/docTree";
import { getDocumentationSheetReq, saveDocumentationSheetReq } from "../api/docSheet";

const HANDLERS = {
  INITIALIZE: "INITIALIZE",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  GET_DOCS: "GET_DOCS",
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const { user , session } = action.payload;
    
    if (user && session) {
      
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user,
        session,
      }
    }

    return {
      ...state,
      isLoading: false,
    }
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const { user , session } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
      session,
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
      session: null,
    };
  },
  [HANDLERS.GET_DOCS]: (state, action) => {
    const { docs } = action.payload;
    return {
      ...state,
      docs
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const session = window.localStorage.getItem("session");
    const user = window.localStorage.getItem("user");

    dispatch({
      type: HANDLERS.INITIALIZE,
      payload: {
        user: user ? JSON.parse(user) : null,
        session: session ? JSON.parse(session): null,
      },
    });
  };

  useEffect(() => {
    initialize()
  }, [])

  const signIn = async (email, password) => {
    const request = await loginRequest({ email, password });

    if (request.success === false) {
      throw new Error(request.error.message);
    }

    console.log(request.data);

    try {
      window.localStorage.setItem("session", JSON.stringify(request.data.session));
      window.localStorage.setItem("user", JSON.stringify(request.data.user));
    } catch (err) {
      console.error(err);
    }

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: {
        user: request.data.user,
        session: request.data.session,
      },
    });
  };

  const signUp = async (email, name, password) => {
    throw new Error("Sign up is not implemented");
  };

  const signOut = async () => {
    const request = await logoutRequest({ userId: state.user.userId, accessToken: state.session.accessToken });

    if (request.success === false) {
      console.log(request.error.message);
    }

    window.localStorage.removeItem("session");
    window.localStorage.removeItem("user");
   
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  const getDocs = async () => {
    const request = await getDocsRequest({ accessToken: state.session.accessToken });

    if (request.success === false) {
      console.log(request.error.message);
    }
    
    window.localStorage.setItem("docs", JSON.stringify(request.data));
   
    dispatch({
      type: HANDLERS.GET_DOCS,
      payload: {
        docs: request.data
      },
    });
    return request.data;
  };

  const createDoc = async (title) => {
    const request = await createDocumentation({ accessToken: state.session.accessToken, title });

    if (request.success === false) {
      console.log(request.error.message);
    }
    
    return request.data;
  };

  const deleteDoc = async (docId: string) => {
    const request = await deleteDocumentation({ accessToken: state.session.accessToken, docId });

    if (request.success === false) {
      console.log(request.error.message);
    }
    
    return request.data;
  };

  const getDocTree = async (docId: string) => {
    const request = await getDocumentationTreeReq({ accessToken: state.session.accessToken, docId });

    if (request.success === false) {
      console.log(request.error.message);
    }
    
    return request.data;
  };

  const getDocSheet = async (docId: string, sheetId: string) => {
    const request = await getDocumentationSheetReq({ docId, sheetId, accessToken: state.session.accessToken });

    if (request.success === false) {
      console.log(request.error.message);
    }
    
    return request.data;
  };

  const saveDocSheet = async (docId: string, sheetId: string, data: string) => {
    const request = await saveDocumentationSheetReq({ docId, sheetId, data, accessToken: state.session.accessToken });

    if (request.success === false) {
      console.log(request.error.message);
    }
    
    return request.data;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,

        getDocs,
        createDoc,
        deleteDoc,

        getDocTree,

        getDocSheet,
        saveDocSheet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};


export const useAuthContext = () => useContext(AuthContext);
